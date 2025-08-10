import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const ScoreDisplay = ({
  percentage,
  correct,
  total,
  percentageVariant = "h4",
  detailVariant = "h6",
  sx = {},
}) => {
  return (
    <Box sx={{ my: 3, ...sx }}>
      <Typography variant={percentageVariant} color="primary" gutterBottom>
        Your Score: {percentage}%
      </Typography>
      <Typography variant={detailVariant} color="text.secondary">
        {correct} out of {total} questions correct
      </Typography>
    </Box>
  );
};

ScoreDisplay.propTypes = {
  percentage: PropTypes.number.isRequired,
  correct: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  percentageVariant: PropTypes.string,
  detailVariant: PropTypes.string,
  sx: PropTypes.object,
};

export default ScoreDisplay;
