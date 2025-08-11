import React from "react";
import PropTypes from "prop-types";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  LinearProgress,
  Chip,
} from "@mui/material";
import { Timer, Warning, Refresh, Info, Quiz } from "@mui/icons-material";

/**
 * RateLimitAlert - Displays user-friendly rate limit error messages
 */
const RateLimitAlert = ({
  error,
  onRetry,
  onDismiss,
  severity = "warning",
  showRetryButton = true,
}) => {
  if (!error || !error.includes("limit")) {
    return null;
  }

  const parseError = (errorMessage) => {
    const info = {
      type: "unknown",
      title: "Rate Limit Reached",
      description: errorMessage,
      suggestion: "Please wait before trying again.",
      icon: <Warning />,
    };

    if (errorMessage.includes("Hourly")) {
      info.type = "hourly";
      info.title = "Hourly Limit Reached";
      info.description =
        "You've reached the maximum number of requests for this hour.";
      info.suggestion =
        "Limits reset at the top of each hour. Take a break and try again later!";
      info.icon = <Timer />;
    } else if (errorMessage.includes("Daily")) {
      info.type = "daily";
      info.title = "Daily Limit Reached";
      info.description =
        "You've reached the maximum number of requests for today.";
      info.suggestion =
        "Come back tomorrow for more practice questions and evaluations.";
      info.icon = <Timer />;
    } else if (errorMessage.includes("session")) {
      info.type = "session";
      info.title = "Session Limit Reached";
      info.description =
        "You've reached the maximum questions for this test session.";
      info.suggestion =
        "Finish your current test or start a new one to continue practicing.";
      info.icon = <Quiz />;
    } else if (errorMessage.includes("Too many requests")) {
      info.type = "throttle";
      info.title = "Slow Down";
      info.description = "Requests are being made too quickly.";
      info.suggestion =
        "Please wait a moment before generating more questions.";
      info.icon = <Timer />;
    }

    return info;
  };

  const errorInfo = parseError(error);

  const getTimeUntilReset = () => {
    const now = new Date();
    if (errorInfo.type === "hourly") {
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return nextHour;
    } else if (errorInfo.type === "daily") {
      const nextDay = new Date(now);
      nextDay.setDate(now.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      return nextDay;
    }
    return null;
  };

  const formatTimeRemaining = (resetTime) => {
    if (!resetTime) return null;

    const now = new Date();
    const diff = resetTime - now;

    if (diff <= 0) return "Now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const resetTime = getTimeUntilReset();
  const timeRemaining = formatTimeRemaining(resetTime);

  return (
    <Alert
      severity={severity}
      variant="filled"
      sx={{
        mb: 2,
        "& .MuiAlert-message": { width: "100%" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
        {errorInfo.icon}
        <Box sx={{ flex: 1 }}>
          <AlertTitle sx={{ mb: 1, fontWeight: 600 }}>
            {errorInfo.title}
          </AlertTitle>

          <Typography variant="body2" sx={{ mb: 2 }}>
            {errorInfo.description}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
            {errorInfo.suggestion}
          </Typography>

          {timeRemaining && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Timer fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Resets in: {timeRemaining}
                </Typography>
              </Box>
              {errorInfo.type === "hourly" && (
                <LinearProgress
                  variant="determinate"
                  value={((60 - new Date().getMinutes()) / 60) * 100}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.3)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "rgba(255,255,255,0.8)",
                    },
                  }}
                />
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {showRetryButton && errorInfo.type === "throttle" && (
              <Button
                size="small"
                variant="outlined"
                onClick={onRetry}
                startIcon={<Refresh />}
                sx={{
                  color: "inherit",
                  borderColor: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.8)",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Try Again
              </Button>
            )}

            {onDismiss && (
              <Button
                size="small"
                variant="text"
                onClick={onDismiss}
                sx={{
                  color: "inherit",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Dismiss
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Alert>
  );
};

RateLimitAlert.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]),
  showRetryButton: PropTypes.bool,
};

export default RateLimitAlert;
