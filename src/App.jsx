import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  School,
  AccountCircle,
  Info,
  Home,
  MenuBook,
} from "@mui/icons-material";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import TestSelection from "./components/TestSelection";
import QuestionDisplay from "./components/QuestionDisplay";
import TestResults from "./components/TestResults";
import LandingPage from "./components/LandingPage";
import UserProfile from "./components/UserProfile";
import ModuleLearning from "./components/ModuleLearning";
import EnhancedLearning from "./components/EnhancedLearning";
import About from "./components/About";
import APP_STATES from "./constants/appStates";
import useMenu from "./hooks/useMenu";
import useTestFlow from "./hooks/useTestFlow";

// SEO Components
import SimpleSEOHead from "./components/atoms/SimpleSEOHead";
import { SEO_PAGES, STRUCTURED_DATA } from "./constants/seoConfig";

// Create a clean, minimal theme with animations
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      50: "#e3f2fd",
      100: "#bbdefb",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
    },
    warning: {
      main: "#ed6c02",
      light: "#ff9800",
      dark: "#e65100",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
        contained: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        elevation2: {
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        },
        elevation3: {
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          overflow: "hidden",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

function AppContent() {
  const { user, signOut } = useAuth();
  const [appState, setAppState] = useState(APP_STATES.DASHBOARD);
  const { anchorEl, isOpen, openMenu, closeMenu } = useMenu();
  const [showProfile, setShowProfile] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Centralize test-taking flow in a hook
  const {
    testConfig,
    questions,
    currentQuestionIndex,
    currentQuestion,
    currentAnswer,
    isLoadingQuestion,
    testResult,
    startTest,
    handleAnswer,
    nextQuestion,
    previousQuestion,
    finishTest,
    reset,
    retakeTest,
    error,
    clearError,
  } = useTestFlow(user);

  const handleMenuClick = (event) => {
    openMenu(event);
  };

  const handleSignOut = () => {
    signOut();
    closeMenu();
  };

  const startTestSelection = () => setAppState(APP_STATES.TEST_SELECTION);
  const startLearning = () => setAppState(APP_STATES.LEARNING);
  const startModule = (module) => {
    setSelectedModule(module);
    setAppState(APP_STATES.MODULE_LEARNING);
  };
  const returnToLearning = () => setAppState(APP_STATES.LEARNING);

  const returnToDashboard = () => {
    setAppState(APP_STATES.DASHBOARD);
    reset();
  };

  const startTestAndGo = async (config) => {
    await startTest(config);
    setAppState(APP_STATES.TEST_IN_PROGRESS);
  };

  const handleFinishAndGo = async () => {
    await finishTest();
    setAppState(APP_STATES.TEST_RESULTS);
  };

  const handleRetake = async () => {
    await retakeTest();
    setAppState(APP_STATES.TEST_IN_PROGRESS);
  };

  const currentTotal = testConfig?.questionCount || 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        {/* AppBar - Only show when user is logged in */}
        {user && (
          <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
            <Toolbar>
              <School sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                GRE GMAT Test Prep
              </Typography>

              {user && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<Home />}
                    onClick={returnToDashboard}
                    sx={{ mr: 1 }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<MenuBook />}
                    onClick={startLearning}
                    sx={{ mr: 1 }}
                  >
                    Learning
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Info />}
                    onClick={() => setAppState(APP_STATES.ABOUT)}
                    sx={{ mr: 2 }}
                  >
                    About
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<AccountCircle />}
                    onClick={handleMenuClick}
                    endIcon={
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {user.isAnonymous
                          ? "Guest User"
                          : user.displayName || user.email}
                      </Typography>
                    }
                  >
                    {user.isAnonymous
                      ? "Guest User"
                      : user.displayName || user.email}
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
        )}

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={closeMenu}
          onClick={closeMenu}
        >
          <MenuItem onClick={() => setShowProfile(true)}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <Typography>Sign Out</Typography>
          </MenuItem>
        </Menu>

        {/* Main Content */}
        <Box>
          {!user ? (
            <LandingPage />
          ) : (
            <>
              {appState === APP_STATES.DASHBOARD && (
                <>
                  <SimpleSEOHead
                    title={SEO_PAGES.DASHBOARD.title}
                    description={SEO_PAGES.DASHBOARD.description}
                    keywords={SEO_PAGES.DASHBOARD.keywords}
                    canonical={SEO_PAGES.DASHBOARD.canonical}
                    jsonLd={[
                      STRUCTURED_DATA.WEBSITE,
                      STRUCTURED_DATA.SOFTWARE_APPLICATION,
                    ]}
                  />
                  <Dashboard
                    onStartTest={startTestSelection}
                    onStartLearning={startLearning}
                  />
                </>
              )}
              {appState === APP_STATES.TEST_SELECTION && (
                <>
                  <SimpleSEOHead
                    title={SEO_PAGES.TEST_SELECTION.title}
                    description={SEO_PAGES.TEST_SELECTION.description}
                    keywords={SEO_PAGES.TEST_SELECTION.keywords}
                    canonical={SEO_PAGES.TEST_SELECTION.canonical}
                    jsonLd={STRUCTURED_DATA.COURSE}
                  />
                  <TestSelection
                    onStartTest={startTestAndGo}
                    onBack={returnToDashboard}
                  />
                </>
              )}
              {appState === APP_STATES.TEST_IN_PROGRESS && (
                <>
                  <SimpleSEOHead
                    title={SEO_PAGES.QUESTION_PRACTICE.title}
                    description={SEO_PAGES.QUESTION_PRACTICE.description}
                    keywords={SEO_PAGES.QUESTION_PRACTICE.keywords}
                    canonical={SEO_PAGES.QUESTION_PRACTICE.canonical}
                    jsonLd={STRUCTURED_DATA.COURSE}
                  />
                  <QuestionDisplay
                    question={currentQuestion}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={currentTotal}
                    onAnswer={handleAnswer}
                    onNext={nextQuestion}
                    onPrevious={previousQuestion}
                    onFinish={handleFinishAndGo}
                    selectedAnswer={currentAnswer?.answerIndex}
                    isLoading={isLoadingQuestion}
                    questionsArray={questions}
                  />
                </>
              )}
              {appState === APP_STATES.TEST_RESULTS && (
                <>
                  <SimpleSEOHead
                    title={SEO_PAGES.TEST_RESULTS.title}
                    description={SEO_PAGES.TEST_RESULTS.description}
                    keywords={SEO_PAGES.TEST_RESULTS.keywords}
                    canonical={SEO_PAGES.TEST_RESULTS.canonical}
                    jsonLd={STRUCTURED_DATA.SOFTWARE_APPLICATION}
                  />
                  <TestResults
                    testResult={testResult}
                    onReturnToDashboard={returnToDashboard}
                    onRetakeTest={handleRetake}
                  />
                </>
              )}
              {appState === APP_STATES.LEARNING && (
                <EnhancedLearning
                  onBack={returnToDashboard}
                  onStartModule={startModule}
                />
              )}
              {appState === APP_STATES.MODULE_LEARNING && (
                <ModuleLearning
                  module={selectedModule}
                  onBack={returnToLearning}
                />
              )}
              {appState === APP_STATES.ABOUT && (
                <About onBack={returnToDashboard} />
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
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
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
