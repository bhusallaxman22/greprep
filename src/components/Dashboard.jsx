import React, { useState } from "react";
import PropTypes from "prop-types";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Slide,
  Zoom,
} from "@mui/material";
import {
  TrendingUp,
  Assessment,
  Quiz,
  School,
  Timeline,
  ExpandMore,
  Psychology,
  TipsAndUpdates,
  AutoAwesome,
  Speed,
  PlayArrow,
  PieChart,
  History,
} from "@mui/icons-material";
import useAuth from "../context/useAuth";
import AIInsights from "./AIInsights";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "../utils/formatters";
import StatCard from "./molecules/StatCard";
import AIEvaluationRenderer from "./organisms/AIEvaluationRenderer";
import useDashboardData from "../hooks/useDashboardData";

const Dashboard = ({ onStartTest, onStartLearning }) => {
  const { user } = useAuth();
  const {
    stats,
    aiEvaluation,
    aiInsights,
    loadingStats,
    loadingAI,
    error,
    quickInsight,
    reload,
  } = useDashboardData(user?.uid);
  const [aiInsightsExpanded, setAiInsightsExpanded] = useState(true);

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return "success";
    if (accuracy >= 60) return "warning";
    return "error";
  };

  const getImprovementIcon = (trend) => {
    if (trend > 0) return <TrendingUp color="success" />;
    if (trend < 0)
      return <TrendingUp color="error" sx={{ transform: "rotate(180deg)" }} />;
    return <Timeline color="action" />;
  };

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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={reload}>
          Retry
        </Button>
      </Container>
    );
  }

  const chartData = stats
    ? Object.keys(stats.sectionBreakdown).map((section) => ({
        section,
        accuracy: Math.round(stats.sectionBreakdown[section].accuracy),
        total: stats.sectionBreakdown[section].total,
      }))
    : [];

  // Precompute AI content
  let aiContent = null;
  if (aiInsights && !loadingAI) {
    aiContent = <AIInsights insights={aiInsights} isLoading={false} />;
  } else if (loadingAI) {
    aiContent = <AIInsights insights={null} isLoading={true} />;
  } else if (aiEvaluation) {
    aiContent = (
      <Box sx={{ mt: 2 }}>
        <AIEvaluationRenderer evaluation={aiEvaluation} />
      </Box>
    );
  } else if (stats && stats.totalTests > 0) {
    aiContent = (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Psychology sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
        <Typography color="text.secondary" variant="h6">
          AI evaluation will appear here after your first test.
        </Typography>
      </Box>
    );
  } else {
    aiContent = (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <TipsAndUpdates sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography color="text.secondary" variant="h6" gutterBottom>
          Take a test to get personalized AI-powered improvement suggestions.
        </Typography>
        <Button variant="outlined" onClick={onStartTest} sx={{ mt: 2 }}>
          Start Your First Test
        </Button>
      </Box>
    );
  }

  // Precompute content for charts and lists
  const chartContent = (() => {
    if (loadingStats) {
      return (
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
      );
    }
    if (chartData.length > 0) {
      return (
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
              <Bar dataKey="accuracy" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <Typography color="text.secondary">
          No test data available. Take your first test to see performance
          charts!
        </Typography>
      </Box>
    );
  })();

  const breakdownContent = (() => {
    if (loadingStats) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }
    if (stats && Object.keys(stats.sectionBreakdown).length === 0) {
      return (
        <Typography color="text.secondary">
          No test data available. Start your first test to see section
          performance!
        </Typography>
      );
    }
    if (stats) {
      return (
        <>
          {Object.keys(stats.sectionBreakdown).map((section) => {
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
          })}
        </>
      );
    }
    return null;
  })();

  const recentContent = (() => {
    if (loadingStats) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }
    if (stats && stats.recentPerformance.length > 0) {
      return (
        <Grid container spacing={2}>
          {stats.recentPerformance.map((test) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={2.4}
              key={`${test.date}-${test.testType}-${test.section}`}
            >
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
                    {formatDate(test.date)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }
    return (
      <Typography color="text.secondary">
        No recent test data available. Take your first test to see performance
        history!
      </Typography>
    );
  })();

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
                "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
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
              <Typography variant="body1">{quickInsight}</Typography>
            </Alert>
          </Box>
        </Slide>
      )}

      {/* Quick Stats */}
      <Fade in={true} timeout={1200}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Quiz color="primary" sx={{ mr: 1 }} />}
              title="Tests Taken"
              value={stats?.totalTests || 0}
              loading={loadingStats}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Assessment color="primary" sx={{ mr: 1 }} />}
              title="Questions"
              value={stats?.totalQuestions || 0}
              loading={loadingStats}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<School color="primary" sx={{ mr: 1 }} />}
              title="Overall Accuracy"
              value={`${stats?.overallAccuracy || 0}%`}
              loading={loadingStats}
              valueColor={getAccuracyColor(stats?.overallAccuracy || 0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={
                stats ? (
                  getImprovementIcon(stats.improvementTrend)
                ) : (
                  <Timeline color="action" />
                )
              }
              title="Trend"
              value={`${stats?.improvementTrend > 0 ? "+" : ""}${
                stats?.improvementTrend || 0
              }%`}
              loading={loadingStats}
              valueColor={
                stats?.improvementTrend >= 0 ? "success.main" : "error.main"
              }
            />
          </Grid>
        </Grid>
      </Fade>

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
                "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
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
              {chartContent}
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
                "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PieChart sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Section Breakdown
                </Typography>
              </Box>
              {breakdownContent}
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
                "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
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
              <AccordionDetails>{aiContent}</AccordionDetails>
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
                "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <History sx={{ mr: 2, color: "primary.main", fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Recent Test Performance
                </Typography>
              </Box>
              {recentContent}
            </Paper>
          </Slide>
        </Grid>
      </Grid>
    </Container>
  );
};

Dashboard.propTypes = {
  onStartTest: PropTypes.func,
  onStartLearning: PropTypes.func,
};

export default Dashboard;
