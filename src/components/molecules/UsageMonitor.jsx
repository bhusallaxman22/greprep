import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Divider,
  Grid,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Warning,
  Info,
  CheckCircle,
} from "@mui/icons-material";
import { getUsageStats, checkUsageWarnings } from "../../services/rateLimiter";
import { isFeatureEnabled } from "../../constants/featureFlags";
import SafeTransitionWrapper from "../atoms/SafeTransitionWrapper";

/**
 * UsageMonitor - Displays API usage statistics and warnings
 */
const UsageMonitor = ({ showDetails = false, variant = "compact" }) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [stats, setStats] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      try {
        setStats(getUsageStats());
        setWarnings(checkUsageWarnings());
        setIsReady(true);
      } catch (error) {
        console.warn("Error updating usage stats:", error);
        setStats(null);
        setWarnings([]);
        setIsReady(false);
      }
    };

    updateStats();
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check if rate limiting features are enabled
  if (
    !isFeatureEnabled("RATE_LIMITING", "enabled") ||
    !isFeatureEnabled("RATE_LIMITING", "showUsageStats")
  ) {
    return null;
  }

  if (!stats || !isReady) return null;

  const getUsageColor = (used, limit) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const getUsageIcon = (used, limit) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return <Warning color="error" />;
    if (percentage >= 70) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  // Compact view for dashboard
  if (variant === "compact") {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              API Usage
            </Typography>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ p: 0.5 }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* Warning alerts */}
          {warnings.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {warnings.map((warning) => (
                <Alert
                  key={warning}
                  severity="warning"
                  variant="outlined"
                  sx={{ mb: 1, py: 0.5 }}
                >
                  <Typography variant="caption">{warning}</Typography>
                </Alert>
              ))}
            </Box>
          )}

          {/* Quick status chips */}
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <Chip
              icon={getUsageIcon(
                stats.questions.session.used,
                stats.questions.session.limit
              )}
              label={`Session: ${stats.questions.session.used}/${stats.questions.session.limit}`}
              size="small"
              color={getUsageColor(
                stats.questions.session.used,
                stats.questions.session.limit
              )}
              variant="outlined"
            />
            <Chip
              icon={getUsageIcon(
                stats.questions.hourly.used,
                stats.questions.hourly.limit
              )}
              label={`Hourly: ${stats.questions.hourly.used}/${stats.questions.hourly.limit}`}
              size="small"
              color={getUsageColor(
                stats.questions.hourly.used,
                stats.questions.hourly.limit
              )}
              variant="outlined"
            />
          </Box>

          <Collapse in={expanded} timeout={300} unmountOnExit>
            <SafeTransitionWrapper>
              <Box sx={{ mt: 2 }}>
                <UsageDetails stats={stats} />
              </Box>
            </SafeTransitionWrapper>
          </Collapse>
        </CardContent>
      </Card>
    );
  }

  // Full view for settings/profile
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Info color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            API Usage Monitor
          </Typography>
        </Box>

        {warnings.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {warnings.map((warning) => (
              <Alert key={warning} severity="warning" sx={{ mb: 1 }}>
                {warning}
              </Alert>
            ))}
          </Box>
        )}

        <UsageDetails stats={stats} />
      </CardContent>
    </Card>
  );
};

/**
 * Detailed usage statistics component
 */
const UsageDetails = ({ stats }) => {
  const renderUsageSection = (title, data, icon) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(data).map(([period, usage]) => (
          <Grid item xs={12} sm={4} key={period}>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {period}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {usage.used}/{usage.limit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(usage.used / usage.limit) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: (() => {
                      const ratio = usage.used / usage.limit;
                      if (ratio >= 0.9) return "error.main";
                      if (ratio >= 0.7) return "warning.main";
                      return "success.main";
                    })(),
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
              >
                {usage.remaining} remaining
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>
      {renderUsageSection(
        "Question Generation",
        stats.questions,
        <CheckCircle color="primary" />
      )}

      <Divider sx={{ my: 2 }} />

      {renderUsageSection(
        "AI Evaluations",
        stats.evaluations,
        <Warning color="secondary" />
      )}

      <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
        <Typography variant="caption">
          Usage limits reset hourly and daily. Session limits reset when you
          start a new test.
        </Typography>
      </Alert>
    </Box>
  );
};

UsageMonitor.propTypes = {
  showDetails: PropTypes.bool,
  variant: PropTypes.oneOf(["compact", "full"]),
};

UsageDetails.propTypes = {
  stats: PropTypes.shape({
    questions: PropTypes.object.isRequired,
    evaluations: PropTypes.object.isRequired,
  }).isRequired,
};

export default UsageMonitor;
