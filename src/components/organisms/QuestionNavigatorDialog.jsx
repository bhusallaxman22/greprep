import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme } from "@mui/material/styles";

const QuestionNavigatorDialog = ({
  open,
  onClose,
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  onNavigate,
}) => {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      keepMounted={false}
    >
      <DialogTitle>Navigate to Question</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
            gap: 1,
            mt: 1,
          }}
        >
          {Array.from({ length: totalQuestions }, (_, index) => {
            const isAnswered = answers[index] !== undefined;
            const isFlagged = flagged.includes(index);
            const isCurrent = index === currentIndex;
            return (
              <Button
                key={index}
                variant={isCurrent ? "contained" : "outlined"}
                color={
                  isCurrent ? "primary" : isAnswered ? "success" : "inherit"
                }
                onClick={() => {
                  onNavigate(index);
                  onClose();
                }}
                sx={{
                  minWidth: 60,
                  height: 60,
                  position: "relative",
                  fontSize: "0.875rem",
                  fontWeight: isCurrent ? "bold" : "normal",
                }}
              >
                {index + 1}
                {isFlagged && (
                  <FlagIcon
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      fontSize: 12,
                      color: theme.palette.warning.main,
                    }}
                  />
                )}
                {isAnswered && !isCurrent && (
                  <CheckCircleIcon
                    sx={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      fontSize: 12,
                      color: theme.palette.success.main,
                    }}
                  />
                )}
              </Button>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionNavigatorDialog;
