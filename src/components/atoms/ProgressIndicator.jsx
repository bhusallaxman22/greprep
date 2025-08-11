import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Reusable progress indicator atom for showing completion status
 */
const ProgressIndicator = ({
  value,
  total,
  label,
  showPercentage = true,
  size = "medium",
  color = "primary",
  ...props
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const sizeMap = {
    small: { height: 4, fontSize: "0.75rem" },
    medium: { height: 6, fontSize: "0.875rem" },
    large: { height: 8, fontSize: "1rem" },
  };

  return (
    <Box sx={{ width: "100%" }} {...props}>
      {label && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: sizeMap[size].fontSize }}>
            {label}
          </Typography>
          {showPercentage && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: sizeMap[size].fontSize }}
            >
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: sizeMap[size].height,
          borderRadius: 1,
          bgcolor: "grey.200",
        }}
      />
    </Box>
  );
};

ProgressIndicator.propTypes = {
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  label: PropTypes.string,
  showPercentage: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "info",
  ]),
};

export default ProgressIndicator;
