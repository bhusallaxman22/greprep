import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  RadioGroup,
  Alert,
  Fade,
  Slide,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PropTypes from "prop-types";

// Templates
import QuestionPageTemplate from "../templates/QuestionPageTemplate";
import TestCompletionTemplate from "../templates/TestCompletionTemplate";

// Organisms
import QuestionHeader from "../organisms/QuestionHeader";
import QuestionNavigatorDialog from "../organisms/QuestionNavigatorDialog";

// Molecules
import QuestionOptions from "../molecules/QuestionOptions";
import QuestionNavigation from "../molecules/QuestionNavigation";
import QuestionProgress from "../molecules/QuestionProgress";
import ReadingPassagePanel from "../molecules/ReadingPassagePanel";
import QuestionCard from "../molecules/QuestionCard";
import TestCompletionCard from "../molecules/TestCompletionCard";
import QuestionLayout from "../molecules/QuestionLayout";

// Atoms
import EmptyState from "../atoms/EmptyState";

// Hooks
import useQuestionState from "../../hooks/useQuestionState";
import useQuestionNavigation from "../../hooks/useQuestionNavigation";
import useLoadingStates from "../../hooks/useLoadingStates";

const QuestionPage = (props) => {
  const {
    question,
    questionNumber,
    totalQuestions,
    onAnswer,
    onNext,
    onPrevious,
    onFinish,
    selectedAnswer,
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
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showNavigation, setShowNavigation] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  // Loading states hook
  const { loadingStates, withLoading } = useLoadingStates();

  // Enhanced handlers with loading states
  const handleNextWithLoading = withLoading("nextQuestion", async () => {
    // Simulate async operation (API call, validation, etc.)
    await new Promise((resolve) => setTimeout(resolve, 800));
    handleNextQuestion();
  });

  const handleFinishWithLoading = withLoading("finishTest", async (answers) => {
    // Simulate async operation (submitting test, validation, etc.)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    handleFinishTest(answers);
  });

  const handleReturnToDashboardWithLoading = withLoading(
    "returnToDashboard",
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onReturnToDashboard?.();
    }
  );

  const handleRetakeTestWithLoading = withLoading("retakeTest", async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    onRetakeTest?.();
  });

  const handleReviewAnswersWithLoading = withLoading(
    "reviewAnswers",
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      onReviewAnswers?.();
    }
  );

  // Custom hooks for business logic
  const {
    actualQuestionIndex,
    localAnswers,
    handleAnswerSelect,
    getCurrentSelectedValue,
  } = useQuestionState(
    userAnswers,
    question,
    selectedAnswer,
    currentQuestionIndex,
    questionNumber
  );

  const {
    progressPercentage,
    isLastQuestion,
    isFirstQuestion,
    isQuestionFlagged,
    handleNextQuestion,
    handlePreviousQuestion,
    handleFinishTest,
  } = useQuestionNavigation(
    actualQuestionIndex,
    totalQuestions,
    flaggedQuestions,
    onNext,
    onNextQuestion,
    onPrevious,
    onPreviousQuestion,
    onFinish,
    onFinishTest
  );

  // Ensure component is mounted before enabling transitions
  useEffect(() => {
    setIsComponentMounted(true);
    return () => setIsComponentMounted(false);
  }, []);

  const handleAnswerChange = (event) =>
    handleAnswerSelect(event.target.value, onAnswer, onAnswerSelect);

  const currentSelectedValue = getCurrentSelectedValue();

  // Early returns for different states
  if (!question) {
    return (
      <QuestionPageTemplate maxWidth="md">
        <EmptyState message="Question not available" sx={{ mt: 4 }} />
      </QuestionPageTemplate>
    );
  }

  if (testComplete) {
    return (
      <TestCompletionTemplate>
        {isComponentMounted && (
          <TestCompletionCard
            score={score}
            onReturnToDashboard={handleReturnToDashboardWithLoading}
            onRetakeTest={handleRetakeTestWithLoading}
            onReviewAnswers={handleReviewAnswersWithLoading}
            loadingStates={loadingStates}
            isAnimated={true}
          />
        )}
      </TestCompletionTemplate>
    );
  }

  // Main question display
  return (
    <QuestionPageTemplate maxWidth={question.passage ? "lg" : "md"}>
      {isComponentMounted && (
        <Fade in timeout={600}>
          <Box>
            <Slide
              direction="down"
              in
              timeout={800}
              container={() => document.body}
            >
              <Box>
                <QuestionHeader
                  index={actualQuestionIndex}
                  total={totalQuestions}
                  passage={question.passage}
                  isFlagged={isQuestionFlagged}
                  onToggleFlag={() => onToggleFlag?.(actualQuestionIndex)}
                  onOpenNavigator={() => setShowNavigation(true)}
                />
              </Box>
            </Slide>

            <Zoom in timeout={800} style={{ transformOrigin: "center top" }}>
              <Box>
                <QuestionProgress value={progressPercentage} />
              </Box>
            </Zoom>

            <Slide
              direction="right"
              in
              timeout={1000}
              container={() => document.body}
            >
              <Box sx={{ mb: 3 }}>
                <QuestionLayout
                  passage={
                    question.passage && (
                      <ReadingPassagePanel
                        passage={question.passage}
                        maxHeight={isMobile ? "none" : "70vh"}
                      />
                    )
                  }
                  question={
                    <QuestionCard
                      label={
                        question.type ||
                        testConfig?.type ||
                        (question.passage
                          ? "Reading Comprehension"
                          : "Question")
                      }
                      questionText={question.question}
                      chipColor={question.passage ? "secondary" : "primary"}
                    />
                  }
                  isMobile={isMobile}
                />
              </Box>
            </Slide>

            <Slide
              direction="left"
              in
              timeout={1000}
              container={() => document.body}
            >
              <Box>
                <FormControl component="fieldset" fullWidth>
                  {question.instructions && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                      {question.instructions}
                    </Alert>
                  )}
                  <RadioGroup
                    value={currentSelectedValue}
                    onChange={handleAnswerChange}
                  >
                    <QuestionOptions
                      options={question.options || []}
                      selectedValue={currentSelectedValue}
                      onSelect={(value) =>
                        handleAnswerSelect(value, onAnswer, onAnswerSelect)
                      }
                      isMobile={isMobile}
                      theme={theme}
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Slide>

            <Fade in timeout={1600}>
              <Box>
                <QuestionNavigation
                  isFirst={isFirstQuestion}
                  isLast={isLastQuestion}
                  onPrevious={handlePreviousQuestion}
                  onNext={handleNextWithLoading}
                  onFinish={() => handleFinishWithLoading(localAnswers)}
                  isNextLoading={loadingStates.nextQuestion}
                  isFinishLoading={loadingStates.finishTest}
                />
              </Box>
            </Fade>

            <QuestionNavigatorDialog
              open={showNavigation}
              onClose={() => setShowNavigation(false)}
              totalQuestions={totalQuestions}
              currentIndex={actualQuestionIndex}
              answers={localAnswers}
              flagged={flaggedQuestions}
              onNavigate={(index) => onNavigateToQuestion?.(index)}
            />
          </Box>
        </Fade>
      )}
    </QuestionPageTemplate>
  );
};

QuestionPage.propTypes = {
  question: PropTypes.object,
  questionNumber: PropTypes.number,
  totalQuestions: PropTypes.number,
  onAnswer: PropTypes.func,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  onFinish: PropTypes.func,
  selectedAnswer: PropTypes.number,
  currentQuestionIndex: PropTypes.number,
  onAnswerSelect: PropTypes.func,
  onNextQuestion: PropTypes.func,
  onPreviousQuestion: PropTypes.func,
  testConfig: PropTypes.object,
  onFinishTest: PropTypes.func,
  flaggedQuestions: PropTypes.array,
  onToggleFlag: PropTypes.func,
  onNavigateToQuestion: PropTypes.func,
  testComplete: PropTypes.bool,
  score: PropTypes.shape({
    percentage: PropTypes.number,
    correct: PropTypes.number,
    total: PropTypes.number,
  }),
  onReturnToDashboard: PropTypes.func,
  onRetakeTest: PropTypes.func,
  onReviewAnswers: PropTypes.func,
  userAnswers: PropTypes.object,
};

export default QuestionPage;
