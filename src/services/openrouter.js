// OpenRouter AI service for question generation and evaluation
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL;

class OpenRouterService {
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
    this.baseUrl = OPENROUTER_BASE_URL;
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "GRE/GMAT Test Prep App",
        },
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
            question:
              "In the passage, the author's tone can best be described as:",
            options: [
              "optimistic",
              "skeptical",
              "neutral",
              "passionate",
              "dismissive",
            ],
            correctAnswer: 1,
            explanation:
              "The author questions the validity of the claims presented, indicating a skeptical tone.",
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
    const models = [
      "google/gemma-3-4b-it",
      "mistralai/mistral-small-3.1-24b-instruct",
      "google/gemini-2.5-flash-lite",
      "openai/gpt-oss-20b",
      "meta-llama/llama-3.1-8b-instruct:free",
    ];

    const currentModel = models[Math.min(retryCount, models.length - 1)];

    const prompt = `Generate a ${testType} ${section} question with ${difficulty} difficulty. 
    
    IMPORTANT: Return ONLY a valid JSON object with this exact structure (no additional text or formatting):
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of the correct answer",
      "difficulty": "${difficulty}",
      "section": "${section}",
      "testType": "${testType}"
    }

    Make sure:
    - The question is realistic and follows official ${testType} format guidelines
    - All options are plausible
    - The correct answer index is accurate (0-4)
    - Return ONLY the JSON object, no other text`;

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

      // Try multiple JSON extraction methods
      let parsedQuestion = null;

      // Method 1: Direct JSON parse
      try {
        parsedQuestion = JSON.parse(content.trim());
      } catch {
        // Method 2: Extract JSON with regex
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedQuestion = JSON.parse(jsonMatch[0]);
          } catch {
            // Method 3: Clean and extract JSON
            const cleanedContent = content
              .replace(/```json\s*/, "")
              .replace(/```\s*$/, "")
              .replace(/^[^{]*/, "")
              .replace(/[^}]*$/, "");
            parsedQuestion = JSON.parse(cleanedContent);
          }
        }
      }

      // Validate the parsed question
      if (parsedQuestion && this.validateQuestion(parsedQuestion)) {
        // Ensure required fields are present
        parsedQuestion.testType = testType;
        parsedQuestion.section = section;
        parsedQuestion.difficulty = difficulty;
        return parsedQuestion;
      } else {
        throw new Error("Invalid question structure");
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
    return (
      question &&
      typeof question.question === "string" &&
      Array.isArray(question.options) &&
      question.options.length >= 4 &&
      typeof question.correctAnswer === "number" &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < question.options.length &&
      typeof question.explanation === "string" &&
      question.question.length > 10 &&
      question.explanation.length > 10
    );
  }

  async evaluatePerformance(testResults, retryCount = 0) {
    // Extract meaningful patterns from the test data
    const recentTests = testResults.slice(0, 5); // Last 5 tests
    const totalQuestions = testResults.length;
    const correctAnswers = testResults.filter((q) => q.isCorrect).length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // Analyze patterns
    const sectionPerformance = {};
    const difficultyPerformance = {};

    testResults.forEach((result) => {
      // Section analysis
      if (!sectionPerformance[result.section]) {
        sectionPerformance[result.section] = {
          correct: 0,
          total: 0,
          avgTime: 0,
        };
      }
      sectionPerformance[result.section].total++;
      if (result.isCorrect) sectionPerformance[result.section].correct++;
      sectionPerformance[result.section].avgTime += result.timeSpent || 0;

      // Difficulty analysis
      if (!difficultyPerformance[result.difficulty]) {
        difficultyPerformance[result.difficulty] = { correct: 0, total: 0 };
      }
      difficultyPerformance[result.difficulty].total++;
      if (result.isCorrect) difficultyPerformance[result.difficulty].correct++;
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

RECENT PERFORMANCE TREND:
${recentTests
  .map(
    (test, i) =>
      `Test ${i + 1}: ${test.isCorrect ? "✓" : "✗"} ${test.section} (${
        test.difficulty
      }) - ${test.timeSpent || 0}s`
  )
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

  async getStudyRecommendations(weakAreas, testType, retryCount = 0) {
    const prompt = `As a ${testType} test prep expert, provide specific, actionable study recommendations for a student struggling with: ${weakAreas.join(
      ", "
    )}

Create a focused 2-week study plan with:

📚 **Week 1 Focus:**
- Day-by-day breakdown of what to study
- Specific practice problems or question types to target
- Time allocation (e.g., "30 min daily on X, 15 min on Y")

📚 **Week 2 Focus:**  
- How to build on Week 1
- Practice test strategy
- Review and reinforcement activities

🎯 **Daily Study Routine:**
- Morning warm-up (10-15 min)
- Focused practice session (30-45 min)  
- Evening review (10-15 min)

📖 **Specific Resources:**
- Recommend specific free online resources, apps, or study materials
- Practice problem sources
- YouTube channels or websites for these specific weak areas

⚡ **Quick Wins:**
- 3 immediate tactics they can use to improve these areas
- Common mistakes to avoid
- Test-day strategies

Keep recommendations specific to ${testType} format and these exact weak areas. Avoid generic advice.`;

    const data = {
      model: "google/gemma-3-4b-it",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      return response.choices[0].message.content;
    } catch (error) {
      console.error(
        `Failed to get study recommendations (attempt ${retryCount + 1}):`,
        error
      );

      if (retryCount < this.maxRetries) {
        await this.delay(this.calculateDelay(retryCount));
        return this.getStudyRecommendations(
          weakAreas,
          testType,
          retryCount + 1
        );
      }

      return "Study recommendations are temporarily unavailable. Please try again later.";
    }
  }

  // Generate quick performance insights for dashboard
  generateQuickInsights(stats) {
    const insights = [];

    if (stats.totalTests === 0) {
      return ["Take your first practice test to get personalized insights!"];
    }

    // Accuracy insights
    if (stats.overallAccuracy >= 85) {
      insights.push(
        "🎯 Excellent accuracy! Focus on speed and advanced concepts."
      );
    } else if (stats.overallAccuracy >= 70) {
      insights.push(
        "📈 Good progress! Work on consistency across all sections."
      );
    } else if (stats.overallAccuracy >= 50) {
      insights.push(
        "🔄 Solid foundation. Focus on your weakest section for quick gains."
      );
    } else {
      insights.push(
        "🎯 Review fundamentals first, then build speed gradually."
      );
    }

    // Section-specific insights
    const sections = Object.keys(stats.sectionBreakdown);
    if (sections.length > 1) {
      const sectionAccuracies = sections.map((section) => ({
        section,
        accuracy: stats.sectionBreakdown[section].accuracy,
      }));

      const bestSection = sectionAccuracies.reduce((a, b) =>
        a.accuracy > b.accuracy ? a : b
      );
      const worstSection = sectionAccuracies.reduce((a, b) =>
        a.accuracy < b.accuracy ? a : b
      );

      if (bestSection.accuracy - worstSection.accuracy > 20) {
        insights.push(
          `💪 Strong in ${bestSection.section}! Apply those skills to improve ${worstSection.section}.`
        );
      }
    }

    // Trend insights
    if (stats.improvementTrend > 10) {
      insights.push("🚀 Great momentum! Keep up your current study routine.");
    } else if (stats.improvementTrend < -10) {
      insights.push(
        "🔄 Time to adjust your study strategy. Focus on fundamentals."
      );
    }

    // Frequency insights
    if (stats.totalTests >= 10) {
      insights.push(
        "📊 Good practice frequency! Consider taking full-length practice tests."
      );
    } else if (stats.totalTests >= 5) {
      insights.push(
        "📈 Building consistency! Take more practice questions daily."
      );
    }

    return insights.slice(0, 3); // Return top 3 insights
  }

  // Generate interactive lesson content
  async generateLesson(moduleId, userLevel, retryCount = 0) {
    const lessonPrompts = {
      "vocabulary-basics": `Create an interactive vocabulary lesson for level ${userLevel} students. Include:
        - 5 multiple-choice questions testing vocabulary in context
        - Words commonly seen on GRE/GMAT tests
        - Engaging explanations with memory techniques
        - Difficulty appropriate for level ${userLevel}`,

      "reading-strategies": `Create a reading comprehension lesson with:
        - A short passage (150-200 words)
        - 4 questions testing different reading skills
        - Strategy tips for each question type
        - Level ${userLevel} difficulty`,

      "math-foundations": `Create a math fundamentals lesson with:
        - 5 step-by-step problems
        - Clear explanations of mathematical concepts
        - Visual problem-solving techniques
        - Level ${userLevel} appropriate difficulty`,

      "critical-reasoning": `Create a critical reasoning lesson with:
        - 4 logical reasoning problems
        - Different argument types (strengthen, weaken, assumption)
        - Clear explanation of logical structures
        - Level ${userLevel} complexity`,
    };

    const prompt = `${
      lessonPrompts[moduleId] || lessonPrompts["vocabulary-basics"]
    }

IMPORTANT: Return ONLY a valid JSON object with this structure:
{
  "id": "${moduleId}-lesson-${Date.now()}",
  "title": "Engaging Lesson Title",
  "description": "Brief lesson description",
  "questions": [
    {
      "question": "Question text with context",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation with learning tips"
    }
  ],
  "tips": ["Study tip 1", "Study tip 2"],
  "nextSteps": "What to practice next"
}

Make it engaging, educational, and fun like Duolingo!`;

    const data = {
      model: "google/gemma-3-4b-it",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    try {
      const response = await this.makeRequest("/chat/completions", data);
      const content = response.choices[0].message.content;

      // Parse lesson content
      let lesson = null;
      try {
        lesson = JSON.parse(content.trim());
      } catch {
        // Try regex extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          lesson = JSON.parse(jsonMatch[0]);
        }
      }

      if (lesson && this.validateLesson(lesson)) {
        return lesson;
      } else {
        throw new Error("Invalid lesson structure");
      }
    } catch (error) {
      console.error(
        `Failed to generate lesson (attempt ${retryCount + 1}):`,
        error
      );

      if (retryCount < this.maxRetries) {
        await this.delay(this.calculateDelay(retryCount));
        return this.generateLesson(moduleId, userLevel, retryCount + 1);
      }

      // Return fallback lesson
      return this.getFallbackLesson(moduleId);
    }
  }

  // Validate lesson structure
  validateLesson(lesson) {
    return (
      lesson &&
      typeof lesson.title === "string" &&
      Array.isArray(lesson.questions) &&
      lesson.questions.length > 0 &&
      lesson.questions.every(
        (q) =>
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length >= 4 &&
          typeof q.correctAnswer === "number" &&
          typeof q.explanation === "string"
      )
    );
  }

  // Fallback lesson generator
  getFallbackLesson(moduleId) {
    const fallbackLessons = {
      "vocabulary-basics": {
        id: `${moduleId}-fallback`,
        title: "Essential Vocabulary Builder",
        description: "Master key vocabulary words for test success",
        questions: [
          {
            question:
              "The professor's lecture was so _____ that many students fell asleep.",
            options: ["engaging", "tedious", "fascinating", "brief"],
            correctAnswer: 1,
            explanation:
              "Tedious means boring or monotonous, which would cause students to fall asleep.",
          },
          {
            question: "Her _____ nature made her an excellent diplomat.",
            options: ["hostile", "aggressive", "tactful", "reckless"],
            correctAnswer: 2,
            explanation:
              "Tactful means having diplomacy and sensitivity in dealing with others.",
          },
        ],
        tips: [
          "Use context clues to determine word meaning",
          "Look for positive or negative connotations",
        ],
        nextSteps: "Practice with more advanced vocabulary in context",
      },
      "math-foundations": {
        id: `${moduleId}-fallback`,
        title: "Algebraic Problem Solving",
        description: "Build strong foundation in algebraic thinking",
        questions: [
          {
            question: "If 3x + 7 = 22, what is the value of x?",
            options: ["3", "5", "7", "15"],
            correctAnswer: 1,
            explanation:
              "Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.",
          },
          {
            question: "What is 25% of 80?",
            options: ["15", "20", "25", "30"],
            correctAnswer: 1,
            explanation: "25% = 0.25. So 0.25 × 80 = 20.",
          },
        ],
        tips: ["Work step by step", "Check your answer by substitution"],
        nextSteps: "Practice more complex algebraic equations",
      },
    };

    return fallbackLessons[moduleId] || fallbackLessons["vocabulary-basics"];
  }
}

export default new OpenRouterService();
