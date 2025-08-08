import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, Alert, Snackbar } from '@mui/material';
import { School, AccountCircle } from '@mui/icons-material';

import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import TestSelection from './components/TestSelection';
import QuestionDisplay from './components/QuestionDisplay';
import TestResults from './components/TestResults';
import AuthScreen from './components/AuthScreen';
import UserProfile from './components/UserProfile';
import LearningModule from './components/LearningModule';
import firebaseService from './services/firebase';
import openRouterService from './services/openrouter';

// Create a clean, minimal theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 300,
    },
    h4: {
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// App states
const APP_STATES = {
  DASHBOARD: 'dashboard',
  TEST_SELECTION: 'test_selection',
  TEST_IN_PROGRESS: 'test_in_progress',
  TEST_RESULTS: 'test_results',
  LEARNING: 'learning',
};

function AppContent() {
  const { user } = useAuth();
  const [appState, setAppState] = useState(APP_STATES.DASHBOARD);
  const [testConfig, setTestConfig] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [preloadingQuestions, setPreloadingQuestions] = useState(new Set()); // Track which questions are being preloaded
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  // Don't auto sign in as guest anymore - let user choose

  const showError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError("");
  };

  const startTestSelection = () => {
    setAppState(APP_STATES.TEST_SELECTION);
  };

  const startLearning = () => {
    setAppState(APP_STATES.LEARNING);
  };

  const startTest = async (config) => {
    setTestConfig(config);
    setQuestions([]);
    setAnswers(new Array(config.questionCount).fill(null));
    setCurrentQuestionIndex(0);
    setPreloadingQuestions(new Set()); // Clear preloading state
    setAppState(APP_STATES.TEST_IN_PROGRESS);

    // Start generating the first question
    await generateQuestion(0, false, config);
  };

  const generateQuestion = async (
    questionIndex,
    isPreload = false,
    config = null
  ) => {
    // For preloading, check if already being preloaded
    if (isPreload && preloadingQuestions.has(questionIndex)) {
      console.log(
        `Question ${questionIndex + 1} is already being preloaded, skipping`
      );
      return;
    }

    // Mark as being preloaded if it's a preload operation
    if (isPreload) {
      setPreloadingQuestions((prev) => new Set([...prev, questionIndex]));
    }

    if (!isPreload) {
      setIsLoadingQuestion(true);
    }
    try {
      const currentConfig = config || testConfig;

      // Guard against null testConfig
      if (!currentConfig || !currentConfig.testType || !currentConfig.section) {
        console.error("Invalid test configuration:", currentConfig);
        throw new Error("Test configuration is not available");
      }

      console.log(
        `${isPreload ? "Preloading" : "Generating"} question ${
          questionIndex + 1
        } for ${currentConfig.testType} ${currentConfig.section} ${
          currentConfig.difficulty
        }`
      );

      const question = await openRouterService.generateQuestion(
        currentConfig.testType,
        currentConfig.section,
        currentConfig.difficulty
      );

      console.log(
        `Successfully ${isPreload ? "preloaded" : "generated"} question ${
          questionIndex + 1
        }:`,
        question
      );

      // Update questions array at specific index
      setQuestions((prevQuestions) => {
        const newQuestions = [...prevQuestions];
        newQuestions[questionIndex] = question;
        return newQuestions;
      });

      // Preload the next 2 questions in the background if this is not already a preload
      if (!isPreload && questionIndex < currentConfig.questionCount - 1) {
        // Simple preloading - no complex state checks that might interfere
        setTimeout(() => {
          const nextIndex = questionIndex + 1;
          if (!preloadingQuestions.has(nextIndex)) {
            generateQuestion(nextIndex, true, currentConfig);
          }
        }, 500);

        setTimeout(() => {
          const nextNextIndex = questionIndex + 2;
          if (
            nextNextIndex < currentConfig.questionCount &&
            !preloadingQuestions.has(nextNextIndex)
          ) {
            generateQuestion(nextNextIndex, true, currentConfig);
          }
        }, 1000);
      }

      // Return the generated question so nextQuestion can use it immediately
      return question;
    } catch (error) {
      console.error(`Failed to generate question ${questionIndex + 1}:`, error);
      if (!isPreload) {
        // For main question generation failures, show error to user
        showError(
          `Failed to generate question ${questionIndex + 1}. ${
            error.message || "Please try again."
          }`
        );
        // Re-throw error so nextQuestion can handle it
        throw error;
      } else {
        // For preload failures, just log and continue silently
        console.warn(
          `Preload failed for question ${
            questionIndex + 1
          }, will generate when needed`
        );
        // Don't re-throw for preload failures to avoid breaking user experience
        return null;
      }
    } finally {
      // Clean up preloading state
      if (isPreload) {
        setPreloadingQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(questionIndex);
          return newSet;
        });
      }

      if (!isPreload) {
        setIsLoadingQuestion(false);
      }
    }
  };
  const handleAnswer = (answerIndex, timeSpent) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      answerIndex,
      timeSpent,
    };
    setAnswers(newAnswers);
  };

  const nextQuestion = async () => {
    try {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < testConfig.questionCount) {
        // If the next question doesn't exist, generate it first
        if (!questions[nextIndex]) {
          console.log(
            `Question ${nextIndex + 1} not preloaded, generating now...`
          );
          const generatedQuestion = await generateQuestion(nextIndex, false); // false = not preload, will show loading state

          // Ensure we have the question before proceeding
          if (!generatedQuestion) {
            throw new Error("Failed to generate question");
          }
        } else {
          console.log(
            `Question ${nextIndex + 1} already available, proceeding...`
          );
        }

        // Only update the index after we're sure the question exists
        setCurrentQuestionIndex(nextIndex);

        // Trigger preloading of upcoming questions (in background)
        setTimeout(() => {
          const nextNextIndex = nextIndex + 1;
          if (
            nextNextIndex < testConfig.questionCount &&
            !preloadingQuestions.has(nextNextIndex)
          ) {
            generateQuestion(nextNextIndex, true, testConfig);
          }
        }, 100);

        setTimeout(() => {
          const nextNextNextIndex = nextIndex + 2;
          if (
            nextNextNextIndex < testConfig.questionCount &&
            !preloadingQuestions.has(nextNextNextIndex)
          ) {
            generateQuestion(nextNextNextIndex, true, testConfig);
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error in nextQuestion:", error);
      showError(
        `Failed to load next question. ${error.message || "Please try again."}`
      );
    }
  };
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = async () => {
    try {
      // Calculate results
      const testQuestions = questions.map((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer ? userAnswer.answerIndex === question.correctAnswer : false;
        
        return {
          ...question, // Include all original question fields
          userAnswer: userAnswer?.answerIndex || -1,
          isCorrect,
          timeSpent: userAnswer?.timeSpent || 0,
          // Ensure these fields are present
          testType: question.testType || testConfig.testType,
          section: question.section || testConfig.section,
          difficulty: question.difficulty || testConfig.difficulty,
        };
      });

      const result = {
        userId: user.uid,
        testType: testConfig.testType,
        section: testConfig.section,
        difficulty: testConfig.difficulty,
        questions: testQuestions,
        createdAt: new Date().toISOString()
      };

      // Save to Firebase
      await firebaseService.saveTestResult(result);
      
      // Save individual question responses
      for (const question of testQuestions) {
        await firebaseService.saveQuestionResponse(
          user.uid,
          question,
          question.userAnswer,
          question.isCorrect,
          question.timeSpent
        );
      }

      setTestResult(result);
      setAppState(APP_STATES.TEST_RESULTS);
    } catch (error) {
      console.error('Failed to save test results:', error);
      showError('Failed to save test results. Please try again.');
    }
  };

  const returnToDashboard = () => {
    setAppState(APP_STATES.DASHBOARD);
    setTestConfig(null);
    setQuestions([]);
    setAnswers([]);
    setTestResult(null);
    setCurrentQuestionIndex(0);
  };

  const retakeTest = () => {
    if (testConfig) {
      startTest(testConfig);
    } else {
      setAppState(APP_STATES.TEST_SELECTION);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <School sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              GRE/GMAT Test Prep
            </Typography>
            {user && (
              <Button 
                color="inherit" 
                startIcon={<AccountCircle />}
                onClick={() => setShowProfile(true)}
              >
                {user.isAnonymous ? 'Guest User' : user.displayName || user.email}
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box>
          {!user ? (
            <AuthScreen />
          ) : (
            <>
              {appState === APP_STATES.DASHBOARD && (
                <Dashboard 
                  onStartTest={startTestSelection} 
                  onStartLearning={startLearning}
                />
              )}

              {appState === APP_STATES.TEST_SELECTION && (
                <TestSelection 
                  onStartTest={startTest}
                  onBack={returnToDashboard}
                />
              )}

              {appState === APP_STATES.TEST_IN_PROGRESS && (
                <QuestionDisplay
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={testConfig.questionCount}
                  onAnswer={handleAnswer}
                  onNext={nextQuestion}
                  onPrevious={previousQuestion}
                  onFinish={finishTest}
                  selectedAnswer={currentAnswer?.answerIndex}
                  isLoading={isLoadingQuestion}
                  questionsArray={questions}
                />
              )}

              {appState === APP_STATES.TEST_RESULTS && (
                <TestResults
                  testResult={testResult}
                  onReturnToDashboard={returnToDashboard}
                  onRetakeTest={retakeTest}
                />
              )}

              {appState === APP_STATES.LEARNING && (
                <LearningModule
                  onBack={returnToDashboard}
                />
              )}
            </>
          )}
        </Box>

        {/* User Profile Dialog */}
        {user && (
          <UserProfile 
            open={showProfile} 
            onClose={() => setShowProfile(false)} 
          />
        )}

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={clearError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
