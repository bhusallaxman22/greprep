import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography, useTheme } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

const ReadingPassagePanel = ({ passage, maxHeight }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        borderRadius: 3,
        bgcolor: theme.palette.grey[50],
        border: `1px solid ${theme.palette.divider}`,
        maxHeight: maxHeight || "70vh",
        overflow: "auto",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        <InfoIcon sx={{ mr: 1, fontSize: 24 }} /> Reading Passage
      </Typography>
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.8,
          fontSize: "1.05rem",
          textAlign: "justify",
          whiteSpace: "pre-line",
        }}
      >
        {passage}
      </Typography>
    </Paper>
  );
};

ReadingPassagePanel.propTypes = {
  passage: PropTypes.string.isRequired,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReadingPassagePanel;
