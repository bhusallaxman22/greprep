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
  Paper
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Quiz,
  School,
  Timeline
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import firebaseService from '../services/firebase';
import openRouterService from '../services/openrouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onStartTest }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [aiEvaluation, setAiEvaluation] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoadingStats(true);
      setError('');

      // Load user statistics
      const userStats = await firebaseService.calculateUserStats(user.uid);
      setStats(userStats);
      setLoadingStats(false);

      // Get AI evaluation if user has taken tests
      if (userStats.totalTests > 0) {
        setLoadingAI(true);
        try {
          const testResults = await firebaseService.getUserTestResults(user.uid);
          const evaluation = await openRouterService.evaluatePerformance(testResults.slice(0, 3));
          setAiEvaluation(evaluation);
        } catch (aiError) {
          console.error('AI evaluation failed:', aiError);
          setAiEvaluation('AI evaluation temporarily unavailable. Please check your OpenRouter API configuration.');
        } finally {
          setLoadingAI(false);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check your Firebase configuration.');
      setLoadingStats(false);
    }
  }, [user.uid]);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 300 }}>
          Test Prep Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Track your progress and improve your test performance
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Quiz color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tests Taken</Typography>
              </Box>
              {loadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Typography variant="h3" color="primary">
                  {stats?.totalTests || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Questions</Typography>
              </Box>
              {loadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Typography variant="h3" color="primary">
                  {stats?.totalQuestions || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Overall Accuracy</Typography>
              </Box>
              {loadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Typography variant="h3" color={getAccuracyColor(stats?.overallAccuracy || 0)}>
                  {stats?.overallAccuracy || 0}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {stats ? getImprovementIcon(stats.improvementTrend) : <Timeline color="action" />}
                <Typography variant="h6" sx={{ ml: 1 }}>Trend</Typography>
              </Box>
              {loadingStats ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Typography 
                  variant="h3" 
                  color={stats?.improvementTrend >= 0 ? 'success.main' : 'error.main'}
                >
                  {stats?.improvementTrend > 0 ? '+' : ''}{stats?.improvementTrend || 0}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Start New Test Button */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={onStartTest}
          sx={{ 
            py: 2, 
            px: 4, 
            fontSize: '1.2rem',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          Start New Test
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Section Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Section Performance
            </Typography>
            {loadingStats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
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
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label) => `Section: ${label}`}
                    />
                    <Bar dataKey="accuracy" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="text.secondary">
                  No test data available. Take your first test to see performance charts!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Section Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" gutterBottom>
              Section Breakdown
            </Typography>
            {loadingStats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : stats && Object.keys(stats.sectionBreakdown).length === 0 ? (
              <Typography color="text.secondary">
                No test data available. Start your first test to see section performance!
              </Typography>
            ) : stats && (
              Object.keys(stats.sectionBreakdown).map((section) => {
                const sectionData = stats.sectionBreakdown[section];
                return (
                  <Box key={section} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
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
        </Grid>

        {/* AI Evaluation */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              AI Performance Analysis
            </Typography>
            {loadingAI ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ mr: 2 }} />
                <Typography color="text.secondary">
                  Analyzing your performance...
                </Typography>
              </Box>
            ) : aiEvaluation ? (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {aiEvaluation}
              </Typography>
            ) : stats && stats.totalTests > 0 ? (
              <Typography color="text.secondary">
                AI evaluation will appear here after your first test.
              </Typography>
            ) : (
              <Typography color="text.secondary">
                Take a test to get personalized AI-powered improvement suggestions.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Performance */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Test Performance
            </Typography>
            {loadingStats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : stats && stats.recentPerformance.length > 0 ? (
              <Grid container spacing={2}>
                {stats.recentPerformance.map((test, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {Math.round(test.accuracy)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {test.testType} - {test.section}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(test.date).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No recent test data available. Take your first test to see performance history!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
