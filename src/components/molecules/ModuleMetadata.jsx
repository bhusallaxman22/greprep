import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { Timer, QuestionAnswer, Star } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * Learning module metadata display molecule
 */
const ModuleMetadata = ({
  duration,
  questionCount,
  xpReward,
  completionRate,
  layout = "horizontal",
  size = "medium",
}) => {
  const sizeConfig = {
    small: { iconSize: 16, fontSize: "0.75rem", spacing: 1 },
    medium: { iconSize: 18, fontSize: "0.875rem", spacing: 1.5 },
    large: { iconSize: 20, fontSize: "1rem", spacing: 2 },
  };

  const config = sizeConfig[size];

  const MetadataItem = ({ icon, value, label }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: 0, // Prevent overflow
      }}
    >
      {React.cloneElement(icon, {
        sx: { fontSize: config.iconSize, color: "text.secondary" },
      })}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: config.fontSize, whiteSpace: "nowrap" }}
      >
        {value} {label}
      </Typography>
    </Box>
  );

  const items = [
    ...(duration ? [{ icon: <Timer />, value: duration, label: "min" }] : []),
    ...(questionCount
      ? [{ icon: <QuestionAnswer />, value: questionCount, label: "questions" }]
      : []),
    ...(xpReward
      ? [{ icon: <Star />, value: `+${xpReward}`, label: "XP" }]
      : []),
  ];

  if (layout === "vertical") {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: config.spacing }}
      >
        {items.map((item, index) => (
          <MetadataItem key={index} {...item} />
        ))}
        {completionRate !== undefined && (
          <Chip
            label={`${completionRate}% complete`}
            size="small"
            color={completionRate === 100 ? "success" : "primary"}
            variant="outlined"
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: config.spacing,
        flexWrap: "wrap",
      }}
    >
      {items.map((item, index) => (
        <MetadataItem key={index} {...item} />
      ))}
      {completionRate !== undefined && (
        <Chip
          label={`${completionRate}% complete`}
          size="small"
          color={completionRate === 100 ? "success" : "primary"}
          variant="outlined"
        />
      )}
    </Box>
  );
};

ModuleMetadata.propTypes = {
  duration: PropTypes.number,
  questionCount: PropTypes.number,
  xpReward: PropTypes.number,
  completionRate: PropTypes.number,
  layout: PropTypes.oneOf(["horizontal", "vertical"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default ModuleMetadata;
