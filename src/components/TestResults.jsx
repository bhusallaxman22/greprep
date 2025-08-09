import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ExpandMore,
  Home,
  Refresh,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AIInsights from "./AIInsights";

const TestResults = ({ testResult, onReturnToDashboard, onRetakeTest }) => {
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);

  useEffect(() => {
    if (testResult) {
      const loadAIEvaluation = async () => {
        setIsLoadingEvaluation(true);
        try {
          // Import the service here to avoid circular dependencies
          const { default: openRouterService } = await import(
            "../services/openrouter"
          );

          // Get both text and JSON format insights
          const [evaluation, insights] = await Promise.all([
            openRouterService.evaluatePerformance([testResult]),
            openRouterService.evaluatePerformanceWithFormat(
              [testResult],
              "json"
            ),
          ]);

          setAiEvaluation(evaluation);
          setAiInsights(insights);
        } catch (error) {
          console.error("AI evaluation failed:", error);
          setAiEvaluation(
            "AI evaluation temporarily unavailable. Please check your OpenRouter API configuration."
          );
        } finally {
          setIsLoadingEvaluation(false);
        }
      };

      loadAIEvaluation();
    }
  }, [testResult]);

  if (!testResult) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No test results available.
        </Alert>
        <Button onClick={onReturnToDashboard} sx={{ mt: 2 }}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  const correctAnswers = testResult.questions.filter(q => q.isCorrect).length;
  const totalQuestions = testResult.questions.length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTimeSpent = testResult.questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
  const averageTimePerQuestion = Math.round(totalTimeSpent / totalQuestions);

  // Data for pie chart
  const chartData = [
    { name: 'Correct', value: correctAnswers, color: '#4caf50' },
    { name: 'Incorrect', value: totalQuestions - correctAnswers, color: '#f44336' }
  ];

  const getAccuracyColor = (acc) => {
    if (acc >= 80) return 'success';
    if (acc >= 60) return 'warning';
    return 'error';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 300 }}
        >
          Test Results
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {testResult.testType} - {testResult.section}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center" }}>
              <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color={getAccuracyColor(accuracy)}>
                {accuracy}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center" }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {correctAnswers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct Answers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center" }}>
              <Cancel color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {totalQuestions - correctAnswers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incorrect Answers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center" }}>
              <TrendingUp color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {formatTime(averageTimePerQuestion)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Time/Question
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="h6">
                {correctAnswers} out of {totalQuestions} correct
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total time: {formatTime(totalTimeSpent)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Test Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Test Details
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1">Test Type:</Typography>
                <Chip
                  label={testResult.testType}
                  color="primary"
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1">Section:</Typography>
                <Chip
                  label={testResult.section}
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1">Difficulty:</Typography>
                <Chip
                  label={testResult.difficulty}
                  color={
                    testResult.difficulty === "easy"
                      ? "success"
                      : testResult.difficulty === "medium"
                      ? "warning"
                      : "error"
                  }
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1">Date:</Typography>
                <Typography variant="body2">
                  {new Date(testResult.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  Performance Rating:
                </Typography>
                <Chip
                  label={
                    accuracy >= 80
                      ? "Excellent"
                      : accuracy >= 60
                      ? "Good"
                      : "Needs Improvement"
                  }
                  color={getAccuracyColor(accuracy)}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* AI Evaluation */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              AI Performance Analysis
            </Typography>
            {/* Use new AIInsights component for JSON insights */}
            {aiInsights && !isLoadingEvaluation ? (
              <AIInsights insights={aiInsights} isLoading={false} />
            ) : isLoadingEvaluation ? (
              <AIInsights insights={null} isLoading={true} />
            ) : (
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
              >
                {aiEvaluation ||
                  "AI evaluation could not be generated at this time."}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Question Review */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Question Review
            </Typography>
            {testResult.questions.map((question, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography sx={{ flexGrow: 1 }}>
                      Question {index + 1}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {question.isCorrect ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(question.timeSpent || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Question:</strong> {question.question}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Your Answer:</strong>{" "}
                      {question.options[question.userAnswer]}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Correct Answer:</strong>{" "}
                      {question.options[question.correctAnswer]}
                    </Typography>

                    {question.explanation && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Explanation:</strong> {question.explanation}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={onReturnToDashboard}
          size="large"
        >
          Return to Dashboard
        </Button>

        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetakeTest}
          size="large"
        >
          Retake Test
        </Button>
      </Box>
    </Container>
  );
};

export default TestResults;
