import React from "react";
import { Box, Paper, Fade, Zoom } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import PropTypes from "prop-types";

import IconDisplay from "../atoms/IconDisplay";
import GradientText from "../atoms/GradientText";
import ScoreDisplay from "../atoms/ScoreDisplay";
import ActionButtonGroup from "./ActionButtonGroup";

const TestCompletionCard = ({
  score,
  onReturnToDashboard,
  onRetakeTest,
  onReviewAnswers,
  isAnimated = true,
  loadingStates = {},
  sx = {},
}) => {
  const primaryAction = {
    label: "Return to Dashboard",
    onClick: onReturnToDashboard,
    loading: loadingStates.returnToDashboard,
  };

  const secondaryActions = [
    {
      key: "retake",
      label: "Retake Test",
      onClick: onRetakeTest,
      loading: loadingStates.retakeTest,
    },
    {
      key: "review",
      label: "Review Answers",
      onClick: onReviewAnswers,
      loading: loadingStates.reviewAnswers,
    },
  ];

  const content = (
    <Paper elevation={6} sx={{ p: 4, borderRadius: 3, ...sx }}>
      <IconDisplay icon={CheckCircleIcon} color="success" size={80} />

      <GradientText variant="h3" gutterBottom>
        Test Completed!
      </GradientText>

      {score && (
        <ScoreDisplay
          percentage={score.percentage}
          correct={score.correct}
          total={score.total}
        />
      )}

      <ActionButtonGroup
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      />
    </Paper>
  );

  if (!isAnimated) {
    return content;
  }

  return (
    <Fade in timeout={800}>
      <Box sx={{ textAlign: "center" }}>
        <Zoom in timeout={1000} style={{ transformOrigin: "center center" }}>
          <Box>{content}</Box>
        </Zoom>
      </Box>
    </Fade>
  );
};

TestCompletionCard.propTypes = {
  score: PropTypes.shape({
    percentage: PropTypes.number.isRequired,
    correct: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }),
  onReturnToDashboard: PropTypes.func.isRequired,
  onRetakeTest: PropTypes.func.isRequired,
  onReviewAnswers: PropTypes.func.isRequired,
  isAnimated: PropTypes.bool,
  loadingStates: PropTypes.object,
  sx: PropTypes.object,
};

export default TestCompletionCard;
