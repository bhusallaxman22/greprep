import React from "react";
import { Chip } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Reusable difficulty badge atom for showing module difficulty
 */
const DifficultyBadge = ({
  difficulty,
  variant = "filled",
  size = "small",
}) => {
  const getDifficultyConfig = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return { label: "Beginner", color: "success" };
      case "intermediate":
        return { label: "Intermediate", color: "warning" };
      case "advanced":
        return { label: "Advanced", color: "error" };
      case "expert":
        return { label: "Expert", color: "secondary" };
      default:
        return { label: "Unknown", color: "default" };
    }
  };

  const config = getDifficultyConfig(difficulty);

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={variant}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
};

DifficultyBadge.propTypes = {
  difficulty: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["filled", "outlined"]),
  size: PropTypes.oneOf(["small", "medium"]),
};

export default DifficultyBadge;
