import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Grid,
  Tooltip,
  IconButton,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Skeleton,
  Fade,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import {
  PlayArrow,
  CheckCircle,
  Cancel,
  Lightbulb,
  EmojiEvents,
  Star,
  Timer,
  Psychology,
  TrendingUp,
  Close,
  NavigateNext,
  NavigateBefore,
  Flag,
  Bookmark,
  BookmarkBorder,
  Refresh,
  ArrowBack,
  QuestionAnswer,
  Assessment,
  Speed,
  Celebration,
  School,
  AutoAwesome,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import useAuth from "../context/useAuth";
import firebaseService from "../services/firebase";
import openRouterService from "../services/openrouter";

const InteractiveLearningExperience = ({ module, onComplete, onBack }) => {
  const { user } = useAuth();

  // State Management
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionData, setSessionData] = useState({
    startTime: Date.now(),
    timeSpent: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    conceptsLearned: [],
    hintsUsed: 0,
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);

  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);

  // Configuration constants
  const LEARNING_STEPS = [
    {
      label: "Learning Concepts",
      description: "Master key concepts with interactive explanations",
    },
    {
      label: "Guided Practice",
      description: "Practice with step-by-step guidance",
    },
    {
      label: "Independent Practice",
      description: "Test your knowledge independently",
    },
    {
      label: "Mastery Assessment",
      description: "Demonstrate your mastery",
    },
  ];

  // Helper to decide if passage should be included
  const shouldIncludePassage = useCallback((m) => {
    if (!m) return false;
    const id = m.id || "";
    const cat = m.category || "";
    if (["verbal", "integrated", "analytical"].includes(cat)) return true;
    return /reading|comprehension|graphics|data|analysis|interpretation/i.test(
      id
    );
  }, []);

  // Normalizer to enforce consistent shape
  const normalizeQuestion = useCallback((q, index) => {
    const opts = Array.isArray(q.options)
      ? q.options.slice(0, 6)
      : Array.isArray(q.choices)
      ? q.choices.slice(0, 6)
      : ["Option A", "Option B", "Option C", "Option D"];
    return {
      id: q.id || `q${index + 1}`,
      type:
        q.type ||
        (index < 0.3 * 10
          ? "concept"
          : index < 0.7 * 10
          ? "guided"
          : index < 0.9 * 10
          ? "independent"
          : "mastery"),
      question: q.question || q.prompt || q.text || `Question ${index + 1}`,
      options: opts.length >= 2 ? opts : [...opts, "Option X"],
      correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
      explanation: q.explanation || q.rationale || "Explanation not available.",
      hint: q.hint || q.clue || "Think about the underlying concept.",
      difficulty: q.difficulty || q.level || 2,
      concepts: Array.isArray(q.concepts)
        ? q.concepts
        : q.concepts
        ? [String(q.concepts)]
        : [],
      learningObjective:
        q.learningObjective || q.objective || "Master key concepts",
      passage: q.passage || q.context || null,
      images: Array.isArray(q.images) ? q.images : q.image ? [q.image] : [],
    };
  }, []);

  // Generate Rich Learning Content (uses service with robust fallbacks) - moved above initializeLearningExperience to avoid TDZ error
  const generateLearningContent = useCallback(
    async (module) => {
      const baseCount = Number.isFinite(module?.totalQuestions)
        ? module.totalQuestions
        : Number.isFinite(module?.lessons)
        ? module.lessons
        : 10;
      const questionCount = Math.max(1, Math.min(50, baseCount));
      const difficultyStr =
        typeof module?.difficulty === "number"
          ? module.difficulty <= 1
            ? "easy"
            : module.difficulty <= 2
            ? "medium"
            : "hard"
          : module?.difficulty || "medium";
      const includePassage = shouldIncludePassage(module);
      try {
        const questions = await openRouterService.generateLearningQuestions({
          topic: module.title,
          category: module.category,
          difficulty: difficultyStr,
          questionCount,
          includePassage,
          includeImages: includePassage,
          moduleMeta: {
            description: module.description,
            prerequisites: module.prerequisites,
            badges: module.badges,
            duration: module.duration,
            xpReward: module.xpReward,
          },
        });
        const arr = Array.isArray(questions) ? questions : [];
        return arr.map((q, i) => normalizeQuestion(q, i));
      } catch (err) {
        console.warn("Falling back to local question generator:", err?.message);
        return generateFallbackQuestions(module, questionCount).questions.map(
          (q, i) => normalizeQuestion(q, i)
        );
      }
    },
    [normalizeQuestion, shouldIncludePassage]
  );

  // Initialize learning experience (placed after generateLearningContent)
  const initializeLearningExperience = useCallback(async () => {
    try {
      setLoading(true);

      // Generate comprehensive learning content
      const learningContent = await generateLearningContent(module);
      const generated = Array.isArray(learningContent)
        ? learningContent
        : learningContent?.questions || [];
      setQuestions(generated);
      setSessionData((prev) => ({
        ...prev,
        totalQuestions: generated.length,
      }));
    } catch (e) {
      console.error("Error initializing learning experience", e);
      setQuestions([]);
      setSessionData((prev) => ({ ...prev, totalQuestions: 0 }));
    } finally {
      setLoading(false);
    }
  }, [module, generateLearningContent]);

  // Initialize on mount
  useEffect(() => {
    if (module) {
      initializeLearningExperience();
    }

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [module, initializeLearningExperience]);

  // Per-question timer: reset on question change, pause during explanation/loading
  useEffect(() => {
    setQuestionTime(0);
    if (loading || showExplanation) return;
    const qTimer = setInterval(() => setQuestionTime((s) => s + 1), 1000);
    return () => clearInterval(qTimer);
  }, [currentQuestionIndex, showExplanation, loading]);

  const generateFallbackQuestions = (module, count = 10) => {
    const total = Math.max(1, count || 10);
    const baseQuestions = [];
    for (let i = 0; i < total; i++) {
      baseQuestions.push({
        id: `q${i + 1}`,
        type:
          i < total * 0.3
            ? "concept"
            : i < total * 0.7
            ? "guided"
            : i < total * 0.9
            ? "independent"
            : "mastery",
        question: `Sample ${module.category} question ${i + 1} for ${
          module.title
        }`,
        options: [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`,
        ],
        correctAnswer: 0,
        explanation: `Detailed explanation for question ${
          i + 1
        }. This demonstrates the key concept...`,
        hint: `Helpful hint: Consider the key principle of...`,
        difficulty: Math.floor(Math.random() * 5) + 1,
        concepts: [`Concept ${i + 1}A`, `Concept ${i + 1}B`],
        learningObjective:
          module.learningObjectives?.[0] || "Master key concepts",
      });
    }
    return { questions: baseQuestions };
  };

  // Handle Answer Selection
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  // Submit Answer and Show Explanation
  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    // Update session data (guard concepts array)
    setSessionData((prev) => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      conceptsLearned: [
        ...new Set([
          ...prev.conceptsLearned,
          ...(Array.isArray(currentQuestion.concepts)
            ? currentQuestion.concepts
            : []),
        ]),
      ],
    }));

    setShowExplanation(true);

    // Show celebration for correct answers
    if (isCorrect) {
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 2000);
    }
  };

  // Next Question
  const nextQuestion = () => {
    setShowExplanation(false);
    setShowHint(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeLearningSession();
    }
  };

  // Complete Learning Session
  const completeLearningSession = async () => {
    try {
      setSubmitting(true);

      const finalSessionData = {
        ...sessionData,
        timeSpent: timeElapsed,
        completedAt: new Date().toISOString(),
        accuracy:
          (sessionData.correctAnswers / sessionData.totalQuestions) * 100,
      };

      // Save to Firebase
      await firebaseService.saveLearningSession(user.uid, {
        moduleId: module.id,
        ...finalSessionData,
      });

      // Update module score
      await firebaseService.saveModuleScore(user.uid, module.id, {
        correct: sessionData.correctAnswers,
        total: sessionData.totalQuestions,
        accuracy: finalSessionData.accuracy,
        timeSpent: timeElapsed,
        lastAttempt: new Date().toISOString(),
      });

      // Update user progress
      await firebaseService.updateLearningProgress(user.uid, {
        xp:
          finalSessionData.accuracy >= 80
            ? module.xpReward
            : Math.floor(module.xpReward * 0.5),
        totalXP:
          finalSessionData.accuracy >= 80
            ? module.xpReward
            : Math.floor(module.xpReward * 0.5),
        completedModules: 1,
      });

      onComplete(finalSessionData);
    } catch {
      console.error("Error completing learning session");
    } finally {
      setSubmitting(false);
    }
  };

  // Show Hint
  const showQuestionHint = () => {
    setShowHint(true);
    setSessionData((prev) => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));
  };

  // Toggle Bookmark
  const toggleBookmark = (questionIndex) => {
    setBookmarkedQuestions((prev) =>
      prev.includes(questionIndex)
        ? prev.filter((q) => q !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  // Format Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 2, mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const hasAnswered = userAnswer !== undefined;
  const isCorrect =
    hasAnswered && userAnswer === currentQuestion?.correctAnswer;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header with Progress */}
      <Fade in timeout={600}>
        <Paper elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={onBack}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interactive Learning Experience
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                icon={<Timer />}
                label={formatTime(timeElapsed)}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<Speed />}
                label={formatTime(questionTime)}
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<QuestionAnswer />}
                label={`${currentQuestionIndex + 1}/${questions.length}`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">
                {Math.round(
                  ((currentQuestionIndex + 1) / questions.length) * 100
                )}
                %
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((currentQuestionIndex + 1) / questions.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: "linear-gradient(90deg, #4caf50, #81c784)",
                },
              }}
            />
          </Box>

          {/* Stats */}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="success.main">
                  {sessionData.correctAnswers}
                </Typography>
                <Typography variant="caption">Correct</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="error.main">
                  {currentQuestionIndex + 1 - sessionData.correctAnswers - 1}
                </Typography>
                <Typography variant="caption">Incorrect</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="primary.main">
                  {sessionData.conceptsLearned.length}
                </Typography>
                <Typography variant="caption">Concepts</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="warning.main">
                  {sessionData.hintsUsed}
                </Typography>
                <Typography variant="caption">Hints</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Question Content */}
      {currentQuestion && (
        <Slide direction="left" in timeout={800}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            {/* Passage (if any) */}
            {currentQuestion.passage && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
                  backgroundColor: "primary.light",
                  borderRadius: 1,
                  opacity: 0.9,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Passage
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                >
                  {currentQuestion.passage}
                </Typography>
              </Box>
            )}
            {/* Images (if any) */}
            {Array.isArray(currentQuestion.images) &&
              currentQuestion.images.length > 0 && (
                <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {currentQuestion.images.map((src, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={src}
                      alt={`Illustration ${i + 1}`}
                      sx={{
                        maxWidth: "200px",
                        borderRadius: 2,
                        boxShadow: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ))}
                </Box>
              )}

            {/* Question Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={currentQuestion.type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Difficulty: ${currentQuestion.difficulty}/5`}
                    size="small"
                    color={
                      currentQuestion.difficulty <= 2
                        ? "success"
                        : currentQuestion.difficulty <= 3
                        ? "warning"
                        : "error"
                    }
                    variant="outlined"
                  />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", lineHeight: 1.4 }}
                >
                  {currentQuestion.question}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Bookmark this question">
                  <IconButton
                    onClick={() => toggleBookmark(currentQuestionIndex)}
                    color={
                      bookmarkedQuestions.includes(currentQuestionIndex)
                        ? "primary"
                        : "default"
                    }
                  >
                    {bookmarkedQuestions.includes(currentQuestionIndex) ? (
                      <Bookmark />
                    ) : (
                      <BookmarkBorder />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Get a hint">
                  <IconButton onClick={showQuestionHint} disabled={showHint}>
                    <Lightbulb />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Hint */}
            <Collapse in={showHint}>
              <Alert severity="info" sx={{ mb: 3 }} icon={<Lightbulb />}>
                <Typography variant="body2">
                  <strong>Hint:</strong> {currentQuestion.hint}
                </Typography>
              </Alert>
            </Collapse>

            {/* Answer Options */}
            <RadioGroup
              value={userAnswer || ""}
              onChange={(e) =>
                handleAnswerSelect(
                  currentQuestionIndex,
                  parseInt(e.target.value)
                )
              }
            >
              {currentQuestion.options?.map((option, index) => (
                <Grow key={index} in timeout={600 + index * 200}>
                  <Paper
                    elevation={userAnswer === index ? 3 : 1}
                    sx={{
                      mb: 2,
                      border: showExplanation
                        ? index === currentQuestion.correctAnswer
                          ? "2px solid #4caf50"
                          : index === userAnswer &&
                            index !== currentQuestion.correctAnswer
                          ? "2px solid #f44336"
                          : "1px solid #e0e0e0"
                        : userAnswer === index
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                      borderRadius: 2,
                      backgroundColor: showExplanation
                        ? index === currentQuestion.correctAnswer
                          ? "success.light"
                          : index === userAnswer &&
                            index !== currentQuestion.correctAnswer
                          ? "error.light"
                          : "background.paper"
                        : userAnswer === index
                        ? "primary.light"
                        : "background.paper",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: !showExplanation
                          ? "translateY(-2px)"
                          : "none",
                        boxShadow: !showExplanation ? 4 : undefined,
                      },
                    }}
                  >
                    <FormControlLabel
                      value={index}
                      control={<Radio disabled={showExplanation} />}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", py: 1 }}
                        >
                          <Typography sx={{ flex: 1, px: 1 }}>
                            {option}
                          </Typography>
                          {showExplanation && (
                            <Box sx={{ ml: 2 }}>
                              {index === currentQuestion.correctAnswer && (
                                <CheckCircle color="success" />
                              )}
                              {index === userAnswer &&
                                index !== currentQuestion.correctAnswer && (
                                  <Cancel color="error" />
                                )}
                            </Box>
                          )}
                        </Box>
                      }
                      sx={{ margin: 0, width: "100%", px: 2, py: 1 }}
                    />
                  </Paper>
                </Grow>
              ))}
            </RadioGroup>

            {/* Action Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <Box sx={{ display: "flex", gap: 2 }}>
                {!showExplanation && hasAnswered && (
                  <Button
                    variant="contained"
                    onClick={submitAnswer}
                    startIcon={<Assessment />}
                    size="large"
                  >
                    Submit Answer
                  </Button>
                )}

                {showExplanation && (
                  <Button
                    variant="contained"
                    onClick={nextQuestion}
                    endIcon={
                      currentQuestionIndex === questions.length - 1 ? (
                        <EmojiEvents />
                      ) : (
                        <NavigateNext />
                      )
                    }
                    size="large"
                    disabled={submitting}
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Complete Module"
                      : "Next Question"}
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Slide>
      )}

      {/* Explanation Panel */}
      <Collapse in={showExplanation}>
        <Zoom in={showExplanation} timeout={600}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              background: isCorrect
                ? "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))"
                : "linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(229, 115, 115, 0.1))",
              border: `2px solid ${isCorrect ? "#4caf50" : "#f44336"}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              {isCorrect ? (
                <CheckCircle color="success" sx={{ fontSize: 32, mr: 2 }} />
              ) : (
                <Cancel color="error" sx={{ fontSize: 32, mr: 2 }} />
              )}
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {isCorrect ? "Excellent!" : "Not quite right"}
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 3 }}>
              {currentQuestion.explanation}
            </Typography>

            {/* Related Concepts */}
            {Array.isArray(currentQuestion.concepts) &&
              currentQuestion.concepts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Related Concepts:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {currentQuestion.concepts.map((concept, index) => (
                      <Chip
                        key={index}
                        label={concept}
                        icon={<Psychology />}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

            {/* Learning Objective */}
            <Alert severity="info" icon={<School />}>
              <Typography variant="body2">
                <strong>Learning Objective:</strong>{" "}
                {currentQuestion.learningObjective}
              </Typography>
            </Alert>
          </Paper>
        </Zoom>
      </Collapse>

      {/* Congratulations Dialog */}
      <Dialog
        open={showCongrats}
        onClose={() => setShowCongrats(false)}
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableRestoreFocus={false}
        keepMounted={false}
        aria-labelledby="congratulations-title"
        aria-describedby="congratulations-content"
      >
        <DialogContent
          sx={{ textAlign: "center", py: 4 }}
          id="congratulations-content"
        >
          <Celebration sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            Great Job!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You got that one right! Keep up the excellent work.
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default InteractiveLearningExperience;
