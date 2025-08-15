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
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  School,
  AccountCircle,
  Info,
  Home,
  MenuBook,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { AuthProvider } from "./context/AuthContext";
import useAuth from "./context/useAuth";
import Dashboard from "./components/Dashboard";
import TestSelection from "./components/TestSelection";
import QuestionDisplay from "./components/QuestionDisplay";
import TestResults from "./components/TestResults";
import LandingPage from "./components/LandingPage";
import UserProfile from "./components/UserProfile";
import StreamlinedLearning from "./components/pages/StreamlinedLearning";
import InteractiveLearningExperience from "./components/InteractiveLearningExperience";
import About from "./components/About";
import RateLimitAlert from "./components/atoms/RateLimitAlert";
import { isFeatureEnabled } from "./constants/featureFlags";
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
  const { user, loading, logout } = useAuth();

  const [appState, setAppState] = useState(APP_STATES.DASHBOARD);
  const { anchorEl, isOpen, openMenu, closeMenu } = useMenu();
  const [showProfile, setShowProfile] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Centralize test-taking flow in a hook
  const {
    testConfig,
    answers,
    currentQuestionIndex,
    currentQuestion,
    isLoadingQuestion,
    isStartingTest,
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

  // Show loading spinner while authentication state is loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleMenuClick = (event) => {
    openMenu(event);
  };

  const handleSignOut = () => {
    logout();
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
    try {
      await startTest(config);
      // Only change state after the test is fully loaded
      setAppState(APP_STATES.TEST_IN_PROGRESS);
    } catch (error) {
      console.error("Failed to start test:", error);
      // Handle error appropriately, maybe show an error message
    }
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
          <AppBar
            position="static"
            elevation={0}
            sx={{
              bgcolor: "primary.main",
              borderBottom: "1px solid",
              borderColor: "primary.dark",
            }}
          >
            <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
              <School sx={{ mr: 2, color: "white" }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                GRE GMAT Prep
              </Typography>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    color="inherit"
                    startIcon={<Home />}
                    onClick={returnToDashboard}
                    sx={{
                      textTransform: "none",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<MenuBook />}
                    onClick={startLearning}
                    sx={{
                      textTransform: "none",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    Learning
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Info />}
                    onClick={() => setAppState(APP_STATES.ABOUT)}
                    sx={{
                      textTransform: "none",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    About
                  </Button>

                  {/* User Profile Button */}
                  <Button
                    color="inherit"
                    onClick={handleMenuClick}
                    startIcon={
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "secondary.main",
                        }}
                      >
                        {user?.isAnonymous
                          ? "G"
                          : user?.displayName?.[0] || user?.email?.[0] || "U"}
                      </Avatar>
                    }
                    sx={{
                      textTransform: "none",
                      borderRadius: 3,
                      px: 2,
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    <Box sx={{ ml: 1, textAlign: "left" }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        {user?.isAnonymous
                          ? "Guest User"
                          : user?.displayName || user?.email}
                      </Typography>
                      <Chip
                        label={user?.isAnonymous ? "Guest" : "Member"}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: "0.6rem",
                          color: "white",
                          bgcolor: user?.isAnonymous
                            ? "warning.main"
                            : "success.main",
                        }}
                      />
                    </Box>
                  </Button>
                </Box>
              )}

              {/* Mobile Navigation */}
              {isMobile && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    color="inherit"
                    onClick={handleMenuClick}
                    sx={{ p: 1 }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "secondary.main",
                      }}
                    >
                      {user?.isAnonymous
                        ? "G"
                        : user?.displayName?.[0] || user?.email?.[0] || "U"}
                    </Avatar>
                  </IconButton>
                  <IconButton
                    color="inherit"
                    onClick={() => setMobileDrawerOpen(true)}
                    sx={{ p: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}
            </Toolbar>
          </AppBar>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              bgcolor: "background.paper",
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Navigation
              </Typography>
              <IconButton onClick={() => setMobileDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    returnToDashboard();
                    setMobileDrawerOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  <ListItemIcon>
                    <Home />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    startLearning();
                    setMobileDrawerOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  <ListItemIcon>
                    <MenuBook />
                  </ListItemIcon>
                  <ListItemText primary="Learning Modules" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setAppState(APP_STATES.ABOUT);
                    setMobileDrawerOpen(false);
                  }}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  <ListItemIcon>
                    <Info />
                  </ListItemIcon>
                  <ListItemText primary="About" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={closeMenu}
          onClick={closeMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 2,
              mt: 1,
              minWidth: 200,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                }}
              >
                {user?.isAnonymous
                  ? "G"
                  : user?.displayName?.[0] || user?.email?.[0] || "U"}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.isAnonymous
                    ? "Guest User"
                    : user?.displayName || user?.email}
                </Typography>
                <Chip
                  label={user?.isAnonymous ? "Guest Account" : "Member"}
                  size="small"
                  color={user?.isAnonymous ? "warning" : "success"}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <MenuItem
            onClick={() => setShowProfile(true)}
            sx={{ py: 1.5, gap: 2 }}
          >
            <AccountCircle />
            <Typography>View Profile</Typography>
          </MenuItem>

          <MenuItem
            onClick={handleSignOut}
            sx={{ py: 1.5, gap: 2, color: "error.main" }}
          >
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
                    currentAppState={appState}
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
                    currentQuestionIndex={currentQuestionIndex}
                    testConfig={testConfig}
                    testComplete={false}
                    userAnswers={answers}
                    isLoadingQuestion={isLoadingQuestion || isStartingTest}
                    isStartingTest={isStartingTest}
                    questionTimeLimit={testConfig?.questionTimeLimit || 0}
                    examTimeLimit={testConfig?.examTimeLimit || 0}
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
                <StreamlinedLearning
                  onBack={returnToDashboard}
                  onStartModule={startModule}
                />
              )}
              {appState === APP_STATES.MODULE_LEARNING && (
                <InteractiveLearningExperience
                  module={selectedModule}
                  onBack={returnToLearning}
                  onComplete={returnToLearning}
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

        {/* Error Handling */}
        {error &&
        error.includes("limit") &&
        isFeatureEnabled("RATE_LIMITING", "enabled") ? (
          <Box
            sx={{
              position: "fixed",
              top: 80,
              left: 16,
              right: 16,
              zIndex: 1300,
            }}
          >
            <RateLimitAlert
              error={error}
              onDismiss={clearError}
              severity="warning"
            />
          </Box>
        ) : (
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
        )}
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
