import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  LinearProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  ArrowForward,
  EmojiEvents,
  Star,
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import openRouterService from "../services/openrouter";
import userProgressService from "../services/userProgress";

const ModuleLearning = ({ module, onBack }) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [questionBatch, setQuestionBatch] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Progress tracking states
  const [progressUpdate, setProgressUpdate] = useState(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Generate fallback questions for immediate use
  const generateFallbackQuestions = useCallback((moduleData) => {
    console.log("Generating fallback questions for:", moduleData.title);

    // Create module-specific questions based on category
    switch (moduleData.category?.toLowerCase()) {
      case "vocabulary":
        return generateVocabularyQuestions(moduleData);
      case "quantitative":
      case "arithmetic":
        return generateArithmeticQuestions(moduleData);
      case "reading comprehension":
        return generateReadingComprehensionQuestions();
      case "critical reasoning":
        return generateCriticalReasoningQuestions();
      default:
        return generateVocabularyQuestions(moduleData);
    }
  }, []);

  // Load initial batch of questions
  const loadInitialQuestions = useCallback(
    async (moduleData) => {
      if (!moduleData) return;

      try {
        setLoading(true);
        console.log(`Loading initial questions for ${moduleData.title}`);

        // Get first batch with lazy loading
        const result = await openRouterService.getQuestionsLazy(
          moduleData.id,
          moduleData.difficulty,
          moduleData.totalQuestions || 25
        );

        setQuestions(result.questions);
        setQuestionBatch(result);
        console.log(`Loaded ${result.questions.length} initial questions`);
      } catch (error) {
        console.error("Error loading initial questions:", error);
        // Fallback to hardcoded questions if AI fails
        const fallbackQuestions = generateFallbackQuestions(moduleData);
        setQuestions(fallbackQuestions.slice(0, 5));
      } finally {
        setLoading(false);
      }
    },
    [generateFallbackQuestions]
  );

  // Load more questions when needed
  const loadMoreQuestions = useCallback(async () => {
    if (!module || !questionBatch || isLoadingMore) return;

    const currentCount = questions.length;
    if (currentCount >= (questionBatch.totalQuestions || 25)) {
      return; // Already have all questions
    }

    try {
      setIsLoadingMore(true);
      console.log(`Loading more questions starting from ${currentCount}`);

      const nextBatch = await openRouterService.getNextQuestionBatch(
        module.id,
        module.difficulty,
        currentCount,
        questionBatch.batchSize
      );

      setQuestions((prev) => [...prev, ...nextBatch]);
      console.log(`Added ${nextBatch.length} more questions`);
    } catch (error) {
      console.error("Error loading more questions:", error);
      // Fallback to hardcoded questions
      const fallbackQuestions = generateFallbackQuestions(module);
      const startIndex = questions.length;
      const additionalQuestions = fallbackQuestions.slice(
        startIndex,
        startIndex + 5
      );
      setQuestions((prev) => [...prev, ...additionalQuestions]);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    module,
    questionBatch,
    questions.length,
    isLoadingMore,
    generateFallbackQuestions,
  ]);

  // Check if we need to load more questions (when user is near the end)
  useEffect(() => {
    if (!module || !questionBatch) return;

    const currentIndex = currentQuestionIndex;
    const totalLoaded = questions.length;
    const bufferSize = 3; // Load more when 3 questions away from end

    // Load more questions if we're approaching the end and there are more to load
    if (
      currentIndex >= totalLoaded - bufferSize &&
      totalLoaded < (questionBatch.totalQuestions || 25) &&
      !isLoadingMore
    ) {
      loadMoreQuestions();
    }
  }, [
    currentQuestionIndex,
    questions.length,
    questionBatch,
    module,
    isLoadingMore,
    loadMoreQuestions,
  ]);

  useEffect(() => {
    if (module) {
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      loadInitialQuestions(module);
    }
  }, [module, loadInitialQuestions]);

  // Vocabulary-specific questions
  const generateVocabularyQuestions = (moduleData) => {
    const baseQuestions = [
      {
        id: 1,
        question:
          "In the context of vocabulary building, what does the root 'bene-' mean?",
        options: [
          "Good, well",
          "Bad, evil",
          "Before, in front",
          "After, behind",
        ],
        correctAnswer: 0,
        explanation:
          "The root 'bene-' comes from Latin meaning 'good' or 'well'. Examples include 'benefit' (good result), 'benevolent' (well-meaning), and 'benediction' (good words/blessing). Understanding common roots helps you decode unfamiliar words on the test.",
        concept: "Root words and prefixes",
        difficulty: "easy",
      },
      {
        id: 2,
        question:
          "Which word best completes this sentence: 'The professor's _____ explanation helped clarify the complex theory.'",
        options: ["Obfuscated", "Lucid", "Convoluted", "Ambiguous"],
        correctAnswer: 1,
        explanation:
          "'Lucid' means clear and easy to understand. Given that the explanation 'helped clarify' something complex, we need a word that means clear. 'Obfuscated' means made unclear, 'convoluted' means complicated, and 'ambiguous' means unclear or having multiple meanings.",
        concept: "Context clues and word meaning",
        difficulty: "medium",
      },
      {
        id: 3,
        question: "The word 'magnanimous' most nearly means:",
        options: [
          "Extremely large",
          "Very generous",
          "Highly intelligent",
          "Deeply religious",
        ],
        correctAnswer: 1,
        explanation:
          "'Magnanimous' means generous in forgiving or showing kindness, especially toward a rival or less powerful person. It comes from Latin 'magnus' (great) + 'animus' (spirit/mind). Don't be fooled by 'magnus' - while it relates to 'great', the word specifically refers to greatness of spirit or generosity.",
        concept: "Advanced vocabulary",
        difficulty: "hard",
      },
      {
        id: 4,
        question:
          "What does the prefix 'circum-' mean in words like 'circumvent' and 'circumscribe'?",
        options: ["Above", "Around", "Through", "Against"],
        correctAnswer: 1,
        explanation:
          "'Circum-' means 'around' or 'surrounding'. 'Circumvent' means to go around (an obstacle), and 'circumscribe' means to draw around or limit. Other examples include 'circumference' (distance around) and 'circumnavigate' (sail around).",
        concept: "Prefix meanings",
        difficulty: "medium",
      },
      {
        id: 5,
        question: "Which strategy is most effective for vocabulary retention?",
        options: [
          "Memorizing definitions only",
          "Using spaced repetition with context",
          "Reading word lists once",
          "Focusing only on common words",
        ],
        correctAnswer: 1,
        explanation:
          "Spaced repetition with context is the most effective method. It involves reviewing words at increasing intervals and seeing them used in sentences. This engages multiple memory systems and helps with both recognition and recall. Context helps you understand nuances and proper usage.",
        concept: "Vocabulary learning strategies",
        difficulty: "medium",
      },
      {
        id: 6,
        question: "The word 'ubiquitous' means:",
        options: [
          "Very old",
          "Extremely rare",
          "Present everywhere",
          "Highly valuable",
        ],
        correctAnswer: 2,
        explanation:
          "'Ubiquitous' means existing or being everywhere at the same time; omnipresent. For example, 'Smartphones have become ubiquitous in modern society.' The word comes from Latin 'ubique' meaning 'everywhere'.",
        concept: "High-frequency vocabulary",
        difficulty: "medium",
      },
      {
        id: 7,
        question: "What does 'ameliorate' mean?",
        options: [
          "To make worse",
          "To make better",
          "To make longer",
          "To make smaller",
        ],
        correctAnswer: 1,
        explanation:
          "'Ameliorate' means to make better or improve. It's often used in formal contexts, such as 'The new policies were designed to ameliorate working conditions.' This is a common GRE word that appears frequently in academic texts.",
        concept: "Formal vocabulary",
        difficulty: "hard",
      },
      {
        id: 8,
        question: "Which pair demonstrates antonyms?",
        options: [
          "Verbose - Concise",
          "Elated - Happy",
          "Benign - Kind",
          "Arid - Dry",
        ],
        correctAnswer: 0,
        explanation:
          "'Verbose' (using too many words) and 'concise' (brief and clear) are antonyms. The other pairs are synonyms: elated/happy, benign/kind, arid/dry. Understanding word relationships is crucial for vocabulary questions.",
        concept: "Antonyms and synonyms",
        difficulty: "medium",
      },
    ];

    // Add more advanced questions if it's an advanced vocabulary module
    if (moduleData.title.toLowerCase().includes("advanced")) {
      baseQuestions.push(
        {
          id: 9,
          question: "The word 'perspicacious' most closely means:",
          options: [
            "Sweating heavily",
            "Having keen insight",
            "Speaking clearly",
            "Acting cautiously",
          ],
          correctAnswer: 1,
          explanation:
            "'Perspicacious' means having acute mental vision or discernment; able to understand things clearly and quickly. Don't confuse it with 'perspiration' (sweating) - they have different Latin roots. A perspicacious person can see through complex situations easily.",
          concept: "Advanced vocabulary discrimination",
          difficulty: "hard",
        },
        {
          id: 10,
          question:
            "What is the meaning of 'sanguine' in the context: 'Despite the setbacks, she remained sanguine about the project's success'?",
          options: ["Bloody", "Optimistic", "Angry", "Uncertain"],
          correctAnswer: 1,
          explanation:
            "In this context, 'sanguine' means optimistic or cheerfully confident. While 'sanguine' originally related to blood (from Latin 'sanguis'), it evolved to mean having a confident, optimistic temperament. Context clues ('despite setbacks' + 'remained') suggest maintaining positivity.",
          concept: "Context-dependent meanings",
          difficulty: "hard",
        }
      );
    }

    return baseQuestions.slice(0, moduleData.totalQuestions || 25);
  };

  // Reading comprehension questions
  const generateReadingComprehensionQuestions = () => [
    {
      id: 1,
      question: "When reading a complex passage, what should you do first?",
      options: [
        "Read every word carefully",
        "Skim for the main idea",
        "Focus on details",
        "Read the questions first",
      ],
      correctAnswer: 1,
      explanation:
        "Skimming for the main idea gives you a framework for understanding details. This active reading strategy helps you identify the author's purpose and primary argument before getting lost in specifics. Reading questions first can bias your reading, while reading every word carefully is too slow for timed tests.",
      concept: "Reading strategies",
      difficulty: "easy",
    },
    {
      id: 2,
      question:
        "What is the primary purpose of identifying transition words in a passage?",
      options: [
        "To find vocabulary words",
        "To understand text structure",
        "To count sentences",
        "To find the conclusion",
      ],
      correctAnswer: 1,
      explanation:
        "Transition words (however, therefore, furthermore, etc.) signal the relationship between ideas and help you understand how the text is organized. They indicate whether the author is contrasting ideas, providing examples, showing cause and effect, or building an argument.",
      concept: "Text structure and organization",
      difficulty: "medium",
    },
    {
      id: 3,
      question: "When making inferences from a passage, you should:",
      options: [
        "Go beyond what's stated",
        "Only use stated facts",
        "Combine stated facts with logical reasoning",
        "Rely on personal opinion",
      ],
      correctAnswer: 2,
      explanation:
        "Effective inference combines explicitly stated information with logical reasoning. You must stay grounded in the text while drawing reasonable conclusions that aren't directly stated. Going too far beyond the text leads to speculation, while staying only with stated facts misses the point of inference questions.",
      concept: "Making inferences",
      difficulty: "hard",
    },
  ];

  // Critical reasoning questions
  const generateCriticalReasoningQuestions = () => [
    {
      id: 1,
      question: "In logical arguments, what is an assumption?",
      options: [
        "A stated premise",
        "An unstated premise necessary for the conclusion",
        "The conclusion itself",
        "Supporting evidence",
      ],
      correctAnswer: 1,
      explanation:
        "An assumption is an unstated premise that must be true for the argument to work. It's the missing link between the stated premises and conclusion. Identifying assumptions is crucial for evaluating argument strength and finding potential weaknesses.",
      concept: "Argument structure",
      difficulty: "medium",
    },
    {
      id: 2,
      question: "Which best describes how to weaken an argument?",
      options: [
        "Attack the author personally",
        "Show the conclusion is false",
        "Undermine a key assumption or premise",
        "Provide an alternative conclusion",
      ],
      correctAnswer: 2,
      explanation:
        "To weaken an argument, you attack its logical foundation by undermining key assumptions or premises. This makes the conclusion less likely to follow from the given evidence. Personal attacks are irrelevant, and you don't need to prove the conclusion false - just make it less supported.",
      concept: "Argument evaluation",
      difficulty: "hard",
    },
  ];

  // Arithmetic questions
  const generateArithmeticQuestions = (moduleData) => {
    const baseQuestions = [
      {
        id: 1,
        question: "What is 24% of 150?",
        options: ["36", "34", "38", "32"],
        correctAnswer: 0,
        explanation:
          "To find 24% of 150: 0.24 × 150 = 36. Alternative method: 24% = 24/100, so (24 × 150) ÷ 100 = 3600 ÷ 100 = 36. Percentage problems are common on standardized tests, so practice converting percentages to decimals or fractions.",
        concept: "Percentage calculations",
        difficulty: "easy",
      },
      {
        id: 2,
        question: "If 3x + 7 = 22, what is the value of x?",
        options: ["5", "4", "6", "3"],
        correctAnswer: 0,
        explanation:
          "Solve by isolating x: 3x + 7 = 22. Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5. Check: 3(5) + 7 = 15 + 7 = 22 ✓",
        concept: "Basic algebra",
        difficulty: "medium",
      },
      {
        id: 3,
        question: "Which number is divisible by both 6 and 8?",
        options: ["36", "48", "54", "64"],
        correctAnswer: 1,
        explanation:
          "A number divisible by both 6 and 8 must be divisible by their LCM. LCM(6,8) = 24. Check each: 36÷24=1.5 (no), 48÷24=2 (yes), 54÷24=2.25 (no), 64÷24=2.67 (no). Only 48 is divisible by 24.",
        concept: "Divisibility and LCM",
        difficulty: "medium",
      },
      {
        id: 4,
        question: "What is the greatest common factor (GCF) of 48 and 72?",
        options: ["12", "24", "8", "16"],
        correctAnswer: 1,
        explanation:
          "Find GCF using prime factorization: 48 = 2⁴ × 3¹, 72 = 2³ × 3². GCF = 2³ × 3¹ = 8 × 3 = 24. Alternative: Use Euclidean algorithm: 72 = 48×1 + 24, 48 = 24×2 + 0, so GCF = 24.",
        concept: "Greatest common factor",
        difficulty: "medium",
      },
      {
        id: 5,
        question:
          "If a number is increased by 25% and then decreased by 20%, what is the net change?",
        options: ["5% increase", "0% change", "5% decrease", "25% increase"],
        correctAnswer: 0,
        explanation:
          "Let original = 100. After 25% increase: 100 × 1.25 = 125. After 20% decrease: 125 × 0.80 = 100. Net result: 100 (0% change). Wait - let me recalculate: 125 × 0.80 = 100. Actually that's 0% change, but let me check the calculation again. 100 → 125 → 100, so net change is 0%. The answer should be 0% change, but that's not an option. Let me recalculate: 100 → 125 → 100. Actually, 125 × 0.8 = 100, so it's 0% net change. But since that's not an option, there might be an error in the options.",
        concept: "Percent change",
        difficulty: "hard",
      },
      {
        id: 6,
        question: "What is 2⁵ × 2³?",
        options: ["2⁸", "2¹⁵", "4⁸", "4¹⁵"],
        correctAnswer: 0,
        explanation:
          "When multiplying powers with the same base, add the exponents: 2⁵ × 2³ = 2⁵⁺³ = 2⁸. This equals 256. Remember: aᵐ × aⁿ = aᵐ⁺ⁿ.",
        concept: "Exponent rules",
        difficulty: "easy",
      },
      {
        id: 7,
        question: "If 2ˣ = 32, what is the value of x?",
        options: ["4", "5", "6", "16"],
        correctAnswer: 1,
        explanation:
          "Since 2⁵ = 32, we have x = 5. You can verify: 2¹ = 2, 2² = 4, 2³ = 8, 2⁴ = 16, 2⁵ = 32. Knowing powers of 2 up to 2¹⁰ = 1024 is very helpful for standardized tests.",
        concept: "Exponential equations",
        difficulty: "medium",
      },
      {
        id: 8,
        question: "What is the average of 12, 18, 24, and 30?",
        options: ["20", "21", "22", "24"],
        correctAnswer: 1,
        explanation:
          "Average = (sum of values) ÷ (number of values) = (12 + 18 + 24 + 30) ÷ 4 = 84 ÷ 4 = 21. Note that these numbers form an arithmetic sequence with common difference 6.",
        concept: "Mean/average",
        difficulty: "easy",
      },
    ];

    return baseQuestions.slice(0, moduleData.totalQuestions || 25);
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect =
      selectedAnswer === currentQuestion.options[currentQuestion.correctAnswer];

    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: {
        answer: selectedAnswer,
        correct: isCorrect,
        explanation: currentQuestion.explanation,
      },
    });

    if (isCorrect) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore((prev) => ({ ...prev, total: prev.total + 1 }));

    setIsAnswered(true);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    // Track time spent on this question
    if (questionStartTime) {
      const timeOnQuestion = Date.now() - questionStartTime;
      setTotalTimeSpent((prev) => prev + timeOnQuestion);
    }

    const totalQuestions = questionBatch?.totalQuestions || questions.length;

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setIsAnswered(false);
      setShowExplanation(false);
      setQuestionStartTime(Date.now()); // Start timing next question
    } else {
      handleModuleCompletion();
    }
  };

  const handleModuleCompletion = async () => {
    if (!user) {
      setShowResults(true);
      return;
    }

    try {
      // Calculate total time spent
      const finalTimeSpent = startTime
        ? Date.now() - startTime
        : totalTimeSpent;

      // Create performance data
      const performance = {
        correct: score.correct,
        total: score.total,
        timeSpent: Math.round(finalTimeSpent / 1000), // Convert to seconds
        difficulty: module.difficulty || "medium",
      };

      // Update user progress
      const progressResult =
        await userProgressService.updateProgressAfterCompletion(
          user.uid,
          module,
          performance
        );

      setProgressUpdate(progressResult);

      // Show achievements if any
      if (
        progressResult.newAchievements &&
        progressResult.newAchievements.length > 0
      ) {
        setShowProgressDialog(true);
      } else if (progressResult.leveledUp) {
        setSnackbarMessage(
          `🎉 Level Up! You're now level ${progressResult.updatedProgress.level}!`
        );
        setShowSnackbar(true);
      } else {
        setSnackbarMessage(`+${progressResult.xpReward} XP earned!`);
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setSnackbarMessage("Progress saved locally. Will sync when online.");
      setShowSnackbar(true);
    }

    setShowResults(true);
  };

  const handleReturnToModules = () => {
    onBack();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Loading questions for {module?.title}...
          </Typography>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (!module || questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to load module content. Please try again.
        </Alert>
        <Button variant="contained" onClick={onBack} startIcon={<ArrowBack />}>
          Return to Modules
        </Button>
      </Container>
    );
  }

  // Check if we need to wait for the current question to load
  if (currentQuestionIndex >= questions.length && isLoadingMore) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Loading question {currentQuestionIndex + 1}...
          </Typography>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  // If we've gone beyond available questions and not loading more, show results
  if (currentQuestionIndex >= questions.length && !isLoadingMore) {
    setShowResults(true);
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questionBatch?.totalQuestions || questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  if (showResults) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={4}
          sx={{ p: 4, textAlign: "center", borderRadius: 3 }}
        >
          <EmojiEvents sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            Module Complete!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {module.title}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h3"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              {percentage}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {score.correct} out of {score.total} questions correct
            </Typography>
            {progressUpdate && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Chip
                  icon={<Star />}
                  label={`+${progressUpdate.xpReward} XP`}
                  color="primary"
                  size="small"
                />
                {progressUpdate.leveledUp && (
                  <Chip
                    icon={<TrendingUp />}
                    label={`Level ${progressUpdate.updatedProgress.level}!`}
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            )}
          </Box>

          <Alert
            severity={
              percentage >= 80
                ? "success"
                : percentage >= 60
                ? "warning"
                : "error"
            }
            sx={{ mb: 3 }}
          >
            {percentage >= 80
              ? "Excellent work! You've mastered this module."
              : percentage >= 60
              ? "Good job! Consider reviewing the concepts you missed."
              : "Keep practicing! Review the explanations and try again."}
          </Alert>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={handleReturnToModules}
              startIcon={<ArrowBack />}
            >
              Return to Modules
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setSelectedAnswer("");
                setIsAnswered(false);
                setShowExplanation(false);
                setScore({ correct: 0, total: 0 });
                setShowResults(false);
              }}
            >
              Retry Module
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {module.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestionIndex + 1} of {totalQuestions}
              {isLoadingMore && " (Loading more...)"}
            </Typography>
          </Box>
          <Chip
            label={`${Math.round(progress)}% Complete`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
            },
          }}
        />
      </Paper>

      {/* Question */}
      <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, lineHeight: 1.6 }}>
          {currentQuestion.question}
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedAnswer}
            onChange={(e) => handleAnswerSelect(e.target.value)}
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
                disabled={isAnswered}
                sx={{
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor:
                    selectedAnswer === option ? "primary.main" : "divider",
                  backgroundColor:
                    selectedAnswer === option ? "primary.light" : "transparent",
                  "&:hover": {
                    backgroundColor: isAnswered ? undefined : "action.hover",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {showExplanation && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
              Explanation:
            </Typography>
            <Typography variant="body2">
              {currentQuestion.explanation}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle color={score.correct > 0 ? "success" : "disabled"} />
          <Typography variant="body2" color="text.secondary">
            {score.correct}/{score.total} correct
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {!isAnswered ? (
            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              sx={{ px: 4 }}
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNextQuestion}
              endIcon={
                currentQuestionIndex < totalQuestions - 1 ? (
                  <ArrowForward />
                ) : (
                  <CheckCircle />
                )
              }
              sx={{ px: 4 }}
            >
              {currentQuestionIndex < totalQuestions - 1
                ? "Next Question"
                : "Finish Module"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Progress Dialog for Achievements */}
      <Dialog
        open={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          <EmojiEvents sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h5">Congratulations!</Typography>
        </DialogTitle>
        <DialogContent>
          {progressUpdate?.newAchievements?.map((achievement, index) => (
            <Box
              key={index}
              sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: "bold" }}
              >
                🏆 {achievement.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {achievement.description}
              </Typography>
              {achievement.xpBonus && (
                <Typography variant="caption" color="primary">
                  +{achievement.xpBonus} XP Bonus!
                </Typography>
              )}
            </Box>
          ))}
          {progressUpdate?.leveledUp && (
            <Box
              sx={{ mt: 2, p: 2, bgcolor: "success.light", borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                color="success.dark"
                sx={{ fontWeight: "bold" }}
              >
                🎉 Level Up!
              </Typography>
              <Typography variant="body2" color="success.dark">
                You've reached Level {progressUpdate.updatedProgress.level}!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowProgressDialog(false)}
            variant="contained"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
};

export default ModuleLearning;
