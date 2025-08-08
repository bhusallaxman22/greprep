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

    CRITICAL: Return ONLY valid JSON. No extra text, no markdown, no explanations. Just the JSON object.
    
    Required JSON format:
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation text here"
    }

    Guidelines:
    - For Reading Comprehension: Include a "passage" field with 200-300 words
    - For Math/Visual questions: You may include an "imageDescription" field
    - Question must be realistic and follow official ${testType} format
    - All 4 options must be plausible
    - correctAnswer must be 0, 1, 2, or 3 (array index)
    - Explanation must be detailed and educational
    - Do NOT use escape characters unless absolutely necessary
    - Keep text simple and avoid complex formatting

    Return ONLY the JSON object:`;

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
            // Method 3: Clean and extract JSON with better escape handling
            let cleanedContent = content
              .replace(/```json\s*/, "")
              .replace(/```\s*$/, "")
              .replace(/^[^{]*/, "")
              .replace(/[^}]*$/, "");

            // Fix common escape character issues
            cleanedContent = cleanedContent
              .replace(/\\'/g, "'")  // Fix escaped single quotes
              .replace(/\\"/g, '"')  // Fix escaped double quotes that shouldn't be escaped
              .replace(/\\\\/g, "\\") // Fix double backslashes
              .replace(/\\n/g, "\\n") // Ensure newlines are properly escaped
              .replace(/\\t/g, "\\t"); // Ensure tabs are properly escaped

            try {
              parsedQuestion = JSON.parse(cleanedContent);
            } catch {
              // Method 4: Try to fix specific JSON issues
              const fixedContent = cleanedContent
                .replace(/([{,]\s*)"([^"]*)"(\s*:\s*)"([^"]*(?:\\.[^"]*)*)"/g, '$1"$2"$3"$4"') // Fix quotes in values
                .replace(/\n/g, '\\n')  // Escape actual newlines
                .replace(/\r/g, '\\r')  // Escape carriage returns
                .replace(/\t/g, '\\t'); // Escape tabs

              parsedQuestion = JSON.parse(fixedContent);
            }
          }
        }
      }

      // Validate the parsed question
      if (parsedQuestion && this.validateQuestion(parsedQuestion)) {
      // Ensure required fields are present and clean up any empty fields
        parsedQuestion.testType = testType;
        parsedQuestion.section = section;
        parsedQuestion.difficulty = difficulty;

        // Remove empty passage or image fields if they exist
        if (parsedQuestion.passage === "" || parsedQuestion.passage === null || parsedQuestion.passage === undefined) {
          delete parsedQuestion.passage;
        }
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
    for (let i = 0; i < question.options.length; i++) {
      const option = question.options[i];
      if (typeof option !== "string" || option.trim().length < 1) {
        return false;
      }
    }

    return true;
  } async evaluatePerformance(testResults, retryCount = 0) {
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
        a.accuracy > b.accuracy ? a : b, sectionAccuracies[0]
      );
      const worstSection = sectionAccuracies.reduce((a, b) =>
        a.accuracy < b.accuracy ? a : b, sectionAccuracies[0]
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
        - Words commonly seen on GRE/GMAT tests (like: ameliorate, ubiquitous, perspicacious, etc.)
        - Engaging explanations with memory techniques
        - Difficulty appropriate for level ${userLevel}
        - NO reading passage required - focus on vocabulary in sentence contexts`,

      "advanced-vocabulary": `Create an advanced vocabulary lesson with:
        - 6 challenging vocabulary questions using sophisticated words
        - Words like: magnanimous, perfunctory, vacillate, sanguine, etc.
        - Complex sentence contexts
        - Level ${userLevel} difficulty
        - NO reading passage required - use varied sentence contexts`,

      "vocabulary-context": `Create a vocabulary-in-context lesson with:
        - 5 questions where students must determine word meaning from context
        - Include context clue strategies
        - Mixed difficulty vocabulary words
        - Level ${userLevel} appropriate
        - NO reading passage required - use diverse sentence examples`,

      "word-roots-prefixes": `Create a word roots and prefixes lesson with:
        - 5 questions about breaking down unfamiliar words
        - Focus on common roots (bene-, mal-, -ology, -phobia, etc.)
        - Include word family connections
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on word analysis`,

      "synonyms-antonyms": `Create a synonyms and antonyms lesson with:
        - 5 questions testing word relationships
        - Include nuanced differences between similar words
        - Both synonym and antonym identification
        - Level ${userLevel} appropriate
        - NO reading passage required - use word comparison exercises`,

      "reading-strategies": `Create a reading comprehension lesson with:
        - A well-structured passage (200-250 words) about science, literature, or social issues
        - 4 questions testing different reading skills (main idea, inference, details, tone)
        - Strategy tips for each question type
        - Level ${userLevel} difficulty`,

      "passage-analysis": `Create a passage analysis lesson with:
        - A complex argumentative passage (250-300 words)
        - 5 questions analyzing structure, evidence, and reasoning
        - Focus on critical analysis skills
        - Level ${userLevel} complexity`,

      "main-idea-details": `Create a main idea and supporting details lesson with:
        - A descriptive or expository passage (200 words)
        - 4 questions distinguishing main ideas from supporting details
        - Include passage organization questions
        - Level ${userLevel} appropriate`,

      "inference-reasoning": `Create an inference and reasoning lesson with:
        - A nuanced passage requiring careful reading (220-280 words)
        - 5 questions requiring logical inference
        - Include "what can be concluded" type questions
        - Level ${userLevel} complexity`,

      "tone-attitude": `Create a tone and attitude lesson with:
        - A passage with clear authorial perspective (200-250 words)
        - 4 questions about author's tone, attitude, and purpose
        - Include bias detection questions
        - Level ${userLevel} difficulty`,

      "math-foundations": `Create a math fundamentals lesson with:
        - 5 step-by-step arithmetic and basic algebra problems
        - Clear explanations of mathematical concepts
        - Include word problems and pure math
        - Level ${userLevel} appropriate difficulty
        - NO reading passage required - focus on mathematical problem-solving`,

      "arithmetic-basics": `Create an arithmetic essentials lesson with:
        - 5 problems covering fractions, decimals, percentages
        - Include practical applications
        - Step-by-step solution methods
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on numerical calculations`,

      "basic-algebra": `Create a basic algebra lesson with:
        - 5 linear equation and inequality problems
        - Include variable manipulation and solving techniques
        - Mix of pure algebra and word problems
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on algebraic concepts`,

      "advanced-algebra": `Create an advanced algebra lesson with:
        - 5 complex algebraic problems (polynomials, factoring, exponents)
        - Include advanced techniques like completing the square
        - Mix of abstract and applied problems
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on advanced algebraic concepts`,

      "linear-equations": `Create a linear equations lesson with:
        - 5 problems focusing on solving linear equations and inequalities
        - Include graphing and system solving techniques
        - Step-by-step algebraic manipulation
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on linear equation solving`,

      "quadratic-equations": `Create a quadratic equations lesson with:
        - 5 problems involving quadratic equations and functions
        - Include factoring, quadratic formula, and graphing
        - Real-world applications of quadratics
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on quadratic problem solving`,

      "systems-equations": `Create a systems of equations lesson with:
        - 5 problems solving multiple equations simultaneously
        - Include substitution and elimination methods
        - Mix of linear and non-linear systems
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on system solving techniques`,

      "fractions-decimals": `Create a fractions and decimals lesson with:
        - 5 problems covering fraction operations and decimal conversions
        - Include mixed numbers and complex fraction operations
        - Practical applications and comparisons
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on fraction/decimal calculations`,

      "percentages-ratios": `Create a percentages and ratios lesson with:
        - 5 problems involving percentage calculations and ratio/proportion
        - Include percent change, ratio comparisons, and scaling
        - Real-world applications (discounts, tips, proportional reasoning)
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on percentage and ratio problems`,

      "geometry-basics": `Create a geometry fundamentals lesson with:
        - 5 problems involving area, perimeter, angles, and basic shapes
        - Include coordinate geometry concepts
        - Visual problem-solving techniques
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on geometric calculations`,

      "coordinate-geometry": `Create a coordinate geometry lesson with:
        - 5 problems involving points, lines, and shapes on coordinate plane
        - Include distance formula, midpoint, and slope calculations
        - Graphing and coordinate transformations
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on coordinate geometry concepts`,

      "triangles-polygons": `Create a triangles and polygons lesson with:
        - 5 problems focusing on triangle properties and polygon characteristics
        - Include area calculations, angle relationships, and similarity
        - Mix of right triangles and general triangle problems
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on triangle and polygon properties`,

      "circles-arcs": `Create a circles and arcs lesson with:
        - 5 problems involving circle properties and arc measurements
        - Include circumference, area, central/inscribed angles
        - Sector and arc length calculations
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on circle geometry`,

      "solid-geometry": `Create a 3D geometry lesson with:
        - 5 problems calculating volumes and surface areas of 3D shapes
        - Include cubes, spheres, cylinders, pyramids, and prisms
        - Real-world applications of 3D measurements
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on 3D geometric calculations`,

      "data-interpretation": `Create a data interpretation lesson with:
        - 4 problems analyzing charts, graphs, and tables
        - Include percentage calculations and comparisons
        - Real-world data scenarios
        - Level ${userLevel} complexity
        - NO reading passage required - focus on data analysis skills`,

      "statistics-basics": `Create a statistics fundamentals lesson with:
        - 5 problems involving mean, median, mode, and range calculations
        - Include data set analysis and interpretation
        - Mix of discrete and continuous data problems
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on basic statistical concepts`,

      "probability-basics": `Create a probability concepts lesson with:
        - 5 problems calculating basic probabilities and chance
        - Include combinations, permutations, and conditional probability
        - Real-world probability scenarios
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on probability calculations`,

      "advanced-statistics": `Create an advanced statistics lesson with:
        - 5 problems involving standard deviation, correlation, and distributions
        - Include normal distribution and statistical inference
        - Complex statistical analysis scenarios
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on advanced statistical concepts`,

      "critical-reasoning": `Create a critical reasoning lesson with:
        - 4 logical reasoning problems with clear arguments
        - Different argument types (strengthen, weaken, assumption)
        - Clear explanation of logical structures
        - Level ${userLevel} complexity
        - NO reading passage required - focus on argument analysis`,

      "argument-structure": `Create an argument structure lesson with:
        - 5 problems analyzing logical arguments
        - Focus on premises, conclusions, and logical flow
        - Include argument identification and evaluation
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on logical reasoning`,

      "problem-solving-strategies": `Create a problem-solving strategies lesson with:
        - 4 multi-step problems requiring strategic thinking
        - Include estimation and elimination techniques
        - Mix of verbal and quantitative reasoning
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on strategic problem solving`,

      "estimation-techniques": `Create an estimation and approximation lesson with:
        - 5 problems focusing on quick calculation methods
        - Include rounding, benchmarking, and mental math
        - Time-saving estimation strategies
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on estimation skills`,

      "time-management": `Create a time management lesson with:
        - 4 practice scenarios with time constraints
        - Include pacing strategies and priority setting
        - Test-taking time optimization techniques
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on time management strategies`,

      "elimination-strategies": `Create an answer elimination lesson with:
        - 5 problems demonstrating elimination techniques
        - Include logical reasoning and process of elimination
        - Strategic approach to multiple choice questions
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on elimination strategies`,

      "exponentials-logarithms": `Create an exponentials and logarithms lesson with:
        - 5 problems involving exponential and logarithmic functions
        - Include growth/decay models and logarithmic properties
        - Advanced mathematical applications
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on exponential and logarithmic concepts`,

      "sequences-series": `Create a sequences and series lesson with:
        - 5 problems involving arithmetic and geometric sequences
        - Include series summation and pattern recognition
        - Mathematical sequence applications
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on sequence and series concepts`,

      "grammar-essentials": `Create a grammar essentials lesson with:
        - 5 problems focusing on fundamental grammar rules
        - Include subject-verb agreement, tense consistency, and punctuation
        - Common grammar errors and corrections
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on grammar fundamentals`,

      "sentence-structure": `Create a sentence structure lesson with:
        - 5 problems improving sentence clarity and style
        - Include parallel structure, modifier placement, and conciseness
        - Sentence combining and revision techniques
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on sentence construction`,

      "essay-writing": `Create an essay writing strategies lesson with:
        - 4 problems focusing on essay structure and organization
        - Include thesis development, paragraph structure, and transitions
        - Argumentative and analytical writing techniques
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on essay writing skills`,

      "rhetorical-analysis": `Create a rhetorical analysis lesson with:
        - 4 problems analyzing rhetorical devices and effectiveness
        - Include ethos, pathos, logos, and persuasive techniques
        - Critical analysis of argumentative strategies
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on rhetorical analysis skills`,

      "gre-specific-strategies": `Create a GRE-specific strategies lesson with:
        - 5 problems using GRE-specific techniques and approaches
        - Include text completion, sentence equivalence, and quantitative comparison
        - GRE format-specific strategies
        - Level ${userLevel} appropriate
        - NO reading passage required - focus on GRE-specific techniques`,

      "gmat-specific-strategies": `Create a GMAT-specific strategies lesson with:
        - 5 problems using GMAT-specific techniques and approaches
        - Include data sufficiency, critical reasoning, and integrated reasoning
        - GMAT format-specific strategies
        - Level ${userLevel} difficulty
        - NO reading passage required - focus on GMAT-specific techniques`,
    };

    // Determine if this module needs a passage
    const passageModules = [
      "reading-strategies",
      "passage-analysis",
      "main-idea-details",
      "inference-reasoning",
      "tone-attitude",
    ];

    const requiresPassage = passageModules.includes(moduleId);

    const baseStructure = {
      id: `${moduleId}-lesson-${Date.now()}`,
      title: "Engaging Lesson Title",
      description: "Brief lesson description",
      questions: [
        {
          question: "Question text with context",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation:
            "Detailed explanation with learning tips and strategy advice",
        },
      ],
      tips: ["Study tip 1", "Study tip 2", "Strategy tip 3"],
      nextSteps: "What to practice next",
    };

    if (requiresPassage) {
      baseStructure.passage =
        "Include a well-written passage here for reading comprehension";
    }

    const prompt = `${
      lessonPrompts[moduleId] || lessonPrompts["vocabulary-basics"]
    }

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
${JSON.stringify(baseStructure, null, 2)}

${requiresPassage
        ? "This module requires a reading passage. Include a substantive, well-written passage of 200-300 words."
        : "This module does NOT require a reading passage. Focus on individual questions with context."
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
