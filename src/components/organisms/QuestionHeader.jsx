import React from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

const QuestionHeader = ({
  index,
  total,
  passage,
  isFlagged,
  onToggleFlag,
  onOpenNavigator,
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        p: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Question {index + 1}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          of {total} questions
          {passage && (
            <Chip
              label="Reading Comprehension"
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ ml: 1, fontSize: "0.7rem" }}
            />
          )}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title={isFlagged ? "Remove flag" : "Flag question"}>
          <IconButton
            onClick={onToggleFlag}
            color={isFlagged ? "warning" : "default"}
            size="small"
          >
            <FlagIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Navigate to question">
          <IconButton onClick={onOpenNavigator} size="small">
            <QuestionMarkIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default QuestionHeader;
