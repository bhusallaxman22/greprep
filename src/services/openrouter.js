import { OPENROUTER } from '../config';
import { checkQuestionRateLimit, checkEvaluationRateLimit } from './rateLimiter';
import { validateTestConfig, validateAPIRequest, checkSecurityThreats } from './inputValidator';

// OpenRouter AI service for question generation and evaluation
// const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL;

class OpenRouterService {
  constructor() {
    this.apiKey = OPENROUTER.apiKey;
    this.baseUrl = OPENROUTER.baseUrl;
    this.maxRetries = OPENROUTER.maxRetries;
    this.baseDelay = OPENROUTER.baseDelayMs; // 1 second
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

  async makeRequest(endpoint, data, retryCount = 0) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Check if it's a retryable error
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Retryable API error: ${response.status}`);
        }
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      return await response.json();
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

  // Robust JSON cleaning and parsing function
  cleanAndParseJSON(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content provided');
    }

    // Multiple parsing strategies
    const strategies = [
      // Strategy 1: Direct parse (cleaned)
      () => {
        const cleaned = content.trim()
          .replace(/^```json\s*/, '')
          .replace(/```\s*$/, '')
          .replace(/^[^{]*/, '')
          .replace(/[^}]*$/, '');
        return JSON.parse(cleaned);
      },

      // Strategy 2: Extract JSON block with better regex
      () => {
        const re = /\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}/;
        const jsonMatch = re.exec(content);
        if (!jsonMatch) throw new Error('No JSON found');
        return JSON.parse(jsonMatch[0]);
      },

      // Strategy 3: Fix common AI JSON issues
      () => {
        let fixed = content
          .replace(/^.*?({.*}).*$/s, '$1'); // Extract JSON object
        // Remove control characters manually
        fixed = Array.from(fixed).map(c => {
          const code = c.charCodeAt(0);
          return (code < 32 || code === 127) ? ' ' : c;
        }).join('')
          .replace(/\\n/g, '\\\\n') // Fix newlines
          .replace(/"/g, '"') // normalize quotes
          .replace(/(\w+):/g, '"$1":') // Add quotes to keys
          .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        return JSON.parse(fixed);
      },

      // Strategy 4: Character-by-character cleaning
      () => {
        let cleaned = '';
        let inString = false;
        let escapeNext = false;

        for (const char of content) {
          if (escapeNext) {
            cleaned += char;
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            cleaned += char;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            cleaned += char;
            continue;
          }

          if (!inString && (char === '\n' || char === '\r' || char === '\t')) {
            cleaned += ' ';
            continue;
          }

          if (inString && char.charCodeAt(0) < 32) {
            cleaned += ' ';
            continue;
          }

          cleaned += char;
        }

        // Extract JSON object
        const match = /\{[\s\S]*\}/.exec(cleaned);
        if (!match) throw new Error('No JSON object found');

        return JSON.parse(match[0]);
      }
    ];

    // Try each strategy
    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = strategies[i]();
        console.log(`JSON parsed successfully with strategy ${i + 1}`);
        return result;
      } catch (error) {
        console.log(`Strategy ${i + 1} failed:`, error.message);
        if (i === strategies.length - 1) {
          // Last strategy failed, throw error
          throw new Error(`All JSON parsing strategies failed. Original content: ${content.substring(0, 200)}...`);
        }
      }
    }
  }

  // Determine if error is retryable
  shouldRetry(error) {
    return (
      error.message.includes("Retryable API error") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network error") ||
      error.name === "NetworkError" ||
      error.name === "TypeError"
    );
  }

  // Fallback question generator for when AI fails
  generateFallbackQuestion(testType, section, difficulty) {
    const fallbackQuestions = {
      GRE: {
        verbal: {
          easy: {
            question:
              "Choose the word that best completes the sentence: The scientist's _____ approach to research yielded unexpected discoveries.",
            options: ["methodical", "careless", "rushed", "biased", "random"],
            correctAnswer: 0,
            explanation:
              "Methodical means systematic and orderly, which would be most likely to yield discoveries in scientific research.",
          },
          medium: {
            passage:
              "The concept of artificial intelligence has evolved dramatically since its inception in the 1950s. Early researchers were optimistic about creating machines that could think and reason like humans within a few decades. However, the complexity of human cognition proved far greater than initially anticipated. While modern AI systems excel at specific tasks like chess, image recognition, and language translation, they still lack the general intelligence and adaptability that characterizes human thinking. Recent advances in machine learning and neural networks have renewed interest in artificial general intelligence, though experts remain divided on whether and when such systems might be achieved.",
            question:
              "According to the passage, what can be inferred about early AI researchers?",
            options: [
              "They accurately predicted the timeline for achieving human-level AI",
              "They underestimated the complexity of human cognition",
              "They focused primarily on specific task-oriented applications",
              "They were pessimistic about the potential for machine intelligence",
              "They successfully created machines with general intelligence"
            ],
            correctAnswer: 1,
            explanation:
              "The passage states that early researchers were optimistic about creating thinking machines 'within a few decades,' but 'the complexity of human cognition proved far greater than initially anticipated,' indicating they underestimated this complexity.",
          },
          hard: {
            question:
              "The relationship between 'verbose' and 'concise' is most similar to the relationship between:",
            options: [
              "abundant : scarce",
              "bright : luminous",
              "fast : quick",
              "large : huge",
              "happy : joyful",
            ],
            correctAnswer: 0,
            explanation:
              "Verbose and concise are antonyms, just as abundant and scarce are opposite in meaning.",
          },
        },
        reading: {
          medium: {
            passage:
              "Climate change represents one of the most pressing challenges of our time, with far-reaching implications for ecosystems, human societies, and economic systems worldwide. The scientific consensus overwhelmingly supports the conclusion that human activities, particularly the emission of greenhouse gases from fossil fuel combustion, are the primary drivers of recent climate change. Evidence for this warming trend includes rising global temperatures, melting ice sheets, rising sea levels, and shifting precipitation patterns. However, the complexity of climate systems means that impacts vary significantly by geographic region and time scale. Some areas may experience more severe droughts, while others face increased flooding. Understanding these regional variations is crucial for developing effective adaptation and mitigation strategies.",
            question:
              "The author's primary purpose in this passage is to:",
            options: [
              "Argue that climate change impacts are uniform across all regions",
              "Provide an overview of climate change causes and varied regional impacts",
              "Criticize the scientific consensus on climate change",
              "Focus exclusively on economic implications of climate change",
              "Propose specific solutions for climate change mitigation"
            ],
            correctAnswer: 1,
            explanation:
              "The passage provides a general overview of climate change causes (human activities, greenhouse gases) and emphasizes that impacts vary by region, making option B the best description of the author's primary purpose.",
          }
        },
        quantitative: {
          easy: {
            question: "If x + 5 = 12, what is the value of x?",
            options: ["5", "6", "7", "8", "9"],
            correctAnswer: 2,
            explanation: "Subtracting 5 from both sides: x = 12 - 5 = 7",
          },
          medium: {
            question: "What is 15% of 240?",
            options: ["30", "32", "34", "36", "38"],
            correctAnswer: 3,
            explanation: "15% of 240 = 0.15 × 240 = 36",
          },
          hard: {
            question:
              "If the probability of rain is 0.3 and the probability of wind is 0.4, and these events are independent, what is the probability of both rain and wind?",
            options: ["0.12", "0.15", "0.18", "0.21", "0.24"],
            correctAnswer: 0,
            explanation:
              "For independent events, P(A and B) = P(A) × P(B) = 0.3 × 0.4 = 0.12",
          },
        },
      },
      GMAT: {
        verbal: {
          easy: {
            question:
              "Which of the following best corrects the sentence: 'The company has been more successful than their competitors.'",
            options: [
              "The company has been more successful than its competitors.",
              "The company has been more successful than there competitors.",
              "The company has been more successful than they're competitors.",
              "The company has been more successful than their competitors.",
              "The company has been more successful then their competitors.",
            ],
            correctAnswer: 0,
            explanation:
              "Use 'its' (possessive) instead of 'their' when referring to a singular company.",
          },
        },
        quantitative: {
          easy: {
            question:
              "A store sells apples for $2 per pound. If John buys 3.5 pounds of apples, how much does he pay?",
            options: ["$6.00", "$6.50", "$7.00", "$7.50", "$8.00"],
            correctAnswer: 2,
            explanation: "3.5 pounds × $2 per pound = $7.00",
          },
        },
      },
    };

    const questions = fallbackQuestions[testType]?.[section];
    if (!questions) {
      throw new Error(
        `No fallback questions available for ${testType} ${section}`
      );
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
    retryCount = 0
  ) {
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

    const models = [
      "anthropic/claude-3.5-sonnet-20241022",
      "google/gemini-2.5-flash-lite",
      "google/gemma-3-4b-it",
      "mistralai/mistral-small-3.1-24b-instruct",
      "openai/gpt-oss-20b",
      "meta-llama/llama-3.1-8b-instruct:free",
    ];

    const currentModel = models[Math.min(retryCount, models.length - 1)];

    const prompt = `You are an expert ${testType} test preparation instructor. Generate ONE high-quality ${section} question with ${difficulty} difficulty level.

CRITICAL: Respond with ONLY a valid JSON object. No explanation, no markdown, no extra text.

${this.getQuestionStructurePrompt(testType, section, difficulty)}

Requirements:
- Question must be realistic and follow official ${testType} format
- All 4 options must be plausible but only one correct
- correctAnswer must be 0, 1, 2, or 3 (array index)
- Explanation must be educational and detailed
- Use proper grammar and avoid control characters
- Keep content clean and well-formatted

Generate ONLY the JSON object:`;

    const data = {
      model: currentModel,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      const content = response.choices[0].message.content;

      // Use robust JSON parsing
      const parsedQuestion = this.cleanAndParseJSON(content);

      // Validate the parsed question
      if (this.validateQuestion(parsedQuestion)) {
        // Ensure required fields are present and clean up any empty fields
        parsedQuestion.testType = testType;
        parsedQuestion.section = section;
        parsedQuestion.difficulty = difficulty;

        // Only remove passage if it's actually empty, null, or undefined
        // Keep passages that have content
        if (!parsedQuestion.passage ||
          parsedQuestion.passage.trim().length === 0) {
          delete parsedQuestion.passage;
        }

        // Remove truly empty image fields
        if (parsedQuestion.image === "" || parsedQuestion.image === null || parsedQuestion.image === undefined) {
          delete parsedQuestion.image;
        }
        if (parsedQuestion.imageDescription === "" || parsedQuestion.imageDescription === null || parsedQuestion.imageDescription === undefined) {
          delete parsedQuestion.imageDescription;
        }

        return parsedQuestion;
      } else {
        throw new Error("Generated question failed validation");
      }
    } catch (error) {
      console.error(
        `Failed to generate question (attempt ${retryCount + 1}):`,
        error
      );

      // Retry with different model or approach
      if (retryCount < this.maxRetries) {
        console.log(`Retrying with different model...`);
        await this.delay(this.calculateDelay(retryCount));
        return this.generateQuestion(
          testType,
          section,
          difficulty,
          retryCount + 1
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
    if (!question || typeof question !== 'object') {
      return false;
    }

    // Check question text
    if (typeof question.question !== "string" || question.question.trim().length < 3) {
      return false;
    }

    // Check options array
    if (!Array.isArray(question.options)) {
      return false;
    }

    // Accept both 4 and 5 options (some fallback questions have 5)
    if (question.options.length < 4 || question.options.length > 5) {
      return false;
    }

    // Check correct answer
    if (typeof question.correctAnswer !== "number" ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length) {
      return false;
    }

    // Check explanation
    if (typeof question.explanation !== "string" || question.explanation.trim().length < 3) {
      return false;
    }

    // Check that all options are valid strings
    for (const option of question.options) {
      if (typeof option !== "string" || option.trim().length < 1) {
        return false;
      }
    }

    return true;
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

      // Generate initial batch of questions
      for (let i = 0; i < batchSize; i++) {
        try {
          const question = await this.generateQuestion(testType, section, difficulty);
          if (this.validateQuestion(question)) {
            questions.push({
              ...question,
              id: `${moduleId}_${Date.now()}_${i}`,
              moduleId,
              difficulty,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1}:`, error);
          errors.push(error);
        }
      }

      // If we failed to generate enough questions, fill with fallbacks
      while (questions.length < batchSize) {
        const fallback = this.generateFallbackQuestion(testType, section, difficulty);
        questions.push({
          ...fallback,
          id: `${moduleId}_fallback_${Date.now()}_${questions.length}`,
          moduleId,
          difficulty,
          timestamp: Date.now()
        });
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
      const errors = [];

      // Generate batch of questions
      for (let i = 0; i < batchSize; i++) {
        try {
          const question = await this.generateQuestion(testType, section, difficulty);
          if (this.validateQuestion(question)) {
            questions.push({
              ...question,
              id: `${moduleId}_${Date.now()}_${startIndex + i}`,
              moduleId,
              difficulty,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          console.warn(`Failed to generate question ${i + 1} in batch:`, error);
          errors.push(error);
        }
      }

      // If we failed to generate enough questions, fill with fallbacks
      while (questions.length < batchSize) {
        const fallback = this.generateFallbackQuestion(testType, section, difficulty);
        questions.push({
          ...fallback,
          id: `${moduleId}_fallback_${Date.now()}_${startIndex + questions.length}`,
          moduleId,
          difficulty,
          timestamp: Date.now()
        });
      }

      return questions;

    } catch (error) {
      console.error('Error in getNextQuestionBatch:', error);
      throw new Error(`Failed to generate question batch: ${error.message}`);
    }
  }

  // Helper method to get question structure prompt based on section and test type
  getQuestionStructurePrompt(testType, section, difficulty) {
    const baseStructure = {
      question: "Clear, well-written question text",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "Detailed explanation of why the answer is correct and others are wrong"
    };

    if (section === 'reading' || (section === 'verbal' && Math.random() < 0.4)) {
      // Reading comprehension questions need passages
      return `Expected JSON structure:
{
  "passage": "Engaging 200-400 word passage on academic topics like science, humanities, social sciences, or current issues. Make it substantive and realistic.",
  "question": "Question about the passage (main idea, inference, author's tone, specific details, etc.)",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation referencing specific parts of the passage"
}

PASSAGE REQUIREMENTS:
- Academic level appropriate for graduate school
- Topics: science discoveries, historical analysis, literary criticism, social issues, technology
- Should be complex enough to support multiple question types
- Include specific details, examples, and argumentation
- 200-400 words for substantial content

QUESTION TYPES to vary:
- Main idea/primary purpose
- Inference questions
- Author's tone/attitude
- Specific detail questions
- Vocabulary in context
- Logical structure questions`;
    }

    if (section === 'quantitative' || section === 'math') {
      return `Expected JSON structure:
${JSON.stringify(baseStructure, null, 2)}

MATH QUESTION REQUIREMENTS:
- Include step-by-step mathematical reasoning
- Cover topics: algebra, geometry, data analysis, arithmetic, word problems
- Use realistic numbers and scenarios
- For ${difficulty} level: ${this.getDifficultyGuidance('quantitative', difficulty)}
- Show clear mathematical progression in explanation`;
    }

    if (section === 'verbal') {
      return `Expected JSON structure:
${JSON.stringify(baseStructure, null, 2)}

VERBAL QUESTION TYPES (vary these):
- Sentence completion with sophisticated vocabulary
- Text completion (2-3 blanks with logical flow)
- Sentence equivalence (focus on meaning and logic)
- Critical reasoning (strengthen/weaken arguments)
- Vocabulary in context

For ${difficulty} level: ${this.getDifficultyGuidance('verbal', difficulty)}`;
    }

    if (section === 'analytical' || section === 'writing') {
      return `Expected JSON structure:
${JSON.stringify(baseStructure, null, 2)}

ANALYTICAL WRITING FOCUS:
- Argument analysis and evaluation
- Logical reasoning and structure
- Evidence evaluation
- Critical thinking skills
- Essay organization and development`;
    }

    return `Expected JSON structure:
${JSON.stringify(baseStructure, null, 2)}

Focus on ${section} skills appropriate for ${testType} ${difficulty} level.`;
  }

  // Helper method to provide difficulty-specific guidance
  getDifficultyGuidance(section, difficulty) {
    const guidance = {
      verbal: {
        beginner: "Use common vocabulary, straightforward sentence structures, basic reading comprehension",
        medium: "Intermediate vocabulary, moderate complexity, some inference required",
        advanced: "Sophisticated vocabulary, complex sentence structures, advanced reasoning",
        hard: "Graduate-level vocabulary, nuanced meanings, complex logical relationships"
      },
      quantitative: {
        beginner: "Basic arithmetic, simple algebra, elementary geometry",
        medium: "Intermediate algebra, coordinate geometry, basic statistics",
        advanced: "Complex equations, advanced geometry, data interpretation",
        hard: "Advanced mathematical concepts, multi-step problem solving, complex data analysis"
      }
    };

    return guidance[section]?.[difficulty] || "Standard difficulty level";
  }

  // Helper method to infer section from module ID
  inferSectionFromModuleId(moduleId) {
    const id = moduleId.toLowerCase();

    if (id.includes('verbal') || id.includes('vocabulary')) {
      return 'verbal';
    } else if (id.includes('quantitative') || id.includes('math') || id.includes('quant')) {
      return 'quantitative';
    } else if (id.includes('reading')) {
      return 'reading';
    } else if (id.includes('writing') || id.includes('essay')) {
      return 'writing';
    }

    // Default fallback
    return 'verbal';
  }

  // Generate general content using AI
  async generateContent(prompt, retryCount = 0) {
    const models = [
      "anthropic/claude-3.5-sonnet-20241022",
      "google/gemini-2.5-flash-lite",
      "google/gemma-3-4b-it",
      "mistralai/mistral-small-3.1-24b-instruct",
      "openai/gpt-oss-20b",
      "meta-llama/llama-3.1-8b-instruct:free",
    ];

    const currentModel = models[Math.min(retryCount, models.length - 1)];

    const data = {
      model: currentModel,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    };

    try {
      const response = await this.makeRequest('/chat/completions', data);
      return response.choices[0]?.message?.content || 'Unable to generate content at this time.';
    } catch (error) {
      console.error(`Content generation failed with model ${currentModel}:`, error);

      if (retryCount < this.maxRetries - 1) {
        console.log(`Retrying content generation with different model (${retryCount + 1}/${this.maxRetries})`);
        await this.delay(this.calculateDelay(retryCount));
        return this.generateContent(prompt, retryCount + 1);
      }

      throw new Error(`Failed to generate content after ${this.maxRetries} attempts: ${error.message}`);
    }
  }

  // Generate educational lesson content
  async generateLesson(moduleId, userLevel = 'beginner') {
    try {
      const testType = moduleId.includes('gmat') ? 'GMAT' : 'GRE';
      const section = this.inferSectionFromModuleId(moduleId);

      const prompt = `You are an expert ${testType} tutor creating a comprehensive lesson for ${section} concepts.

Create an engaging lesson for a ${userLevel} level student focusing on ${moduleId}.

Your lesson should include:
1. Learning objectives (3-5 clear goals)
2. Key concepts explanation with examples
3. Common mistakes to avoid
4. Practice strategies
5. Success criteria and assessment methods
6. Additional resources and practice recommendations

Format the response as a structured lesson that is educational, engaging, and actionable.
Keep the content focused and practical for test preparation.`;

      const content = await this.generateContent(prompt);

      return {
        id: `lesson_${moduleId}_${Date.now()}`,
        moduleId,
        title: `${section.charAt(0).toUpperCase() + section.slice(1)} Mastery Lesson`,
        content,
        level: userLevel,
        estimatedTime: '15-20 minutes',
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Error generating lesson:', error);

      // Return a fallback lesson
      return {
        id: `fallback_lesson_${moduleId}_${Date.now()}`,
        moduleId,
        title: 'Study Guide',
        content: `Welcome to your study session for ${moduleId}!

This lesson will help you improve your test preparation skills.

Key Focus Areas:
• Understanding question patterns
• Developing effective strategies
• Building confidence through practice
• Learning from mistakes

Take your time to work through the practice questions and review the explanations carefully.
Focus on understanding the reasoning behind each answer.`,
        level: userLevel,
        estimatedTime: '15-20 minutes',
        timestamp: Date.now()
      };
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
    const allQuestions = [];

    testResults.forEach((test) => {
      if (test.questions && Array.isArray(test.questions)) {
        test.questions.forEach((question) => {
          allQuestions.push(question);
          totalQuestions++;
          if (question.isCorrect) {
            correctAnswers++;
          }
        });
      }
    });

    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

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
      const jsonMatch = /\{[\s\S]*\}/.exec(content);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw new Error('No JSON found in response');
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      const sorted = Object.entries(stats.sectionPerformance).sort((a, b) => b[1].accuracy - a[1].accuracy);
      const strongest = sorted[0] ? sorted[0][0] : 'N/A';
      const weakest = sorted[sorted.length - 1] ? sorted[sorted.length - 1][0] : 'N/A';
      return {
        keyInsights: { title: 'Key Insights', content: 'Analysis completed. Please check your performance data for detailed insights.', icon: 'lightbulb', severity: 'info' },
        priorityActions: { title: 'Priority Actions', content: 'Focus on practicing your weakest sections and review missed questions.', icon: 'flag', severity: 'warning' },
        studyPlan: { title: 'Study Plan', items: ['Review incorrect answers and explanations', 'Practice timed sections to improve speed', 'Focus on your weakest question types'], icon: 'book', severity: 'success' },
        testStrategy: { title: 'Test-Taking Strategy', content: 'Manage your time effectively and read questions carefully before answering.', icon: 'psychology', severity: 'info' },
        motivation: { title: 'Motivation & Goals', content: "You're making progress! Keep practicing consistently to see continued improvement.", icon: 'trending_up', severity: 'success' },
        stats: { overallScore: stats.accuracy, strongestSection: strongest, weakestSection: weakest, totalQuestions: stats.totalQuestions, testsCompleted: testResults.length },
      };
    }
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
    const prompt = this.buildEvaluationPrompt(stats, testResults, returnFormat);

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
      includePassage = false
    } = options;

    try {
      console.log(`Generating ${questionCount} questions for ${topic} (${category}, ${difficulty})`);

      // Determine test type based on category
      const testType = category === 'integrated' ? 'GMAT' : 'GRE';
      const section = this.mapCategoryToSection(category);

      const questions = [];
      const batchSize = Math.min(5, questionCount); // Generate in batches to avoid timeouts

      // Generate questions in batches
      for (let i = 0; i < questionCount; i += batchSize) {
        const remainingQuestions = Math.min(batchSize, questionCount - i);

        try {
          const batchPromises = Array.from({ length: remainingQuestions }, () =>
            this.generateSingleLearningQuestion(topic, testType, section, difficulty, includePassage)
          );

          const batchQuestions = await Promise.allSettled(batchPromises);

          // Process results
          batchQuestions.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              questions.push(result.value);
            } else {
              console.warn(`Failed to generate question ${i + index + 1}:`, result.reason);
              // Add fallback question
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

          // Fill remaining with fallbacks
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

        // Small delay between batches to respect rate limits
        if (i + batchSize < questionCount) {
          await this.delay(500);
        }
      }

      return questions.slice(0, questionCount); // Ensure we return exactly the requested count

    } catch (error) {
      console.error('Error in generateLearningQuestions:', error);

      // Return all fallback questions if everything fails
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
  async generateSingleLearningQuestion(topic, testType, section, difficulty, includePassage) {
    const prompt = this.buildLearningQuestionPrompt(topic, testType, section, difficulty, includePassage);

    const data = {
      model: "anthropic/claude-3.5-sonnet-20241022",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      const content = response.choices[0].message.content;

      const parsedQuestion = this.cleanAndParseJSON(content);

      if (this.validateQuestion(parsedQuestion)) {
        return {
          ...parsedQuestion,
          topic,
          testType,
          section,
          difficulty,
          timestamp: Date.now()
        };
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

  // Build prompt for learning questions
  buildLearningQuestionPrompt(topic, testType, section, difficulty, includePassage) {
    let basePrompt = `You are an expert ${testType} instructor creating educational questions for "${topic}".

Generate ONE high-quality ${section} question for ${difficulty} level students.

CRITICAL: Respond with ONLY a valid JSON object. No explanation, no markdown, no extra text.`;

    if (includePassage) {
      basePrompt += `

Expected JSON structure:
{
  "passage": "Educational 250-400 word passage related to ${topic}. Make it substantive and engaging.",
  "question": "Thoughtful question about the passage",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Clear explanation with educational value",
  "concept": "${topic}"
}

PASSAGE REQUIREMENTS:
- Academic level appropriate for test preparation
- Directly related to: ${topic}
- Include specific details and examples
- 250-400 words for substantial content
- Educational and engaging tone`;

    } else {
      basePrompt += `

Expected JSON structure:
{
  "question": "Clear, educational question related to ${topic}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Educational explanation that teaches the concept",
  "concept": "${topic}"
}`;
    }

    basePrompt += `

EDUCATIONAL REQUIREMENTS:
- Question must teach/reinforce concepts in ${topic}
- All options must be plausible but only one correct
- Explanation should be instructional and detailed
- Focus on understanding, not just testing
- ${this.getDifficultyGuidance(section, difficulty)}

Generate ONLY the JSON object:`;

    return basePrompt;
  }

  computePerformanceStats(testResults) {
    const recentTests = testResults.slice(0, 5);

    let totalQuestions = 0;
    let correctAnswers = 0;
    const allQuestions = [];

    testResults.forEach((test) => {
      if (Array.isArray(test.questions)) {
        test.questions.forEach((q) => {
          allQuestions.push(q);
          totalQuestions++;
          if (q.isCorrect) correctAnswers++;
        });
      }
    });

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

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

    return { recentTests, totalQuestions, correctAnswers, accuracy, sectionPerformance, difficultyPerformance };
  }

  buildEvaluationPrompt(stats, testResults, returnFormat = 'text') {
    const { recentTests, totalQuestions, accuracy, sectionPerformance, difficultyPerformance } = stats;

    const base = `As an expert test prep tutor, analyze this student's performance data and provide specific, actionable insights:\n\nPERFORMANCE DATA:\n- Total Questions: ${totalQuestions}\n- Overall Accuracy: ${accuracy}%\n- Test Type: ${testResults[0]?.testType || 'Unknown'}\n- Number of Tests Taken: ${testResults.length}\n\nSECTION BREAKDOWN:\n${Object.entries(sectionPerformance)
      .map(([section, d]) => `${section}: ${d.accuracy}% accuracy (${d.correct}/${d.total}), avg ${d.avgTime}s per question`)
      .join('\n')}\n\nDIFFICULTY BREAKDOWN:\n${Object.entries(difficultyPerformance)
        .map(([diff, d]) => `${diff}: ${Math.round((d.correct / d.total) * 100)}% accuracy (${d.correct}/${d.total})`)
        .join('\n')}\n\nRECENT TEST PERFORMANCE:\n${recentTests
          .map((test, i) => {
            const c = Array.isArray(test.questions) ? test.questions.filter((x) => x.isCorrect).length : 0;
            const t = Array.isArray(test.questions) ? test.questions.length : 0;
            const a = t > 0 ? Math.round((c / t) * 100) : 0;
            return `Test ${i + 1}: ${a}% accuracy (${c}/${t}) - ${test.testType} ${test.section}`;
          })
          .join('\n')}`;

    if (returnFormat === 'json') {
      const sorted = Object.entries(sectionPerformance).sort((a, b) => b[1].accuracy - a[1].accuracy);
      const strongest = sorted[0] ? sorted[0][0] : 'N/A';
      const weakest = sorted[sorted.length - 1] ? sorted[sorted.length - 1][0] : 'N/A';
      return `${base}\n\nReturn your analysis as a JSON object with the following structure:\n{\n  "keyInsights": { "title": "Key Insights", "content": "...", "icon": "lightbulb", "severity": "info" },\n  "priorityActions": { "title": "Priority Actions", "content": "...", "icon": "flag", "severity": "warning" },\n  "studyPlan": { "title": "Study Plan", "items": ["...", "...", "..."], "icon": "book", "severity": "success" },\n  "testStrategy": { "title": "Test-Taking Strategy", "content": "...", "icon": "psychology", "severity": "info" },\n  "motivation": { "title": "Motivation & Goals", "content": "...", "icon": "trending_up", "severity": "success" },\n  "stats": { "overallScore": ${accuracy}, "strongestSection": "${strongest}", "weakestSection": "${weakest}", "totalQuestions": ${totalQuestions}, "testsCompleted": ${testResults.length} }\n}\n\nKeep each content section concise (under 100 words), specific to their data, and immediately actionable. Avoid generic advice.`;
    }

    return `${base}\n\nPlease provide a concise, personalized analysis focusing on:\n\n1. **Key Insights**\n2. **Priority Actions**\n3. **Specific Study Plan**\n4. **Test-Taking Strategy**\n5. **Motivation**\n\nKeep it concise (under 300 words), specific to their data, and immediately actionable. Avoid generic advice.`;
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
