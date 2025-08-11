import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Lock,
  CheckCircle,
  BookmarkBorder,
  Bookmark,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import DifficultyBadge from "../atoms/DifficultyBadge";
import ModuleMetadata from "./ModuleMetadata";
import ProgressIndicator from "../atoms/ProgressIndicator";

/**
 * Learning module card molecule for displaying module information
 */
const LearningModuleCard = ({
  module,
  isCompleted = false,
  isLocked = false,
  isBookmarked = false,
  progress = 0,
  onStart,
  onToggleBookmark,
  showProgress = true,
}) => {
  const handleStart = () => {
    if (!isLocked && onStart) {
      onStart(module);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(module.id);
    }
  };

  const getButtonProps = () => {
    if (isCompleted) {
      return {
        startIcon: <CheckCircle />,
        children: "Completed",
        color: "success",
        variant: "outlined",
      };
    }

    if (isLocked) {
      return {
        startIcon: <Lock />,
        children: "Locked",
        disabled: true,
        variant: "outlined",
      };
    }

    if (progress > 0) {
      return {
        startIcon: <PlayArrow />,
        children: "Continue",
        variant: "contained",
      };
    }

    return {
      startIcon: <PlayArrow />,
      children: "Start",
      variant: "contained",
    };
  };

  const buttonProps = getButtonProps();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        cursor: isLocked ? "default" : "pointer",
        opacity: isLocked ? 0.7 : 1,
        "&:hover": isLocked
          ? {}
          : {
              transform: "translateY(-2px)",
              boxShadow: 3,
            },
        position: "relative",
      }}
      onClick={handleStart}
    >
      {/* Bookmark Button */}
      {onToggleBookmark && !isLocked && (
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark module"}>
            <IconButton
              size="small"
              onClick={handleBookmark}
              sx={{
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              {isBookmarked ? (
                <Bookmark color="warning" fontSize="small" />
              ) : (
                <BookmarkBorder fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flexGrow: 1, pr: onToggleBookmark ? 5 : 0 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              {module.title}
            </Typography>
            <DifficultyBadge difficulty={module.difficulty} />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {module.description}
        </Typography>

        {/* Metadata */}
        <ModuleMetadata
          duration={module.duration}
          questionCount={module.questionCount}
          xpReward={module.xpReward}
          size="small"
        />

        {/* Progress */}
        {showProgress && progress > 0 && !isCompleted && (
          <Box sx={{ mt: 2 }}>
            <ProgressIndicator
              value={progress}
              total={100}
              label="Progress"
              size="small"
              color={progress === 100 ? "success" : "primary"}
            />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          {...buttonProps}
          fullWidth
          onClick={handleStart}
          disabled={isLocked}
        />
      </CardActions>
    </Card>
  );
};

LearningModuleCard.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    duration: PropTypes.number,
    questionCount: PropTypes.number,
    xpReward: PropTypes.number,
  }).isRequired,
  isCompleted: PropTypes.bool,
  isLocked: PropTypes.bool,
  isBookmarked: PropTypes.bool,
  progress: PropTypes.number,
  onStart: PropTypes.func,
  onToggleBookmark: PropTypes.func,
  showProgress: PropTypes.bool,
};

export default LearningModuleCard;
