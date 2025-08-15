import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Timer as TimerIcon, Warning } from "@mui/icons-material";
import PropTypes from "prop-types";

const Timer = ({
  duration = 0, // in seconds
  onTimeUp,
  autoStart = false,
  showWarningAt = 60, // seconds remaining to show warning
  variant = "default", // "default", "compact", "chip"
  color = "primary",
  warningColor = "warning",
  dangerColor = "error",
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [intervalId, setIntervalId] = useState(null);

  const formatTime = useCallback((seconds) => {
    if (seconds <= 0) return "00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const getColor = useCallback(() => {
    if (timeRemaining <= 30) return dangerColor;
    if (timeRemaining <= showWarningAt) return warningColor;
    return color;
  }, [timeRemaining, showWarningAt, color, warningColor, dangerColor]);

  const start = useCallback(() => {
    if (!isRunning && timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [isRunning, timeRemaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(duration);
  }, [duration]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(0);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      const id = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeRemaining, onTimeUp, intervalId]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeRemaining(duration);
    if (autoStart) {
      setIsRunning(true);
    }
  }, [duration, autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const currentColor = getColor();
  const formattedTime = formatTime(timeRemaining);
  const isWarning = timeRemaining <= showWarningAt && timeRemaining > 30;
  const isDanger = timeRemaining <= 30;

  if (variant === "chip") {
    return (
      <Chip
        icon={isDanger ? <Warning /> : <TimerIcon />}
        label={formattedTime}
        color={currentColor}
        variant={isDanger ? "filled" : "outlined"}
        sx={{
          fontFamily: "monospace",
          fontSize: "0.9rem",
          fontWeight: 600,
          animation: isDanger ? "pulse 1s infinite" : "none",
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.7 },
            "100%": { opacity: 1 },
          },
        }}
      />
    );
  }

  if (variant === "compact") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: `${currentColor}.main`,
        }}
      >
        <TimerIcon sx={{ fontSize: 16 }} />
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: `${currentColor}.main`,
          }}
        >
          {formattedTime}
        </Typography>
      </Box>
    );
  }

  // Default variant
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 2,
        border: 1,
        borderColor: `${currentColor}.main`,
        borderRadius: 2,
        backgroundColor:
          isWarning || isDanger ? `${currentColor}.50` : "transparent",
        animation: isDanger ? "pulse 1s infinite" : "none",
        "@keyframes pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.8 },
          "100%": { opacity: 1 },
        },
      }}
    >
      {isDanger ? (
        <Warning color={currentColor} />
      ) : (
        <TimerIcon color={currentColor} />
      )}
      <Typography
        variant="h6"
        sx={{
          fontFamily: "monospace",
          fontWeight: 600,
          color: `${currentColor}.main`,
        }}
      >
        {formattedTime}
      </Typography>
    </Box>
  );
};

Timer.propTypes = {
  duration: PropTypes.number,
  onTimeUp: PropTypes.func,
  autoStart: PropTypes.bool,
  showWarningAt: PropTypes.number,
  variant: PropTypes.oneOf(["default", "compact", "chip"]),
  color: PropTypes.string,
  warningColor: PropTypes.string,
  dangerColor: PropTypes.string,
};

// Expose control methods for external use
Timer.displayName = "Timer";

export default Timer;
