import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  LinearProgress,
  Chip,
  useTheme,
  Fade,
  Slide,
  Grow,
} from "@mui/material";
import {
  Lightbulb,
  Flag,
  MenuBook,
  Psychology,
  TrendingUp,
  CheckCircle,
  Analytics,
  Speed,
  EmojiEvents,
  School,
} from "@mui/icons-material";

const AIInsights = ({ insights, isLoading = false }) => {
  const theme = useTheme();

  // Map icon names to actual icons
  const getIcon = (iconName) => {
    const icons = {
      lightbulb: <Lightbulb />,
      flag: <Flag />,
      book: <MenuBook />,
      psychology: <Psychology />,
      trending_up: <TrendingUp />,
      analytics: <Analytics />,
      speed: <Speed />,
      trophy: <EmojiEvents />,
      school: <School />,
    };
    return icons[iconName] || <Lightbulb />;
  };

  // Map severity to colors
  const getSeverityColor = (severity) => {
    const colors = {
      info: "info",
      warning: "warning",
      success: "success",
      error: "error",
    };
    return colors[severity] || "info";
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Psychology sx={{ mr: 1, color: "primary.main" }} />
          AI Performance Analysis
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", py: 3 }}>
          <Box sx={{ mr: 2 }}>
            <LinearProgress />
          </Box>
          <Typography color="text.secondary">
            Analyzing your performance with AI...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!insights || insights.error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {insights?.error || "AI insights could not be generated at this time."}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Stats */}
      {insights.stats && (
        <Fade in timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                color: "primary.main",
              }}
            >
              <Psychology sx={{ mr: 2, fontSize: 32 }} />
              AI Performance Analysis
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {insights.stats.overallScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overall Score
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {insights.stats.strongestSection}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Strongest Section
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" color="error.main">
                    {insights.stats.weakestSection}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs Improvement
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" color="info.main">
                    {insights.stats.testsCompleted}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tests Completed
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Insights Grid */}
      <Grid container spacing={3}>
        {/* Key Insights */}
        {insights.keyInsights && (
          <Grid item xs={12} md={6}>
            <Slide direction="right" in timeout={1000}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getIcon(insights.keyInsights.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {insights.keyInsights.title}
                  </Typography>
                </Box>
                <Alert
                  severity={getSeverityColor(insights.keyInsights.severity)}
                  sx={{ border: "none", backgroundColor: "transparent", p: 0 }}
                  icon={false}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {insights.keyInsights.content}
                  </Typography>
                </Alert>
              </Paper>
            </Slide>
          </Grid>
        )}

        {/* Priority Actions */}
        {insights.priorityActions && (
          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={1200}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getIcon(insights.priorityActions.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {insights.priorityActions.title}
                  </Typography>
                  <Chip
                    label="High Priority"
                    color="warning"
                    size="small"
                    sx={{ ml: "auto" }}
                  />
                </Box>
                <Alert
                  severity={getSeverityColor(insights.priorityActions.severity)}
                  sx={{
                    backgroundColor: `${theme.palette.warning.light}10`,
                    border: `1px solid ${theme.palette.warning.light}`,
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {insights.priorityActions.content}
                  </Typography>
                </Alert>
              </Paper>
            </Slide>
          </Grid>
        )}

        {/* Study Plan */}
        {insights.studyPlan && (
          <Grid item xs={12} md={6}>
            <Grow in timeout={1400}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getIcon(insights.studyPlan.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {insights.studyPlan.title}
                  </Typography>
                </Box>
                <List dense sx={{ py: 0 }}>
                  {insights.studyPlan.items?.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="success" sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { lineHeight: 1.4 },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grow>
          </Grid>
        )}

        {/* Test Strategy */}
        {insights.testStrategy && (
          <Grid item xs={12} md={6}>
            <Grow in timeout={1600}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getIcon(insights.testStrategy.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {insights.testStrategy.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: `${theme.palette.info.light}10`,
                    border: `1px solid ${theme.palette.info.light}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {insights.testStrategy.content}
                  </Typography>
                </Box>
              </Paper>
            </Grow>
          </Grid>
        )}

        {/* Motivation */}
        {insights.motivation && (
          <Grid item xs={12}>
            <Fade in timeout={1800}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.primary.light}15)`,
                  border: `1px solid ${theme.palette.success.light}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {getIcon(insights.motivation.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {insights.motivation.title}
                  </Typography>
                  <EmojiEvents
                    sx={{ ml: "auto", color: "success.main", fontSize: 28 }}
                  />
                </Box>
                <Alert
                  severity="success"
                  sx={{
                    fontSize: "1.1rem",
                    backgroundColor: "transparent",
                    border: "none",
                    p: 0,
                  }}
                  icon={false}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontWeight: 500,
                      fontSize: "1.1rem",
                    }}
                  >
                    {insights.motivation.content}
                  </Typography>
                </Alert>
              </Paper>
            </Fade>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

AIInsights.propTypes = {
  insights: PropTypes.shape({
    keyInsights: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        content: PropTypes.string,
        icon: PropTypes.string,
        severity: PropTypes.string,
      })
    ),
    priorityActions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        content: PropTypes.string,
        icon: PropTypes.string,
        severity: PropTypes.string,
      })
    ),
    studyPlan: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        content: PropTypes.string,
        icon: PropTypes.string,
        severity: PropTypes.string,
      })
    ),
    testStrategy: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        content: PropTypes.string,
        icon: PropTypes.string,
        severity: PropTypes.string,
      })
    ),
    motivation: PropTypes.shape({
      title: PropTypes.string,
      content: PropTypes.string,
      icon: PropTypes.string,
    }),
    stats: PropTypes.shape({
      overallGrade: PropTypes.string,
      improvement: PropTypes.string,
      focusAreas: PropTypes.arrayOf(PropTypes.string),
    }),
    error: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default AIInsights;
