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
  IconButton,
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
import AuthScreen from "./components/AuthScreen";
import UserProfile from "./components/UserProfile";
import ModuleLearning from "./components/ModuleLearning";
import EnhancedLearning from "./components/EnhancedLearning";
import About from "./components/About";
import APP_STATES from "./constants/appStates";
import useMenu from "./hooks/useMenu";
import useTestFlow from "./hooks/useTestFlow";

// SEO Components
import SimpleSEOHead from "./components/atoms/SimpleSEOHead";
import {
  SEOLandingHero,
  SEOFeatureSection,
  SEOTestTypesSection,
} from "./components/organisms/SEOLandingContent";
import seoConfig from "./constants/seoConfig";
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
  const { user } = useAuth();
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

  const navigateToAbout = () => {
    setAppState(APP_STATES.ABOUT);
    closeMenu();
  };
  const navigateToDashboard = () => {
    setAppState(APP_STATES.DASHBOARD);
    closeMenu();
  };
  const navigateToLearning = () => {
    setAppState(APP_STATES.LEARNING);
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
        {/* App Bar */}
        <AppBar
          position="static"
          elevation={1}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Toolbar>
            <School sx={{ mr: 2 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              GRE/GMAT Test Prep
            </Typography>
            {user && (
              <>
                <IconButton color="inherit" onClick={openMenu} sx={{ mr: 1 }}>
                  <MenuBook />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={isOpen}
                  onClose={closeMenu}
                  slotProps={{
                    paper: { sx: { mt: 1, borderRadius: 2, boxShadow: 3 } },
                  }}
                >
                  <MenuItem onClick={navigateToDashboard}>
                    <Home sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>
                  <MenuItem onClick={navigateToLearning}>
                    <MenuBook sx={{ mr: 1 }} /> Learning
                  </MenuItem>
                  <MenuItem onClick={navigateToAbout}>
                    <Info sx={{ mr: 1 }} /> About
                  </MenuItem>
                </Menu>
                <Button
                  color="inherit"
                  startIcon={<AccountCircle />}
                  onClick={() => setShowProfile(true)}
                  sx={{
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  {user.isAnonymous
                    ? "Guest User"
                    : user.displayName || user.email}
                </Button>
              </>
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
                <>
                  <SimpleSEOHead
                    title={seoConfig.SEO_PAGES.HOME.title}
                    description={seoConfig.SEO_PAGES.HOME.description}
                    keywords={seoConfig.SEO_PAGES.HOME.keywords}
                    canonical={seoConfig.SEO_PAGES.HOME.canonical}
                    jsonLd={[
                      seoConfig.STRUCTURED_DATA.WEBSITE,
                      seoConfig.STRUCTURED_DATA.SOFTWARE_APPLICATION,
                    ]}
                  />
                  <SEOLandingHero />
                  <SEOFeatureSection />
                  <SEOTestTypesSection />
                  <Dashboard
                    onStartTest={startTestSelection}
                    onStartLearning={startLearning}
                  />
                </>
              )}
              {appState === APP_STATES.TEST_SELECTION && (
                <>
                  <SimpleSEOHead
                    title={seoConfig.SEO_PAGES.TEST_SELECTION.title}
                    description={seoConfig.SEO_PAGES.TEST_SELECTION.description}
                    keywords={seoConfig.SEO_PAGES.TEST_SELECTION.keywords}
                    canonical={seoConfig.SEO_PAGES.TEST_SELECTION.canonical}
                    jsonLd={seoConfig.STRUCTURED_DATA.COURSE}
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
                    title={seoConfig.SEO_PAGES.QUESTION_PRACTICE.title}
                    description={
                      seoConfig.SEO_PAGES.QUESTION_PRACTICE.description
                    }
                    keywords={seoConfig.SEO_PAGES.QUESTION_PRACTICE.keywords}
                    canonical={seoConfig.SEO_PAGES.QUESTION_PRACTICE.canonical}
                    jsonLd={seoConfig.STRUCTURED_DATA.COURSE}
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
                    title={seoConfig.SEO_PAGES.TEST_RESULTS.title}
                    description={seoConfig.SEO_PAGES.TEST_RESULTS.description}
                    keywords={seoConfig.SEO_PAGES.TEST_RESULTS.keywords}
                    canonical={seoConfig.SEO_PAGES.TEST_RESULTS.canonical}
                    jsonLd={seoConfig.STRUCTURED_DATA.SOFTWARE_APPLICATION}
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
