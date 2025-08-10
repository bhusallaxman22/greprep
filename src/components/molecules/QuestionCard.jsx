import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography, Chip } from "@mui/material";

const QuestionCard = ({ label, questionText, chipColor = "primary" }) => (
  <Paper
    elevation={3}
    sx={{
      p: 4,
      borderRadius: 3,
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Chip
      label={label}
      color={chipColor}
      variant="outlined"
      sx={{ fontWeight: "bold", borderRadius: 2, mb: 3 }}
    />
    <Typography
      variant="h6"
      sx={{ lineHeight: 1.6, fontSize: "1.2rem", fontWeight: 500 }}
    >
      {questionText}
    </Typography>
  </Paper>
);

QuestionCard.propTypes = {
  label: PropTypes.string.isRequired,
  questionText: PropTypes.string.isRequired,
  chipColor: PropTypes.oneOf(["primary", "secondary"]),
};

export default QuestionCard;
