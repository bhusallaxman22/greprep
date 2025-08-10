import React from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";

const QuestionLayout = ({
  passage,
  question,
  isMobile = false,
  gap = 3,
  sx = {},
}) => {
  if (!passage) {
    return question;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap,
        ...sx,
      }}
    >
      {passage}
      {question}
    </Box>
  );
};

QuestionLayout.propTypes = {
  passage: PropTypes.node,
  question: PropTypes.node.isRequired,
  isMobile: PropTypes.bool,
  gap: PropTypes.number,
  sx: PropTypes.object,
};

export default QuestionLayout;
