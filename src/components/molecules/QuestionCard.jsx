import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography, Chip, Box } from "@mui/material";
import QuestionImage from "../atoms/QuestionImage";

const QuestionCard = ({
  label,
  questionText,
  chipColor = "primary",
  image,
  imageDescription,
}) => (
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

    {/* Question text */}
    <Typography
      variant="h6"
      sx={{
        lineHeight: 1.6,
        fontSize: "1.2rem",
        fontWeight: 500,
        mb: image ? 2 : 0,
      }}
    >
      {questionText}
    </Typography>

    {/* Question image if provided */}
    {image && (
      <Box sx={{ mt: 2 }}>
        <QuestionImage
          src={image}
          description={imageDescription}
          maxHeight="350px"
          showZoom={true}
          showDescription={true}
        />
      </Box>
    )}
  </Paper>
);

QuestionCard.propTypes = {
  label: PropTypes.string.isRequired,
  questionText: PropTypes.string.isRequired,
  chipColor: PropTypes.oneOf(["primary", "secondary"]),
  image: PropTypes.string,
  imageDescription: PropTypes.string,
};

export default QuestionCard;
