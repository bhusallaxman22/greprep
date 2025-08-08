import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Flag as FlagIcon,
  SkipNext as SkipNextIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  QuestionMark as QuestionMarkIcon,
  Info as InfoIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { Slide, Fade, Zoom, Grow } from "@mui/material";

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  onFinish,
  selectedAnswer,
  isLoading,
  questionsArray,
  // Legacy props for backward compatibility
  currentQuestionIndex,
  onAnswerSelect,
  onNextQuestion,
  onPreviousQuestion,
  testConfig,
  onFinishTest,
  flaggedQuestions = [],
  onToggleFlag,
  onNavigateToQuestion,
  testComplete = false,
  score = null,
  onReturnToDashboard,
  onRetakeTest,
  onReviewAnswers,
  userAnswers = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showNavigation, setShowNavigation] = useState(false);

  // Prop compatibility - support both old and new prop names
  const actualQuestionIndex = questionNumber
    ? questionNumber - 1
    : currentQuestionIndex ?? 0;
  const handleAnswerSelect = onAnswer || onAnswerSelect || (() => {});
  const handleNextQuestion = onNext || onNextQuestion || (() => {});
  const handlePreviousQuestion = onPrevious || onPreviousQuestion || (() => {});
  const handleFinishTest = onFinish || onFinishTest || (() => {});

  // Calculate progress
  const progressPercentage =
    totalQuestions > 0 ? ((actualQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const isLastQuestion = actualQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = actualQuestionIndex === 0;
  const isQuestionFlagged = flaggedQuestions.includes(actualQuestionIndex);

  useEffect(() => {
    // Reset state when question changes
  }, [actualQuestionIndex]);

  const handleAnswerChange = (event) => {
    handleAnswerSelect(event.target.value);
  };

  const handleFlagToggle = () => {
    if (onToggleFlag) {
      onToggleFlag(actualQuestionIndex);
    }
  };

  // Enhanced navigation component
  const NavigationDialog = () => (
    <Dialog
      open={showNavigation}
      onClose={() => setShowNavigation(false)}
      maxWidth="sm"
      fullWidth
      disableEnforceFocus={false}
      disableAutoFocus={false}
      disableRestoreFocus={false}
      keepMounted={false}
      aria-labelledby="navigation-dialog-title"
      aria-describedby="navigation-dialog-content"
    >
      <DialogTitle id="navigation-dialog-title">
        Navigate to Question
      </DialogTitle>
      <DialogContent id="navigation-dialog-content">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
            gap: 1,
            mt: 1,
          }}
        >
          {Array.from({ length: totalQuestions }, (_, index) => {
            const isAnswered = userAnswers[index] !== undefined;
            const isFlagged = flaggedQuestions.includes(index);
            const isCurrent = index === actualQuestionIndex;

            return (
              <Button
                key={index}
                variant={isCurrent ? "contained" : "outlined"}
                color={
                  isCurrent ? "primary" : isAnswered ? "success" : "inherit"
                }
                onClick={() => {
                  if (onNavigateToQuestion) {
                    onNavigateToQuestion(index);
                  }
                  setShowNavigation(false);
                }}
                sx={{
                  minWidth: 60,
                  height: 60,
                  position: "relative",
                  fontSize: "0.875rem",
                  fontWeight: isCurrent ? "bold" : "normal",
                }}
              >
                {index + 1}
                {isFlagged && (
                  <FlagIcon
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      fontSize: 12,
                      color: theme.palette.warning.main,
                    }}
                  />
                )}
                {isAnswered && !isCurrent && (
                  <CheckCircleIcon
                    sx={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      fontSize: 12,
                      color: theme.palette.success.main,
                    }}
                  />
                )}
              </Button>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowNavigation(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  if (!question) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Question not available
        </Typography>
      </Container>
    );
  }

  // Test completion screen with enhanced animations
  if (testComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center" }}>
            <Zoom in timeout={1000}>
              <Card
                elevation={6}
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.primary.light}20)`,
                  border: `1px solid ${theme.palette.primary.light}`,
                  borderRadius: 3,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: 80,
                    color: theme.palette.success.main,
                    mb: 2,
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Test Completed!
                </Typography>

                {score !== null && (
                  <Grow in timeout={1200}>
                    <Box sx={{ my: 3 }}>
                      <Typography variant="h4" color="primary" gutterBottom>
                        Your Score: {score.percentage}%
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {score.correct} out of {score.total} questions correct
                      </Typography>
                    </Box>
                  </Grow>
                )}

                <Slide direction="up" in timeout={1400}>
                  <Stack spacing={2} sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onReturnToDashboard}
                      startIcon={<HomeIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      Return to Dashboard
                    </Button>

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={onRetakeTest}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          borderRadius: 2,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        Retake Test
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={onReviewAnswers}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          borderRadius: 2,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        Review Answers
                      </Button>
                    </Stack>
                  </Stack>
                </Slide>
              </Card>
            </Zoom>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth={question.passage ? "lg" : "md"} sx={{ py: 3 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Enhanced Header with Animation */}
          <Slide direction="down" in timeout={800}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Question {actualQuestionIndex + 1}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of {totalQuestions} questions
                  {question.passage && (
                    <Chip
                      label="Reading Comprehension"
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ ml: 1, fontSize: "0.7rem" }}
                    />
                  )}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip
                  title={isQuestionFlagged ? "Remove flag" : "Flag question"}
                >
                  <IconButton
                    onClick={handleFlagToggle}
                    color={isQuestionFlagged ? "warning" : "default"}
                    size="small"
                    sx={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <FlagIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Navigate to question">
                  <IconButton
                    onClick={() => setShowNavigation(true)}
                    size="small"
                    sx={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <QuestionMarkIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Slide>

          <Zoom in timeout={800}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                mb: 3,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            />
          </Zoom>

          {/* Question Content with Enhanced Animation */}
          <Slide direction="right" in timeout={1000}>
            <Box sx={{ mb: 3 }}>
              {/* Layout for passage-based questions */}
              {question.passage ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 3,
                  }}
                >
                  {/* Passage Display */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      bgcolor: theme.palette.grey[50],
                      border: `1px solid ${theme.palette.divider}`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        boxShadow: theme.shadows[6],
                      },
                      maxHeight: isMobile ? "none" : "70vh",
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        mb: 3,
                        position: "sticky",
                        top: 0,
                        bgcolor: theme.palette.grey[50],
                        py: 1,
                        mt: -1,
                      }}
                    >
                      <InfoIcon sx={{ mr: 1, fontSize: 24 }} />
                      Reading Passage
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        fontSize: isMobile ? "1rem" : "1.05rem",
                        textAlign: "justify",
                        whiteSpace: "pre-line",
                        color: theme.palette.text.primary,
                        fontFamily: '"Georgia", "Times New Roman", serif',
                        letterSpacing: "0.01em",
                      }}
                    >
                      {question.passage}
                    </Typography>
                  </Paper>

                  {/* Question Section */}
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    {/* Question Type Badge */}
                    <Fade in timeout={1200}>
                      <Box sx={{ mb: 3 }}>
                        <Chip
                          label={
                            question.type ||
                            testConfig?.type ||
                            "Reading Comprehension"
                          }
                          color="secondary"
                          variant="outlined"
                          sx={{
                            fontWeight: "bold",
                            borderRadius: 2,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      </Box>
                    </Fade>

                    {/* Question Text */}
                    <Grow in timeout={1400}>
                      <Typography
                        variant="h6"
                        sx={{
                          lineHeight: 1.6,
                          color: theme.palette.text.primary,
                          fontSize: isMobile ? "1.1rem" : "1.2rem",
                          fontWeight: 500,
                          mb: 3,
                        }}
                      >
                        {question.question}
                      </Typography>
                    </Grow>
                  </Paper>
                </Box>
              ) : (
                /* Non-passage question layout */
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  {/* Question Type Badge */}
                  <Fade in timeout={1200}>
                    <Box sx={{ mb: 3 }}>
                      <Chip
                        label={question.type || testConfig?.type || "Question"}
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          borderRadius: 2,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </Box>
                  </Fade>

                  {/* Question Text */}
                  <Grow in timeout={1400}>
                    <Typography
                      variant="h6"
                      sx={{
                        lineHeight: 1.6,
                        color: theme.palette.text.primary,
                        fontSize: isMobile ? "1.1rem" : "1.25rem",
                        fontWeight: 500,
                      }}
                    >
                      {question.question}
                    </Typography>
                  </Grow>
                </Paper>
              )}
            </Box>
          </Slide>

          {/* Answer Options with Staggered Animation */}
          <Slide direction="left" in timeout={1000}>
            <FormControl component="fieldset" fullWidth>
              {/* Instructions for question type */}
              {question.instructions && (
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.info.light}`,
                    backgroundColor: `${theme.palette.info.light}10`,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {question.instructions}
                  </Typography>
                </Alert>
              )}

              <RadioGroup
                value={selectedAnswer || ""}
                onChange={handleAnswerChange}
              >
                {question.options?.map((option, index) => {
                  const optionLabel =
                    typeof option === "string"
                      ? option
                      : option.text || option.label;
                  const optionValue =
                    typeof option === "string"
                      ? option
                      : option.value || option.text || option.label;

                  return (
                    <Grow key={index} in timeout={1200 + index * 200}>
                      <Paper
                        elevation={selectedAnswer === optionValue ? 3 : 1}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          border:
                            selectedAnswer === optionValue
                              ? `2px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                          background:
                            selectedAnswer === optionValue
                              ? `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`
                              : theme.palette.background.paper,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: theme.shadows[4],
                            borderColor: theme.palette.primary.light,
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => handleAnswerSelect(optionValue)}
                      >
                        <FormControlLabel
                          value={optionValue}
                          control={
                            <Radio
                              sx={{
                                color: theme.palette.primary.main,
                                "&.Mui-checked": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                py: 1.5,
                                px: 1,
                                fontSize: isMobile ? "0.95rem" : "1rem",
                                fontWeight:
                                  selectedAnswer === optionValue ? 600 : 400,
                                lineHeight: 1.5,
                              }}
                            >
                              {optionLabel}
                            </Typography>
                          }
                          sx={{
                            m: 0,
                            width: "100%",
                            px: 2,
                            py: 1,
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                          }}
                        />
                      </Paper>
                    </Grow>
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Slide>

          {/* Navigation Controls with Enhanced Animation */}
          <Fade in timeout={1600}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 4,
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handlePreviousQuestion}
                disabled={isFirstQuestion}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover:not(:disabled)": {
                    transform: "translateX(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                Previous
              </Button>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SkipNextIcon />}
                  onClick={handleNextQuestion}
                  disabled={isLastQuestion}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover:not(:disabled)": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  Skip
                </Button>

                {isLastQuestion ? (
                  <Button
                    variant="contained"
                    onClick={handleFinishTest}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    Finish Test
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextQuestion}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateX(4px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Fade>

          {/* Navigation Dialog */}
          <NavigationDialog />
        </Box>
      </Fade>
    </Container>
  );
};

export default QuestionDisplay;
