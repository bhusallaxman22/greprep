import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Slide,
  Zoom,
  Grow,
} from "@mui/material";
import {
  TrendingUp,
  Assessment,
  Quiz,
  School,
  Timeline,
  ExpandMore,
  Lightbulb,
  FlagOutlined,
  Schedule,
  BookmarkBorder,
  Psychology,
  TipsAndUpdates,
  AutoAwesome,
  Speed,
  EmojiEvents,
  PlayArrow,
  PieChart,
  History,
} from "@mui/icons-material";
import { useAuth } from '../context/AuthContext';
import firebaseService from '../services/firebase';
import openRouterService from '../services/openrouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onStartTest, onStartLearning }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');
  const [aiInsightsExpanded, setAiInsightsExpanded] = useState(true);
  const [cachedAIEvaluation, setCachedAIEvaluation] = useState(null);
  const [lastStatsHash, setLastStatsHash] = useState("");

  // Handler functions
  const handleStartTest = () => {
    if (onStartTest) {
      onStartTest();
    }
  };

  const handleStartLearning = () => {
    if (onStartLearning) {
      onStartLearning();
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoadingStats(true);
      setError("");

      // Load user statistics
      const userStats = await firebaseService.calculateUserStats(user.uid);
      setStats(userStats);
      setLoadingStats(false);

      // Create a hash of the current stats to check if they've changed
      const currentStatsHash = JSON.stringify({
        totalTests: userStats.totalTests,
        totalQuestions: userStats.totalQuestions,
        overallAccuracy: userStats.overallAccuracy,
        recentTests: userStats.recentPerformance?.length || 0,
      });

      // Get AI evaluation if user has taken tests
      if (userStats.totalTests > 0) {
        // Check if we can use cached evaluation
        if (cachedAIEvaluation && lastStatsHash === currentStatsHash) {
          console.log("Using cached AI evaluation");
          setAiEvaluation(cachedAIEvaluation);
        } else {
          setLoadingAI(true);
          try {
            const testResults = await firebaseService.getUserTestResults(
              user.uid
            );
            const evaluation = await openRouterService.evaluatePerformance(
              testResults.slice(0, 3)
            );
            setAiEvaluation(evaluation);
            setCachedAIEvaluation(evaluation);
            setLastStatsHash(currentStatsHash);
            console.log("Generated new AI evaluation and cached it");
          } catch (aiError) {
            console.error("AI evaluation failed:", aiError);
            setAiEvaluation(
              "AI evaluation temporarily unavailable. Please check your OpenRouter API configuration."
            );
          } finally {
            setLoadingAI(false);
          }
        }
      } else {
        // Generate quick insights for new users
        const insights = openRouterService.generateQuickInsights(userStats);
        setAiEvaluation(insights.join("\n\n"));
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(
        "Failed to load dashboard data. Please check your Firebase configuration."
      );
      setLoadingStats(false);
    }
  }, [user.uid, cachedAIEvaluation, lastStatsHash]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'warning';
    return 'error';
  };

  const getImprovementIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" />;
    if (trend < 0) return <TrendingUp color="error" sx={{ transform: 'rotate(180deg)' }} />;
    return <Timeline color="action" />;
  };

  // Parse and render AI evaluation with beautiful formatting
  const renderAIEvaluation = (evaluation) => {
    // Check if it's a simple insight or structured analysis
    if (evaluation.includes('🎯') || evaluation.includes('📈') || evaluation.includes('🔄')) {
      // Simple insights format
      const insights = evaluation.split('\n\n').filter(insight => insight.trim());
      return (
        <Grid container spacing={2}>
          {insights.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {insight.trim()}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    // Split the evaluation into sections based on common patterns
    const sections = evaluation.split(/(?=\*\*|📚|🎯|📖|⚡|\d+\.|##|###)/);
    
    return (
      <Box>
        {sections.map((section, index) => {
          const trimmedSection = section.trim();
          if (!trimmedSection) return null;

          // Key Insights Section
          if (trimmedSection.includes('Key Insights') || trimmedSection.includes('insights')) {
            return (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lightbulb color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">Key Insights</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {trimmedSection.replace(/\*\*Key Insights\*\*:?/i, '').trim()}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>
            );
          }

          // Priority Actions Section
          if (trimmedSection.includes('Priority Actions') || trimmedSection.includes('focus')) {
            return (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlagOutlined color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="secondary">Priority Actions</Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {trimmedSection.replace(/\*\*Priority Actions\*\*:?/i, '').trim()}
                  </Typography>
                </Alert>
                <Divider sx={{ mb: 2 }} />
              </Box>
            );
          }

          // Study Plan Section
          if (trimmedSection.includes('Study Plan') || trimmedSection.includes('study')) {
            const planItems = trimmedSection.split(/[-•]/);
            return (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BookmarkBorder color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main">Study Plan</Typography>
                </Box>
                <List dense>
                  {planItems.slice(1).map((item, i) => (
                    <ListItem key={i}>
                      <ListItemIcon>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'success.main' 
                        }} />
                      </ListItemIcon>
                      <ListItemText primary={item.trim()} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ mb: 2 }} />
              </Box>
            );
          }

          // Test-Taking Strategy Section
          if (trimmedSection.includes('Strategy') || trimmedSection.includes('test-taking')) {
            return (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Psychology color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="warning.main">Test-Taking Strategy</Typography>
                </Box>
                <Card variant="outlined" sx={{ bgcolor: 'warning.50', p: 2 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {trimmedSection.replace(/\*\*.*Strategy\*\*:?/i, '').trim()}
                  </Typography>
                </Card>
                <Divider sx={{ mb: 2 }} />
              </Box>
            );
          }

          // Motivation Section
          if (trimmedSection.includes('Motivation') || trimmedSection.includes('encouraging')) {
            return (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TipsAndUpdates color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">Motivation & Goals</Typography>
                </Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {trimmedSection.replace(/\*\*Motivation\*\*:?/i, '').trim()}
                  </Typography>
                </Alert>
              </Box>
            );
          }

          // Default section rendering
          if (trimmedSection.length > 20) {
            return (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {trimmedSection}
                </Typography>
              </Box>
            );
          }

          return null;
        })}
      </Box>
    );
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Retry
        </Button>
      </Container>
    );
  }

  const chartData = stats ? Object.keys(stats.sectionBreakdown).map(section => ({
    section,
    accuracy: Math.round(stats.sectionBreakdown[section].accuracy),
    total: stats.sectionBreakdown[section].total
  })) : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <AutoAwesome sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 0,
              }}
            >
              Test Prep Dashboard
            </Typography>
          </Box>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Track your progress, analyze performance, and achieve your target
            scores with AI-powered insights
          </Typography>
        </Box>
      </Fade>

      {/* Quick Insights */}
      {stats && !loadingStats && (
        <Slide direction="up" in={true} timeout={1000}>
          <Box sx={{ mb: 4 }}>
            <Alert
              icon={<TipsAndUpdates />}
              severity="info"
              sx={{
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.200",
                borderRadius: 3,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Speed sx={{ mr: 1 }} />
                Quick Insight
              </Typography>
              <Typography variant="body1">
                {(() => {
                  try {
                    const insights =
                      openRouterService.generateQuickInsights(stats);
                    return (
                      insights[0] ||
                      "Keep practicing to improve your performance!"
                    );
                  } catch (error) {
                    console.error("Error generating quick insights:", error);
                    return "Keep practicing to improve your performance!";
                  }
                })()}
              </Typography>
            </Alert>
          </Box>
        </Slide>
      )}

      {/* Quick Stats */}
      <Fade in={true} timeout={1200}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={800}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                    "& .stat-number": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Quiz color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Tests Taken</Typography>
                  </Box>
                  {loadingStats ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Typography
                      variant="h3"
                      color="primary"
                      className="stat-number"
                      sx={{
                        transition: "transform 0.3s ease",
                        fontWeight: 700,
                      }}
                    >
                      {stats?.totalTests || 0}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={1000}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                    "& .stat-number": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Assessment color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Questions</Typography>
                  </Box>
                  {loadingStats ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Typography
                      variant="h3"
                      color="primary"
                      className="stat-number"
                      sx={{
                        transition: "transform 0.3s ease",
                        fontWeight: 700,
                      }}
                    >
                      {stats?.totalQuestions || 0}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={1200}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                    "& .stat-number": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Overall Accuracy</Typography>
                  </Box>
                  {loadingStats ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Typography
                      variant="h3"
                      color={getAccuracyColor(stats?.overallAccuracy || 0)}
                      className="stat-number"
                      sx={{
                        transition: "transform 0.3s ease",
                        fontWeight: 700,
                      }}
                    >
                      {stats?.overallAccuracy || 0}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={1400}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                    "& .stat-number": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {stats ? (
                      getImprovementIcon(stats.improvementTrend)
                    ) : (
                      <Timeline color="action" />
                    )}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Trend
                    </Typography>
                  </Box>
                  {loadingStats ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Typography
                      variant="h3"
                      color={
                        stats?.improvementTrend >= 0
                          ? "success.main"
                          : "error.main"
                      }
                      className="stat-number"
                      sx={{
                        transition: "transform 0.3s ease",
                        fontWeight: 700,
                      }}
                    >
                      {stats?.improvementTrend > 0 ? "+" : ""}
                      {stats?.improvementTrend || 0}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Fade>

      {/* Start New Test and Learning Buttons */}
      {/* Start New Test and Learning Buttons */}
      <Zoom in={true} timeout={1600}>
        <Box
          sx={{
            mb: 4,
            textAlign: "center",
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleStartTest}
            startIcon={<PlayArrow />}
            sx={{
              borderRadius: "28px",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #0288D1 90%)",
                transform: "translateY(-3px)",
                boxShadow: "0 6px 15px 2px rgba(33, 203, 243, .4)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Start New Test
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleStartLearning}
            startIcon={<School />}
            sx={{
              borderRadius: "28px",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              borderWidth: "2px",
              "&:hover": {
                borderWidth: "2px",
                transform: "translateY(-3px)",
                boxShadow: "0 6px 15px 2px rgba(25, 118, 210, .2)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Learning Mode
          </Button>
        </Box>
      </Zoom>

      <Grid container spacing={3}>
        {/* Section Performance Chart */}
        <Grid item xs={12} md={8}>
          <Slide direction="up" in={true} timeout={1800}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp
                  sx={{ mr: 2, color: "primary.main", fontSize: 28 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Section Performance
                </Typography>
              </Box>
              {loadingStats ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              ) : chartData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="section" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Accuracy"]}
                        labelFormatter={(label) => `Section: ${label}`}
                      />
                      <Bar
                        dataKey="accuracy"
                        fill="#1976d2"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300,
                  }}
                >
                  <Typography color="text.secondary">
                    No test data available. Take your first test to see
                    performance charts!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Slide>
        </Grid>

        {/* Section Breakdown */}
        <Grid item xs={12} md={4}>
          <Fade in={true} timeout={2000}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "fit-content",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PieChart sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Section Breakdown
                </Typography>
              </Box>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : stats && Object.keys(stats.sectionBreakdown).length === 0 ? (
                <Typography color="text.secondary">
                  No test data available. Start your first test to see section
                  performance!
                </Typography>
              ) : (
                stats &&
                Object.keys(stats.sectionBreakdown).map((section) => {
                  const sectionData = stats.sectionBreakdown[section];
                  return (
                    <Box key={section} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {section}
                        </Typography>
                        <Chip
                          label={`${Math.round(sectionData.accuracy)}%`}
                          color={getAccuracyColor(sectionData.accuracy)}
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={sectionData.accuracy}
                        color={getAccuracyColor(sectionData.accuracy)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {sectionData.total} questions answered
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* AI Evaluation */}
        <Grid item xs={12}>
          <Zoom in={true} timeout={2200}>
            <Accordion
              expanded={aiInsightsExpanded}
              onChange={(event, isExpanded) =>
                setAiInsightsExpanded(isExpanded)
              }
              elevation={2}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="ai-insights-content"
                id="ai-insights-header"
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Psychology color="primary" sx={{ mr: 2, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5">
                      AI Performance Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Personalized insights powered by AI
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {loadingAI ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 4,
                    }}
                  >
                    <CircularProgress size={32} sx={{ mr: 2 }} />
                    <Typography color="text.secondary">
                      Analyzing your performance...
                    </Typography>
                  </Box>
                ) : aiEvaluation ? (
                  <Box sx={{ mt: 2 }}>{renderAIEvaluation(aiEvaluation)}</Box>
                ) : stats && stats.totalTests > 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Psychology
                      sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                    />
                    <Typography color="text.secondary" variant="h6">
                      AI evaluation will appear here after your first test.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <TipsAndUpdates
                      sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                    />
                    <Typography
                      color="text.secondary"
                      variant="h6"
                      gutterBottom
                    >
                      Take a test to get personalized AI-powered improvement
                      suggestions.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={onStartTest}
                      sx={{ mt: 2 }}
                    >
                      Start Your First Test
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Zoom>
        </Grid>

        {/* Recent Performance */}
        <Grid item xs={12}>
          <Slide direction="up" in={true} timeout={2400}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <History sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Recent Test Performance
                </Typography>
              </Box>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : stats && stats.recentPerformance.length > 0 ? (
                <Grid container spacing={2}>
                  {stats.recentPerformance.map((test, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: "center" }}>
                          <Typography variant="h6" color="primary">
                            {Math.round(test.accuracy)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {test.testType} - {test.section}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {new Date(test.date).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No recent test data available. Take your first test to see
                  performance history!
                </Typography>
              )}
            </Paper>
          </Slide>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
