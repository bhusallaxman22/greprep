import React from "react";
import PropTypes from "prop-types";
import { LinearProgress, Zoom } from "@mui/material";

const QuestionProgress = ({ value }) => (
  <Zoom in timeout={800}>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{ mb: 3, height: 8, borderRadius: 4 }}
    />
  </Zoom>
);

QuestionProgress.propTypes = {
  value: PropTypes.number.isRequired,
};

export default QuestionProgress;
