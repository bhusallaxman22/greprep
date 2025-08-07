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
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Don't auto sign in as guest anymore - let user choose

  const showError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError('');
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
    setAppState(APP_STATES.TEST_IN_PROGRESS);
    
    // Start generating the first question
    await generateQuestion(0, config);
  };

  const generateQuestion = async (questionIndex, config = testConfig) => {
    setIsLoadingQuestion(true);
    try {
      const question = await openRouterService.generateQuestion(
        config.testType,
        config.section,
        config.difficulty
      );
      
      const newQuestions = [...questions];
      newQuestions[questionIndex] = question;
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Failed to generate question:', error);
      showError('Failed to generate question. Please check your OpenRouter API configuration.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleAnswer = (answerIndex, timeSpent) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      answerIndex,
      timeSpent
    };
    setAnswers(newAnswers);
  };

  const nextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < testConfig.questionCount) {
      setCurrentQuestionIndex(nextIndex);
      
      // Generate next question if it doesn't exist
      if (!questions[nextIndex]) {
        await generateQuestion(nextIndex);
      }
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
