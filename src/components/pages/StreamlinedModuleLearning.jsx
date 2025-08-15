import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  Fade,
} from "@mui/material";
import {
  ArrowBack,
  PlayArrow,
  CheckCircle,
  School,
  Timer,
  Star,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import LoadingSpinner from "../atoms/LoadingSpinner";
import DifficultyBadge from "../atoms/DifficultyBadge";
import openRouterService from "../../services/openrouter";
import firebaseService from "../../services/firebase";
import useAuth from "../../context/useAuth";

/**
 * Streamlined module learning experience
 */
const StreamlinedModuleLearning = ({ module, onBack }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completionTracked, setCompletionTracked] = useState(false);

  // Calculate score when answers change
  useEffect(() => {
    const calculateScore = () => {
      const correctAnswers = questions.filter(
        (q, index) => answers[index] === q.correctAnswer
      ).length;
      const totalQuestions = questions.length;
      const percentage =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0;
      setScore(percentage);
    };

    if (questions.length > 0) {
      calculateScore();
    }
  }, [answers, questions]);

  // Track module completion
  useEffect(() => {
    const trackCompletion = async () => {
      if (showResults && !completionTracked && user?.uid) {
        try {
          await firebaseService.completeModule(user.uid, {
            id: module.id,
            title: module.title,
            category: module.category,
            xpReward: module.xpReward || 0,
            accuracy: score,
            duration: module.duration || 0,
          });
          setCompletionTracked(true);
        } catch (error) {
          console.error("Error tracking module completion:", error);
        }
      }
    };

    trackCompletion();
  }, [showResults, completionTracked, user, module, score]);

  // Generate questions for the module
  useEffect(() => {
    const generateQuestions = async () => {
      try {
        setLoading(true);

        // Use AI to generate questions based on the module
        const generatedQuestions =
          await openRouterService.generateLearningQuestions({
            topic: module.title,
            category: module.category,
            difficulty: module.difficulty,
            questionCount: module.questionCount || 10,
            includePassage:
              module.category === "verbal" && module.id.includes("reading"),
          });

        // Transform AI questions to our format
        const formattedQuestions = generatedQuestions.map((q, index) => ({
          id: index,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          concept: q.concept || module.category,
          passage: q.passage || null,
        }));

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Error generating questions:", error);

        // Fallback to mock questions if AI fails
        const mockQuestions = Array.from(
          { length: module.questionCount || 10 },
          (_, index) => ({
            id: index,
            question: `Sample question ${index + 1} for ${module.title}`,
            options: [
              "Option A - This is the first possible answer",
              "Option B - This is the second possible answer",
              "Option C - This is the third possible answer",
              "Option D - This is the fourth possible answer",
            ],
            correctAnswer: Math.floor(Math.random() * 4),
            explanation: `This is the explanation for question ${
              index + 1
            }. It provides detailed reasoning for why the correct answer is correct and why the other options are incorrect.`,
            concept: module.category,
          })
        );
        setQuestions(mockQuestions);
      } finally {
        setLoading(false);
      }
    };

    if (module) {
      generateQuestions();
    }
  }, [module]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    if (answers[questionId] !== undefined) return; // Prevent re-answering

    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <LoadingSpinner size={60} />
        </Box>
      </Container>
    );
  }

  if (showResults) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              🎉 Module Complete!
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {module.title}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {(() => {
                let chipColor = "default";
                if (score >= 80) chipColor = "success";
                else if (score >= 60) chipColor = "warning";

                return (
                  <Chip
                    icon={<Star />}
                    label={`${score}% Score`}
                    color={chipColor}
                    size="large"
                    sx={{ fontSize: "1rem", px: 2, py: 1 }}
                  />
                );
              })()}
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            You answered {Object.keys(answers).length} questions and earned{" "}
            <strong>+{module.xpReward} XP</strong>!
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBack />}
            >
              Back to Learning
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowResults(false);
                setCurrentStep(0);
                setAnswers({});
                setScore(0);
              }}
              startIcon={<PlayArrow />}
            >
              Try Again
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  const currentQuestion = questions[currentStep];
  const isAnswered = answers[currentStep] !== undefined;
  const selectedAnswer = answers[currentStep];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {module.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <DifficultyBadge difficulty={module.difficulty} size="small" />
            <Chip
              icon={<Timer />}
              label={`${module.duration} min`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Star />}
              label={`+${module.xpReward} XP`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Question {currentStep + 1} of {questions.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(score)}% correct
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(currentStep / questions.length) * 100}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      {/* Question */}
      {currentQuestion && (
        <Fade in timeout={300}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Question Text */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {currentQuestion.question}
                </Typography>
              </Paper>

              {/* Answer Options */}
              <Grid container spacing={2}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;

                  let buttonProps = {
                    variant: "outlined",
                    sx: {
                      p: 2,
                      textAlign: "left",
                      justifyContent: "flex-start",
                      border: "2px solid",
                      borderColor: "grey.300",
                      color: "text.primary",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "primary.50",
                      },
                    },
                  };

                  if (isAnswered) {
                    if (isSelected && isCorrect) {
                      buttonProps.sx.bgcolor = "success.50";
                      buttonProps.sx.borderColor = "success.main";
                      buttonProps.sx.color = "success.dark";
                    } else if (isSelected && !isCorrect) {
                      buttonProps.sx.bgcolor = "error.50";
                      buttonProps.sx.borderColor = "error.main";
                      buttonProps.sx.color = "error.dark";
                    } else if (isCorrect) {
                      buttonProps.sx.bgcolor = "success.100";
                      buttonProps.sx.borderColor = "success.main";
                      buttonProps.sx.color = "success.dark";
                    }
                  }

                  return (
                    <Grid
                      item
                      xs={12}
                      key={`question-${currentStep}-option-${index}`}
                    >
                      <Button
                        {...buttonProps}
                        fullWidth
                        disabled={isAnswered}
                        onClick={() => handleAnswerSelect(currentStep, index)}
                        startIcon={
                          isAnswered && isCorrect ? (
                            <CheckCircle color="success" />
                          ) : null
                        }
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {String.fromCharCode(65 + index)}. {option}
                        </Typography>
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Explanation */}
              {isAnswered && (
                <Fade in timeout={300}>
                  <Alert
                    severity={
                      selectedAnswer === currentQuestion.correctAnswer
                        ? "success"
                        : "error"
                    }
                    sx={{ mt: 3 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedAnswer === currentQuestion.correctAnswer
                        ? "✅ Correct!"
                        : "❌ Incorrect"}
                    </Typography>
                    <Typography variant="body2">
                      {currentQuestion.explanation}
                    </Typography>
                  </Alert>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <Typography variant="body2" color="text.secondary">
          {Object.keys(answers).length} of {questions.length} answered
        </Typography>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isAnswered}
          endIcon={
            currentStep === questions.length - 1 ? (
              <CheckCircle />
            ) : (
              <PlayArrow />
            )
          }
        >
          {currentStep === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Container>
  );
};

StreamlinedModuleLearning.propTypes = {
  module: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default StreamlinedModuleLearning;
