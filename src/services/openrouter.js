import { OPENROUTER } from '../config';
import { checkQuestionRateLimit, checkEvaluationRateLimit } from './rateLimiter';
import { validateTestConfig, checkSecurityThreats } from './inputValidator';
import { openrouterPrompts } from './openrouterPrompts';
import { cleanAndParseQuestionJSON } from '../utils/aiJson';
import fallbackQuestions from '../constants/fallbackQuestions';
import { buildUniqueContext as buildUniqueTopicContext, extractTopicFromQuestion as extractTopicUtil } from '../utils/topics';
import { validateQuestion as validateQuestionSchema, postprocessQuestion } from '../utils/questionSchema';

// OpenRouter AI service for question generation and evaluation
// const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL;

class OpenRouterService {
  constructor() {
    this.apiKey = OPENROUTER.apiKey;
    this.baseUrl = OPENROUTER.baseUrl;
    this.maxRetries = OPENROUTER.maxRetries;
    this.baseDelay = OPENROUTER.baseDelayMs; // 1 second

    // Session tracking for topic variation
    this.sessionTopics = new Map(); // key: moduleId, value: string[] of topics
    this.sessionIds = new Map(); // key: moduleId, value: sessionId string

    // Log configuration status on initialization
    this.logConfigurationStatus();
  }

  logConfigurationStatus() {
    console.log('OpenRouter Service Configuration:');
    console.log('- API Key configured:', !!this.apiKey && this.apiKey !== 'your-openrouter-api-key-here');
    console.log('- Base URL:', this.baseUrl);
    console.log('- Max Retries:', this.maxRetries);

    if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
      console.warn('⚠️ OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in your .env file');
    }

    if (!this.baseUrl || this.baseUrl === 'your-base-url-here') {
      console.warn('⚠️ OpenRouter base URL not configured. Please set VITE_OPENROUTER_BASE_URL in your .env file');
    }
  }

  buildHeaders() {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': OPENROUTER.appTitle,
    };
    // Only set Referer in browser context
    if (typeof window !== 'undefined' && window.location?.origin) {
      headers['HTTP-Referer'] = window.location.origin;
    }
    return headers;
  }

  // Utility function for delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Exponential backoff calculation
  calculateDelay(attempt) {
    return this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }

  // Check if an error is retryable
  shouldRetry(error) {
    if (!error) return false;

    const message = error.message || '';

    // Retry on network errors, rate limits, and server errors
    if (message.includes('Retryable API error')) return true;
    if (message.includes('rate limit')) return true;
    if (message.includes('timeout')) return true;
    if (message.includes('503')) return true;
    if (message.includes('502')) return true;
    if (message.includes('500')) return true;
    if (message.includes('429')) return true;

    // Don't retry on authentication, permission, or configuration errors
    if (message.includes('401')) return false;
    if (message.includes('403')) return false;
    if (message.includes('404')) return false;
    if (message.includes('not configured')) return false;

    return false;
  }

  async makeRequest(endpoint, data, retryCount = 0) {
    try {
      // Validate API key and base URL
      if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
        throw new Error('OpenRouter API key not configured');
      }

      if (!this.baseUrl || this.baseUrl === 'your-base-url-here') {
        throw new Error('OpenRouter base URL not configured');
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(data),
      });

      // Handle different error types
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);

        // Log the request details for debugging
        console.error('Request details:', {
          endpoint: `${this.baseUrl}${endpoint}`,
          model: data.model,
          status: response.status
        });

        // Check if it's a retryable error
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Retryable API error: ${response.status} - ${errorText}`);
        }

        // For 404 errors, provide more specific feedback
        if (response.status === 404) {
          throw new Error(`API endpoint not found (404). Check the base URL configuration.`);
        }

        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(
        `OpenRouter API request failed (attempt ${retryCount + 1}):`,
        error
      );

      // Check if we should retry
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        const delayMs = this.calculateDelay(retryCount);
        console.log(`Retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
        return this.makeRequest(endpoint, data, retryCount + 1);
      }

      throw error;
    }
  }

  // Build main prompt for first attempt via centralized prompt module
  buildMainPrompt(testType, section, difficulty, uniqueContext) {
    const topic = uniqueContext?.unusedTopics?.[section]?.[0] || undefined;
    return openrouterPrompts.buildQuestionPrompt({ testType, section, difficulty, topic, uniqueContext });
  }

  // Build simplified prompt for retries
  buildRetryPrompt(testType, section, difficulty) {
    return openrouterPrompts.buildRetryPrompt({ testType, section, difficulty });
  }

  // Build prompt for learning questions
  buildLearningQuestionPrompt(topic, testType, section, difficulty, includePassage) {
    return openrouterPrompts.buildLearningQuestionPrompt({ topic, testType, section, difficulty, includePassage });
  }

  // Build evaluation prompt (text or json)
  buildEvaluationPrompt(stats, returnFormat = 'text') {
    return openrouterPrompts.buildEvaluationPrompt({ stats, returnFormat });
  }

  // Robust JSON cleaning and parsing function
  cleanAndParseJSON(content) {
    return cleanAndParseQuestionJSON(content);
  }

  // Delegate topic extraction to utils
  extractTopicFromQuestion(question) {
    return extractTopicUtil(question);
  }

  // Delegate unique context building to utils
  generateUniqueContext(questionContext = {}) {
    return buildUniqueTopicContext(questionContext);
  }

  // Fallback question generator for when AI fails
  generateFallbackQuestion(testType, section, difficulty) {
    const questions = fallbackQuestions[testType]?.[section];
    if (!questions) {
      // Try alternative section mappings
      let alternativeSection = section;
      if (section === 'integrated' && testType === 'GMAT') {
        // For GMAT integrated, we now have fallbacks
        console.warn(`No fallback questions found for ${testType} ${section}`);
      } else if (section === 'writing') {
        alternativeSection = 'verbal';
      } else if (section === 'integrated') {
        alternativeSection = 'quantitative';
      }

      const altQuestions = fallbackQuestions[testType]?.[alternativeSection];
      if (!altQuestions) {
        throw new Error(
          `No fallback questions available for ${testType} ${section} (tried ${alternativeSection} as alternative)`
        );
      }

      console.warn(`Using ${alternativeSection} fallback for ${section}`);
      const difficultyQuestions =
        altQuestions[difficulty] || altQuestions.easy || altQuestions.medium;
      return {
        ...difficultyQuestions,
        testType,
        section: alternativeSection, // Use the alternative section
        difficulty,
        isFallback: true,
      };
    }

    const difficultyQuestions =
      questions[difficulty] || questions.easy || questions.medium;
    return {
      ...difficultyQuestions,
      testType,
      section,
      difficulty,
      isFallback: true,
    };
  }

  async generateQuestion(
    testType,
    section,
    difficulty = "medium",
    retryCount = 0,
    questionContext = {}
  ) {
    // Early exit for configuration issues
    if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
      console.warn('OpenRouter API key not configured, using fallback question');
      return this.generateFallbackQuestion(testType, section, difficulty);
    }

    if (!this.baseUrl || this.baseUrl === 'your-base-url-here') {
      console.warn('OpenRouter base URL not configured, using fallback question');
      return this.generateFallbackQuestion(testType, section, difficulty);
    }

    // Validate input parameters
    const configValidation = validateTestConfig({
      testType,
      section,
      difficulty,
      questionCount: 1 // Single question
    });

    if (!configValidation.isValid) {
      throw new Error(`Invalid parameters: ${configValidation.errors.join(', ')}`);
    }

    // Check for security threats
    const securityCheck = checkSecurityThreats(`${testType} ${section} ${difficulty}`);
    if (securityCheck.hasThreats) {
      throw new Error('Security violation detected in request parameters');
    }

    // Check rate limits before making API call
    const rateLimitCheck = checkQuestionRateLimit();
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.reason);
    }

    // Updated model list with more reliable options
    const models = [
      "google/gemma-3-4b-it",
      "qwen/qwen3-235b-a22b:free",
      "deepseek/deepseek-chat-v3-0324:free",
      "deepseek/deepseek-r1:free",
      "qwen/qwen3-235b-a22b:free",
    ];

    // Fallback to a working free model if retries exceed available paid models
    const modelIndex = Math.min(retryCount, models.length - 1);
    const currentModel = models[modelIndex];

    console.log(`Using model: ${currentModel} (attempt ${retryCount + 1})`);

    // Generate unique context for this question
    const uniqueContext = this.generateUniqueContext(questionContext);

    // Simplified prompt strategy - focus on getting valid JSON
    const basePrompt = retryCount === 0
      ? this.buildMainPrompt(testType, section, difficulty, uniqueContext)
      : this.buildRetryPrompt(testType, section, difficulty);

    const data = {
      model: currentModel,
      messages: [
        {
          role: "system",
          content: `You are a test prep instructor. You MUST respond with pure JSON only - no markdown, no code blocks, no explanations. 

REQUIRED JSON Format:
{
  "question": "question text here",
  "options": ["option 1", "option 2", "option 3", "option 4", "option 5"],
  "correctAnswer": 0,
  "explanation": "explanation text"
}

CRITICAL RULES:
- Use double quotes for all strings
- correctAnswer must be a number (0-4)
- No LaTeX symbols ($, \\frac, \\times) - use plain English
- No code blocks or markdown formatting
- Return ONLY the JSON object`
        },
        {
          role: "user",
          content: basePrompt,
        },
      ],
      temperature: retryCount === 0 ? 0.7 : 0.2, // More deterministic for retries
      max_tokens: 1000, // Shorter responses to avoid rambling
      top_p: 0.8,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      const content = response.choices[0].message.content;

      // Use robust JSON parsing
      const parsedQuestion = this.cleanAndParseJSON(content);

      // Validate the parsed question
      if (this.validateQuestion(parsedQuestion)) {
        // Ensure required fields are present and clean up any empty fields
        let finalized = { ...parsedQuestion, testType, section, difficulty };

        // Extract and store topic for tracking uniqueness
        if (uniqueContext?.sessionId) {
          finalized.topic = this.extractTopicFromQuestion(finalized);
          finalized.sessionId = uniqueContext.sessionId;
          finalized.questionIndex = uniqueContext.questionIndex;
        }

        // Post-process images and passage
        finalized = postprocessQuestion(finalized);

        return finalized;
      } else {
        throw new Error("Generated question failed validation");
      }
    } catch (error) {
      console.error(
        `Failed to generate question (attempt ${retryCount + 1}):`,
        error
      );

      // Provide specific feedback for different error types
      if (error.message.includes('not configured')) {
        console.error('Configuration Error: OpenRouter API key or base URL not properly set');
        throw new Error('AI service not configured. Please check your environment variables.');
      }

      if (error.message.includes('API endpoint not found')) {
        console.error('API Error: Invalid endpoint or API down');
        throw new Error('AI service temporarily unavailable. Using fallback questions.');
      }

      // If it's a JSON parsing error, log the content for debugging
      if (error.message.includes('JSON parsing strategies failed')) {
        console.log('JSON parsing failed, this usually means AI returned malformed JSON');
        console.log('Will retry with different model and improved prompting...');
      } else if (error.message.includes('Response does not contain JSON')) {
        console.log('AI returned explanatory text instead of JSON, retrying with stronger prompt...');
      }

      // Retry with different model or approach
      if (retryCount < this.maxRetries) {
        console.log(`Retrying with different model (${retryCount + 1}/${this.maxRetries})...`);
        await this.delay(this.calculateDelay(retryCount));
        return this.generateQuestion(
          testType,
          section,
          difficulty,
          retryCount + 1,
          questionContext
        );
      }

      // Final fallback: use predefined question
      console.warn(
        "All AI generation attempts failed, using fallback question"
      );
      return this.generateFallbackQuestion(testType, section, difficulty);
    }
  }

  // Validate question structure
  validateQuestion(question) {
    return validateQuestionSchema(question);
  }

  // Generate multiple questions for lazy loading
  async getQuestionsLazy(moduleId, difficulty = "medium", totalQuestions = 25, batchSize = 5) {
    try {
      console.log(`Generating initial batch of ${batchSize} questions for module ${moduleId}`);

      // For now, we'll use the module ID to determine test type and section
      // This is a simplified mapping - you might want to enhance this based on your module structure
      const testType = moduleId.includes('gmat') ? 'GMAT' : 'GRE';
      const section = this.inferSectionFromModuleId(moduleId);

      const questions = [];
      const errors = [];

      // Prepare session topic tracking
      const sessionKey = moduleId;
      let previousTopics = this.sessionTopics.get(sessionKey) || [];
      let sessionId = this.sessionIds.get(sessionKey);
      if (!sessionId) {
        sessionId = `${sessionKey}-${Date.now()}`;
        this.sessionIds.set(sessionKey, sessionId);
      }

      // Generate initial batch of questions
      for (let i = 0; i < batchSize; i++) {
        try {
          const question = await this.generateQuestion(
            testType,
            section,
            difficulty,
            0,
            { questionIndex: i, previousTopics, sessionId }
          );
          if (this.validateQuestion(question)) {
            questions.push({
              ...question,
              id: `${moduleId}_${Date.now()}_${i}`,
              moduleId,
              difficulty,
              timestamp: Date.now()
            });
            // Track topic to avoid repetition
            if (question.topic && !previousTopics.includes(question.topic)) {
              previousTopics.push(question.topic);
              // cap list to recent 30 topics
              if (previousTopics.length > 30) previousTopics = previousTopics.slice(-30);
              this.sessionTopics.set(sessionKey, previousTopics);
            }
          }
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1}:`, error);
          errors.push(error);
        }
      }

      // If we failed to generate enough questions, fill with fallbacks
      while (questions.length < batchSize) {
        const fallback = this.generateFallbackQuestion(testType, section, difficulty);
        const fbQuestion = {
          ...fallback,
          id: `${moduleId}_fallback_${Date.now()}_${questions.length}`,
          moduleId,
          difficulty,
          timestamp: Date.now()
        };
        questions.push(fbQuestion);
        const fbTopic = this.extractTopicFromQuestion(fbQuestion);
        if (fbTopic && !previousTopics.includes(fbTopic)) {
          previousTopics.push(fbTopic);
          if (previousTopics.length > 30) previousTopics = previousTopics.slice(-30);
          this.sessionTopics.set(sessionKey, previousTopics);
        }
      }

      return {
        questions,
        totalQuestions,
        batchSize,
        currentBatch: 1,
        hasMore: questions.length < totalQuestions,
        errors: errors.length > 0 ? errors : null
      };

    } catch (error) {
      console.error('Error in getQuestionsLazy:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  // Get next batch of questions
  async getNextQuestionBatch(moduleId, difficulty = "medium", startIndex = 0, batchSize = 5) {
    try {
      console.log(`Generating next batch of ${batchSize} questions starting from index ${startIndex}`);

      const testType = moduleId.includes('gmat') ? 'GMAT' : 'GRE';
      const section = this.inferSectionFromModuleId(moduleId);

      const questions = [];

      // Session tracking
      const sessionKey = moduleId;
      let previousTopics = this.sessionTopics.get(sessionKey) || [];
      let sessionId = this.sessionIds.get(sessionKey);
      if (!sessionId) {
        sessionId = `${sessionKey}-${Date.now()}`;
        this.sessionIds.set(sessionKey, sessionId);
      }

      // Generate batch of questions
      for (let i = 0; i < batchSize; i++) {
        try {
          const question = await this.generateQuestion(
            testType,
            section,
            difficulty,
            0,
            { questionIndex: startIndex + i, previousTopics, sessionId }
          );
          if (this.validateQuestion(question)) {
            questions.push({
              ...question,
              id: `${moduleId}_${Date.now()}_${startIndex + i}`,
              moduleId,
              difficulty,
              timestamp: Date.now()
            });
            if (question.topic && !previousTopics.includes(question.topic)) {
              previousTopics.push(question.topic);
              if (previousTopics.length > 30) previousTopics = previousTopics.slice(-30);
              this.sessionTopics.set(sessionKey, previousTopics);
            }
          }
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1} in batch:`, error);
          // Generate fallback for failed question
          const fallback = this.generateFallbackQuestion(testType, section, difficulty);
          const fbQuestion = {
            ...fallback,
            id: `${moduleId}_fallback_${Date.now()}_${startIndex + i}`,
            moduleId,
            difficulty,
            timestamp: Date.now()
          };
          questions.push(fbQuestion);
          const fbTopic = this.extractTopicFromQuestion(fbQuestion);
          if (fbTopic && !previousTopics.includes(fbTopic)) {
            previousTopics.push(fbTopic);
            if (previousTopics.length > 30) previousTopics = previousTopics.slice(-30);
            this.sessionTopics.set(sessionKey, previousTopics);
          }
        }
      }

      // If we failed to generate enough questions, fill with fallbacks
      while (questions.length < batchSize) {
        const fallback = this.generateFallbackQuestion(testType, section, difficulty);
        const fbQuestion = {
          ...fallback,
          id: `${moduleId}_fallback_${Date.now()}_${startIndex + questions.length}`,
          moduleId,
          difficulty,
          timestamp: Date.now()
        };
        questions.push(fbQuestion);
        const fbTopic = this.extractTopicFromQuestion(fbQuestion);
        if (fbTopic && !previousTopics.includes(fbTopic)) {
          previousTopics.push(fbTopic);
          if (previousTopics.length > 30) previousTopics = previousTopics.slice(-30);
          this.sessionTopics.set(sessionKey, previousTopics);
        }
      }

      return questions;

    } catch (error) {
      console.error('Error in getNextQuestionBatch:', error);
      throw new Error(`Failed to generate question batch: ${error.message}`);
    }
  }

  async evaluatePerformance(testResults, retryCount = 0) {
    // Check rate limits before making API call
    const rateLimitCheck = checkEvaluationRateLimit();
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.reason);
    }

    if (!testResults || testResults.length === 0) {
      return "No test data available for performance analysis.";
    }

    // Extract meaningful patterns from the test data
    const recentTests = testResults.slice(0, 5); // Last 5 tests

    // Calculate overall statistics from all test questions
    let totalQuestions = 0;
    let correctAnswers = 0;
    let cumulativeTime = 0;
    const allQuestions = [];

    testResults.forEach((test) => {
      if (test.questions && Array.isArray(test.questions)) {
        test.questions.forEach((question) => {
          allQuestions.push(question);
          totalQuestions++;
          if (question.isCorrect) {
            correctAnswers++;
          }
          if (typeof question.timeSpent === 'number') cumulativeTime += question.timeSpent;
        });
      }
    });

    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const averageQuestionTime = totalQuestions > 0 ? Math.round(cumulativeTime / totalQuestions) : 0;

    // Analyze patterns
    const sectionPerformance = {};
    const difficultyPerformance = {};

    allQuestions.forEach((question) => {
      // Section analysis
      const section = question.section || "Unknown";
      if (!sectionPerformance[section]) {
        sectionPerformance[section] = {
          correct: 0,
          total: 0,
          avgTime: 0,
        };
      }
      sectionPerformance[section].total++;
      if (question.isCorrect) sectionPerformance[section].correct++;
      sectionPerformance[section].avgTime += question.timeSpent || 0;

      // Difficulty analysis
      const difficulty = question.difficulty || "Unknown";
      if (!difficultyPerformance[difficulty]) {
        difficultyPerformance[difficulty] = { correct: 0, total: 0 };
      }
      difficultyPerformance[difficulty].total++;
      if (question.isCorrect) difficultyPerformance[difficulty].correct++;
    });

    // Calculate averages and trends
    Object.keys(sectionPerformance).forEach((section) => {
      const data = sectionPerformance[section];
      data.accuracy = Math.round((data.correct / data.total) * 100);
      data.avgTime = Math.round(data.avgTime / data.total);
    });

    const prompt = `As an expert test prep tutor, analyze this student's performance data and provide specific, actionable insights:

PERFORMANCE DATA:
- Total Questions: ${totalQuestions}
- Overall Accuracy: ${accuracy}%
- Test Type: ${testResults[0]?.testType || "Unknown"}
- Number of Tests Taken: ${testResults.length}

SECTION BREAKDOWN:
${Object.entries(sectionPerformance)
        .map(
          ([section, data]) =>
            `${section}: ${data.accuracy}% accuracy (${data.correct}/${data.total}), avg ${data.avgTime}s per question`
        )
        .join("\n")}

DIFFICULTY BREAKDOWN:
${Object.entries(difficultyPerformance)
        .map(
          ([difficulty, data]) =>
            `${difficulty}: ${Math.round(
              (data.correct / data.total) * 100
            )}% accuracy (${data.correct}/${data.total})`
        )
        .join("\n")}

RECENT TEST PERFORMANCE:
${recentTests
        .map((test, i) => {
          const testCorrect = test.questions
            ? test.questions.filter((q) => q.isCorrect).length
            : 0;
          const testTotal = test.questions ? test.questions.length : 0;
          const testAccuracy =
            testTotal > 0 ? Math.round((testCorrect / testTotal) * 100) : 0;
          return `Test ${i + 1
            }: ${testAccuracy}% accuracy (${testCorrect}/${testTotal}) - ${test.testType
            } ${test.section}`;
        })
        .join("\n")}

Please provide a concise, personalized analysis focusing on:

1. **Key Insights**: What specific patterns do you see? What's the student doing well vs struggling with?

2. **Priority Actions**: What should they focus on FIRST to get the biggest improvement?

3. **Specific Study Plan**: Give 3-4 concrete, actionable steps they can take this week.

4. **Test-Taking Strategy**: Any specific advice for timing, question approach, or test day tactics?

5. **Motivation**: One encouraging insight and realistic expectation for improvement.

Keep it concise (under 300 words), specific to their data, and immediately actionable. Avoid generic advice.`;

    const data = {
      model: "google/gemma-3-4b-it",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      return response.choices[0].message.content;
    } catch (error) {
      console.error(
        `Failed to evaluate performance (attempt ${retryCount + 1}):`,
        error
      );

      if (retryCount < this.maxRetries) {
        await this.delay(this.calculateDelay(retryCount));
        return this.evaluatePerformance(testResults, retryCount + 1);
      }

      return "Performance evaluation is temporarily unavailable. Please try again later.";
    }
  }

  parseEvaluationJson(content, stats, testResults) {
    try {
      // First try to find a complete JSON object in the response
      const jsonMatches = content.match(/\{[\s\S]*\}/g);
      if (jsonMatches) {
        // Try each JSON-like match
        for (const jsonMatch of jsonMatches) {
          try {
            const parsed = JSON.parse(jsonMatch);
            if (parsed && typeof parsed === 'object') {
              return this.normalizeEvaluationObject(parsed, stats, testResults);
            }
          } catch {
            // Try cleanAndParseJSON which has JSON5 support
            try {
              const parsed = this.cleanAndParseJSON(jsonMatch);
              if (parsed && typeof parsed === 'object') {
                return this.normalizeEvaluationObject(parsed, stats, testResults);
              }
            } catch {
              // Continue to next match
              continue;
            }
          }
        }
      }

      // If no JSON found, throw to trigger fallback
      throw new Error('No valid JSON found in response');
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);

      // Create fallback evaluation based on stats
      const sorted = Object.entries(stats.sectionPerformance || {}).sort((a, b) => (b[1].accuracy || 0) - (a[1].accuracy || 0));
      const strongest = sorted[0] ? sorted[0][0] : 'N/A';
      const weakest = sorted[sorted.length - 1] ? sorted[sorted.length - 1][0] : 'N/A';

      return this.normalizeEvaluationObject({
        keyInsights: {
          title: 'Key Insights',
          content: stats.accuracy >= 70
            ? `Strong overall performance at ${stats.accuracy}% accuracy. Continue building on your foundation.`
            : `Room for improvement at ${stats.accuracy}% accuracy. Focus on understanding core concepts.`,
          icon: 'lightbulb',
          severity: 'info'
        },
        priorityActions: {
          title: 'Priority Actions',
          content: strongest !== weakest && weakest !== 'N/A'
            ? `Focus on practicing ${weakest} questions to improve your weakest area.`
            : 'Focus on consistent practice across all question types.',
          icon: 'flag',
          severity: 'warning'
        },
        studyPlan: {
          title: 'Study Plan',
          items: [
            'Review incorrect answers and their explanations',
            'Practice timed sections to improve speed and accuracy',
            weakest !== 'N/A' ? `Focus additional time on ${weakest} questions` : 'Practice a variety of question types',
            'Take regular practice tests to track improvement'
          ],
          icon: 'book',
          severity: 'success'
        },
        testStrategy: {
          title: 'Test-Taking Strategy',
          content: 'Manage your time effectively, read questions carefully, and use process of elimination when unsure.',
          icon: 'psychology',
          severity: 'info'
        },
        motivation: {
          title: 'Motivation & Goals',
          content: this.getMotivationMessage(stats.accuracy),
          icon: 'trending_up',
          severity: 'success'
        },
        stats: {
          overallScore: stats.accuracy || 0,
          strongestSection: strongest,
          weakestSection: weakest,
          totalQuestions: stats.totalQuestions || 0,
          testsCompleted: testResults ? testResults.length : 0
        },
      }, stats, testResults);
    }
  }

  // Ensure evaluation object always has required shape
  normalizeEvaluationObject(raw, stats, testResults) {
    if (!raw || typeof raw !== 'object') return raw;

    const normalizedStats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};

    const computedStrongest = Object.entries(stats.sectionPerformance || {})
      .sort((a, b) => (b[1].accuracy || 0) - (a[1].accuracy || 0))[0]?.[0] || 'N/A';
    const computedWeakest = Object.entries(stats.sectionPerformance || {})
      .sort((a, b) => (a[1].accuracy || 0) - (b[1].accuracy || 0))[0]?.[0] || 'N/A';

    const final = {
      keyInsights: raw.keyInsights || raw.insights || raw.keyInsight || null,
      priorityActions: raw.priorityActions || raw.actions || null,
      studyPlan: raw.studyPlan || (Array.isArray(raw.studyPlanItems) ? { title: 'Study Plan', items: raw.studyPlanItems, icon: 'book', severity: 'success' } : null),
      testStrategy: raw.testStrategy || raw.strategy || null,
      motivation: raw.motivation || raw.encouragement || null,
      stats: {
        overallScore: normalizedStats.overallScore ?? stats.accuracy ?? 0,
        strongestSection: normalizedStats.strongestSection || computedStrongest,
        weakestSection: normalizedStats.weakestSection || computedWeakest,
        totalQuestions: normalizedStats.totalQuestions ?? stats.totalQuestions ?? 0,
        testsCompleted: normalizedStats.testsCompleted ?? (testResults ? testResults.length : 0),
        averageQuestionTime: normalizedStats.averageQuestionTime ?? stats.averageQuestionTime ?? 0
      }
    }; // end final object

    // Enforce minimal structure for missing sections
    if (!final.keyInsights) {
      final.keyInsights = { title: 'Key Insights', content: `Overall accuracy ${final.stats.overallScore}%. ${final.stats.weakestSection !== 'N/A' ? `Weakest: ${final.stats.weakestSection}.` : ''}`.trim(), icon: 'lightbulb', severity: 'info' };
    }
    if (!final.priorityActions) {
      final.priorityActions = { title: 'Priority Actions', content: final.stats.weakestSection && final.stats.weakestSection !== 'N/A' ? `Target focused drills in ${final.stats.weakestSection}.` : 'Build consistent daily practice habit.', icon: 'flag', severity: 'warning' };
    }
    if (!final.studyPlan) {
      final.studyPlan = { title: 'Study Plan', items: ['Review mistakes', 'Target weakest area', 'Timed mixed set', 'Full-length practice'], icon: 'book', severity: 'success' };
    }
    if (!final.testStrategy) {
      final.testStrategy = { title: 'Test Strategy', content: 'Allocate time per question, skip and return when stuck, apply elimination systematically.', icon: 'psychology', severity: 'info' };
    }
    if (!final.motivation) {
      final.motivation = { title: 'Motivation & Goals', content: this.getMotivationMessage(final.stats.overallScore), icon: 'trending_up', severity: 'success' };
    }

    return final;
  }

  async evaluatePerformanceWithFormat(testResults, returnFormat = 'text', retryCount = 0) {
    // Check rate limits before making API call
    const rateLimitCheck = checkEvaluationRateLimit();
    if (!rateLimitCheck.allowed) {
      const errorMsg = rateLimitCheck.reason;
      return returnFormat === 'json'
        ? { error: errorMsg }
        : errorMsg;
    }

    if (!testResults || testResults.length === 0) {
      return returnFormat === 'json'
        ? { error: 'No test data available for performance analysis.' }
        : 'No test data available for performance analysis.';
    }

    const stats = this.computePerformanceStats(testResults);
    const prompt = this.buildEvaluationPrompt(stats, returnFormat);

    const data = {
      model: 'google/gemma-3-4b-it',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: returnFormat === 'json' ? 2000 : 1500,
    };

    try {
      const response = await this.makeRequest('/chat/completions', data);
      const content = response.choices[0].message.content;

      if (returnFormat === 'json') {
        return this.parseEvaluationJson(content, stats, testResults);
      }

      return content;
    } catch (error) {
      console.error(`Failed to evaluate performance (attempt ${retryCount + 1}):`, error);
      if (retryCount < this.maxRetries) {
        await this.delay(this.calculateDelay(retryCount));
        return this.evaluatePerformanceWithFormat(testResults, returnFormat, retryCount + 1);
      }

      if (returnFormat === 'json') {
        return { error: 'Performance evaluation is temporarily unavailable. Please try again later.' };
      }
      return 'Performance evaluation is temporarily unavailable. Please try again later.';
    }
  }

  async getStudyRecommendations(weakAreas, testType, retryCount = 0) {
    const prompt = `As a ${testType} test prep expert, provide specific, actionable study recommendations for a student struggling with: ${weakAreas.join(
      ", "
    )}

Create a focused 2-week study plan with:

📚 Week 1 Focus:
- Day-by-day breakdown of what to study
- Specific practice problems or question types to target
- Time allocation (e.g., "30 min daily on X, 15 min on Y")

📚 Week 2 Focus:
- How to build on Week 1
- Practice test strategy
- Review and reinforcement activities

🎯 Daily Study Routine:
- Morning warm-up (10-15 min)
- Focused practice session (30-45 min)
- Evening review (10-15 min)

📖 Specific Resources:
- Recommend specific free online resources, apps, or study materials
- Practice problem sources
- YouTube channels or websites for these specific weak areas

⚡ Quick Wins:
- 3 immediate changes the student can make to see quick improvement this week

Keep it concise, practical, and tailored to the weak areas listed.`;

    const data = {
      model: 'google/gemma-3-4b-it',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    };

    try {
      const response = await this.makeRequest('/chat/completions', data);
      return response.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error(`Failed to get study recommendations (attempt ${retryCount + 1}):`, error);
      if (retryCount < this.maxRetries) {
        await this.delay(this.calculateDelay(retryCount));
        return this.getStudyRecommendations(weakAreas, testType, retryCount + 1);
      }
      return `Study Recommendations for ${weakAreas.join(', ')}:

Week 1:
- Identify foundational concepts and review with short daily sessions (30-40 min).
- Target 10-15 practice questions daily focused on these topics.
- Keep a mistake journal and write one-line takeaways per miss.

Week 2:
- Mix in timed sets (2-3 sets of 8–10 questions) to build speed and accuracy.
- Do a short review of Week 1 errors and reattempt those problems.
- End the week with a mini full-section practice and analyze results.

Quick Wins:
- Use elimination aggressively; narrow to 2 choices before deciding.
- Set a per-question time budget and move on when exceeded.
- Review explanations for both correct and incorrect answers.`;
    }
  }

  generateQuickInsights(userStats) {
    if (!userStats || userStats.totalTests === 0) {
      return [
        'Welcome! Start your first test to unlock personalized insights.',
      ];
    }
    const insights = [];
    if (userStats.overallAccuracy >= 80) {
      insights.push('Strong performance! Maintain consistency and tackle harder sets.');
    } else if (userStats.overallAccuracy >= 60) {
      insights.push('Good base. Focus on weak sections to push past 70–80%.');
    } else {
      insights.push('Start with fundamentals. Short daily practice will yield quick gains.');
    }
    const sections = Object.entries(userStats.sectionBreakdown || {}).sort((a, b) => a[1].accuracy - b[1].accuracy);
    if (sections.length > 0) {
      insights.push(`Focus on ${sections[0][0]} this week to lift your overall score.`);
    }
    return insights;
  }

  // Generate learning questions for modules
  async generateLearningQuestions(options = {}) {
    const {
      topic,
      category,
      difficulty = 'medium',
      questionCount = 10,
      includePassage = false,
      moduleMeta = null
    } = options;

    try {
      console.log(`Generating ${questionCount} questions for ${topic} (${category}, ${difficulty})`);

      const testType = category === 'integrated' ? 'GMAT' : 'GRE';
      const section = this.mapCategoryToSection(category);

      const questions = [];
      const batchSize = Math.min(5, questionCount);
      for (let i = 0; i < questionCount; i += batchSize) {
        const remainingQuestions = Math.min(batchSize, questionCount - i);
        try {
          const batchPromises = Array.from({ length: remainingQuestions }, () =>
            this.generateSingleLearningQuestion(topic, testType, section, difficulty, includePassage, moduleMeta)
          );
          const batchQuestions = await Promise.allSettled(batchPromises);
          batchQuestions.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              questions.push(result.value);
            } else {
              console.warn(`Failed to generate question ${i + index + 1}:`, result.reason);
              const fallback = this.generateFallbackQuestion(testType, section, difficulty);
              questions.push({
                ...fallback,
                topic,
                id: `fallback_${i + index + 1}`,
                isFallback: true
              });
            }
          });
        } catch (batchError) {
          console.error(`Batch generation failed:`, batchError);
          for (let j = 0; j < remainingQuestions; j++) {
            const fallback = this.generateFallbackQuestion(testType, section, difficulty);
            questions.push({
              ...fallback,
              topic,
              id: `fallback_batch_${i + j + 1}`,
              isFallback: true
            });
          }
        }
        if (i + batchSize < questionCount) {
          await this.delay(500);
        }
      }
      return questions.slice(0, questionCount);
    } catch (error) {
      console.error('Error in generateLearningQuestions:', error);
      const questions = [];
      const testType = category === 'integrated' ? 'GMAT' : 'GRE';
      const section = this.mapCategoryToSection(category);
      for (let i = 0; i < questionCount; i++) {
        const fallback = this.generateFallbackQuestion(testType, section, difficulty);
        questions.push({
          ...fallback,
          topic,
          id: `emergency_fallback_${i + 1}`,
          isFallback: true
        });
      }
      return questions;
    }
  }

  // Generate a single learning question
  async generateSingleLearningQuestion(topic, testType, section, difficulty, includePassage, moduleMeta) {
    const prompt = this.buildLearningQuestionPrompt(topic, testType, section, difficulty, includePassage, moduleMeta);

    const data = {
      model: "google/gemma-3-4b-it",
      messages: [
        {
          role: "system",
          content: `You are a test prep instructor. You MUST respond with pure JSON only - no markdown, no code blocks, no explanations. \nOutput MUST match the requested JSON schema exactly.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.65,
      max_tokens: 1700,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      const content = response.choices[0].message.content;

      const parsedQuestion = this.cleanAndParseJSON(content);

      if (this.validateQuestion(parsedQuestion)) {
        // Normalize optional expanded fields
        const optionExplanations = Array.isArray(parsedQuestion.optionExplanations)
          ? parsedQuestion.optionExplanations.slice(0, parsedQuestion.options.length).map((oe, idx) => ({
            option: typeof oe.option === 'string' ? oe.option : parsedQuestion.options[idx] || `Option ${idx + 1}`,
            isCorrect: idx === parsedQuestion.correctAnswer,
            rationale: typeof oe.rationale === 'string' && oe.rationale.trim() ? oe.rationale : 'No rationale provided.'
          }))
          : parsedQuestion.options.map((opt, idx) => ({
            option: opt,
            isCorrect: idx === parsedQuestion.correctAnswer,
            rationale: idx === parsedQuestion.correctAnswer ? 'Correct: aligns with core concept.' : 'Incorrect: reflects a common misconception.'
          }));

        const reasoningSteps = Array.isArray(parsedQuestion.reasoningSteps) && parsedQuestion.reasoningSteps.length
          ? parsedQuestion.reasoningSteps
          : [parsedQuestion.explanation];

        const normalized = {
          ...parsedQuestion,
          topic,
          testType,
          section,
          difficulty,
          timestamp: Date.now(),
          optionExplanations,
          reasoningSteps,
          concepts: Array.isArray(parsedQuestion.concepts) ? parsedQuestion.concepts : (parsedQuestion.concepts ? [String(parsedQuestion.concepts)] : []),
          skillFocus: parsedQuestion.skillFocus || topic,
          strategyTip: parsedQuestion.strategyTip || 'Eliminate implausible distractors systematically.'
        };
        return normalized;
      } else {
        throw new Error("Generated question failed validation");
      }

    } catch (error) {
      console.error('Error generating single learning question:', error);
      throw error;
    }
  }

  // Map category to section for question generation
  mapCategoryToSection(category) {
    const mapping = {
      verbal: 'verbal',
      quantitative: 'quantitative',
      analytical: 'writing',
      integrated: 'integrated'
    };
    return mapping[category] || 'verbal';
  }

  // Infer section from module ID for lazy loading
  inferSectionFromModuleId(moduleId) {
    if (!moduleId || typeof moduleId !== 'string') {
      return 'verbal'; // Default fallback
    }

    const lowerModuleId = moduleId.toLowerCase();

    if (lowerModuleId.includes('quant') || lowerModuleId.includes('math')) {
      return 'quantitative';
    }
    if (lowerModuleId.includes('verbal') || lowerModuleId.includes('reading')) {
      return 'verbal';
    }
    if (lowerModuleId.includes('writing') || lowerModuleId.includes('analytical')) {
      return 'writing';
    }
    if (lowerModuleId.includes('integrated') || lowerModuleId.includes('graphics') || lowerModuleId.includes('wizard')) {
      return 'integrated';
    }

    // Default to verbal if we can't determine
    return 'verbal';
  }

  // Helper method for motivation messages
  getMotivationMessage(accuracy) {
    if (accuracy >= 80) {
      return "Excellent work! You're performing at a high level. Keep practicing to maintain consistency.";
    }
    if (accuracy >= 60) {
      return "You're making good progress! Focus on your weak areas to push your score higher.";
    }
    return "Every expert was once a beginner. Keep practicing consistently and you'll see improvement";
  }

  computePerformanceStats(testResults) {
    const recentTests = testResults.slice(0, 5);

    let totalQuestions = 0;
    let correctAnswers = 0;
    let cumulativeTime = 0;
    const allQuestions = [];

    testResults.forEach((test) => {
      if (Array.isArray(test.questions)) {
        test.questions.forEach((q) => {
          allQuestions.push(q);
          totalQuestions++;
          if (q.isCorrect) correctAnswers++;
          if (typeof q.timeSpent === 'number') cumulativeTime += q.timeSpent;
        });
      }
    });

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const averageQuestionTime = totalQuestions > 0 ? Math.round(cumulativeTime / totalQuestions) : 0;

    const sectionPerformance = {};
    const difficultyPerformance = {};

    allQuestions.forEach((q) => {
      const section = q.section || 'Unknown';
      if (!sectionPerformance[section]) sectionPerformance[section] = { correct: 0, total: 0, avgTime: 0 };
      sectionPerformance[section].total++;
      if (q.isCorrect) sectionPerformance[section].correct++;
      sectionPerformance[section].avgTime += q.timeSpent || 0;

      const difficulty = q.difficulty || 'Unknown';
      if (!difficultyPerformance[difficulty]) difficultyPerformance[difficulty] = { correct: 0, total: 0 };
      difficultyPerformance[difficulty].total++;
      if (q.isCorrect) difficultyPerformance[difficulty].correct++;
    });

    Object.keys(sectionPerformance).forEach((section) => {
      const data = sectionPerformance[section];
      data.accuracy = Math.round((data.correct / data.total) * 100);
      data.avgTime = Math.round(data.avgTime / data.total);
    });

    return { recentTests, totalQuestions, correctAnswers, accuracy, sectionPerformance, difficultyPerformance, averageQuestionTime };
  }
}

const openRouterService = new OpenRouterService();

export const aiApi = {
  generation: {
    generateQuestion: (...args) => openRouterService.generateQuestion(...args),
  },
  evaluation: {
    evaluatePerformance: (...args) => openRouterService.evaluatePerformance(...args),
    evaluatePerformanceWithFormat: (...args) => openRouterService.evaluatePerformanceWithFormat(...args),
  },
  study: {
    getStudyRecommendations: (...args) => openRouterService.getStudyRecommendations(...args),
  },
  utils: {
    cleanAndParseJSON: (...args) => openRouterService.cleanAndParseJSON(...args),
    generateQuickInsights: (...args) => openRouterService.generateQuickInsights(...args),
  },
};

export default openRouterService;
