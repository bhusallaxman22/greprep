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

  // Normalize legacy shapes (arrays) to current object shape
  const normalizeSection = (section) => {
    if (!section) return null;
    if (Array.isArray(section)) {
      // Take first item or join array depending on expected usage
      const first = section[0];
      if (typeof first === "string") {
        return {
          title: "Insights",
          content: section.join("\n"),
          icon: "lightbulb",
          severity: "info",
        };
      }
      if (typeof first === "object") return first; // assume already structured
    }
    return section; // already object
  };

  const normalized = insights
    ? {
        keyInsights:
          normalizeSection(insights.keyInsights) ||
          normalizeSection(insights.insights) ||
          normalizeSection(insights.keyInsight),
        priorityActions:
          normalizeSection(insights.priorityActions) ||
          normalizeSection(insights.actions),
        studyPlan:
          normalizeSection(insights.studyPlan) ||
          (Array.isArray(insights.studyPlanItems)
            ? {
                title: "Study Plan",
                items: insights.studyPlanItems,
                icon: "book",
                severity: "info",
              }
            : null),
        testStrategy:
          normalizeSection(insights.testStrategy) ||
          normalizeSection(insights.strategy),
        motivation:
          normalizeSection(insights.motivation) ||
          normalizeSection(insights.encouragement),
        stats: insights.stats,
        error: insights.error,
      }
    : null;

  // Derive simple fallback text if rich sections missing
  const simpleText =
    !normalized?.keyInsights && typeof insights === "string" ? insights : null;

  // Show placeholder if nothing meaningful
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
          <Box sx={{ mr: 2, flex: 1 }}>
            <LinearProgress />
          </Box>
          <Typography color="text.secondary">
            Analyzing your performance with AI...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!normalized) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Psychology sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          AI insights will appear here once enough performance data is
          available.
        </Typography>
      </Box>
    );
  }

  if (normalized?.error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {normalized.error || "AI insights could not be generated at this time."}
      </Alert>
    );
  }

  if (simpleText) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", mb: 2 }}
        >
          <Psychology sx={{ mr: 1 }} />
          AI Insights
        </Typography>
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
        >
          {simpleText}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header with Stats */}
      {normalized?.stats && (
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
                    {normalized.stats.overallScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overall Score
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {normalized.stats.strongestSection}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Strongest Section
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" color="error.main">
                    {normalized.stats.weakestSection}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs Improvement
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" color="info.main">
                    {normalized.stats.testsCompleted}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tests Completed
                  </Typography>
                </Card>
              </Grid>
              {typeof normalized.stats.averageQuestionTime === "number" && (
                <Grid item xs={12} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h6" color="secondary.main">
                      {Math.round(normalized.stats.averageQuestionTime)}s
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Time/Q
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Insights Grid */}
      <Grid container spacing={3}>
        {/* Key Insights */}
        {normalized.keyInsights && (
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
                  {getIcon(normalized.keyInsights.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {normalized.keyInsights.title}
                  </Typography>
                </Box>
                <Alert
                  severity={getSeverityColor(normalized.keyInsights.severity)}
                  sx={{ border: "none", backgroundColor: "transparent", p: 0 }}
                  icon={false}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {normalized.keyInsights.content}
                  </Typography>
                </Alert>
              </Paper>
            </Slide>
          </Grid>
        )}

        {/* Priority Actions */}
        {normalized.priorityActions && (
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
                  {getIcon(normalized.priorityActions.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {normalized.priorityActions.title}
                  </Typography>
                  <Chip
                    label="High Priority"
                    color="warning"
                    size="small"
                    sx={{ ml: "auto" }}
                  />
                </Box>
                <Alert
                  severity={getSeverityColor(
                    normalized.priorityActions.severity
                  )}
                  sx={{
                    backgroundColor: `${theme.palette.warning.light}10`,
                    border: `1px solid ${theme.palette.warning.light}`,
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {normalized.priorityActions.content}
                  </Typography>
                </Alert>
              </Paper>
            </Slide>
          </Grid>
        )}

        {/* Study Plan */}
        {normalized.studyPlan && (
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
                  {getIcon(normalized.studyPlan.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {normalized.studyPlan.title}
                  </Typography>
                </Box>
                <List dense sx={{ py: 0 }}>
                  {normalized.studyPlan.items?.map((item) => (
                    <ListItem
                      key={
                        typeof item === "string" ? item : JSON.stringify(item)
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="success" sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontSize: "0.875rem",
                            lineHeight: 1.4,
                          },
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
        {normalized.testStrategy && (
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
                  {getIcon(normalized.testStrategy.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {normalized.testStrategy.title}
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
                    {normalized.testStrategy.content}
                  </Typography>
                </Box>
              </Paper>
            </Grow>
          </Grid>
        )}

        {/* Motivation */}
        {normalized.motivation && (
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
                  {getIcon(normalized.motivation.icon)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
                    {normalized.motivation.title}
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
                    {normalized.motivation.content}
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
    keyInsights: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    insights: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    keyInsight: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    priorityActions: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    actions: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    studyPlan: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    studyPlanItems: PropTypes.array,
    testStrategy: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    strategy: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    motivation: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    encouragement: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    stats: PropTypes.object,
    error: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default AIInsights;
