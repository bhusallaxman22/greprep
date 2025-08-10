import React from "react";
import { Paper, FormControlLabel, Radio, Typography } from "@mui/material";

const QuestionOptions = ({
  options = [],
  selectedValue,
  onSelect,
  isMobile = false,
  theme,
}) => {
  return options.map((option, index) => {
    const optionLabel =
      typeof option === "string" ? option : option.text || option.label;
    const optionValue =
      typeof option === "string"
        ? option
        : option.value || option.text || option.label;
    const isSelected = selectedValue === optionValue;

    return (
      <Paper
        key={index}
        elevation={isSelected ? 3 : 1}
        sx={{
          mb: 2,
          borderRadius: 2,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: isSelected
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.divider}`,
          background: isSelected
            ? `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`
            : theme.palette.background.paper,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.light,
            cursor: "pointer",
          },
        }}
        onClick={() => onSelect(optionValue)}
      >
        <FormControlLabel
          value={optionValue}
          control={
            <Radio
              sx={{
                color: theme.palette.primary.main,
                "&.Mui-checked": { color: theme.palette.primary.main },
              }}
            />
          }
          label={
            <Typography
              sx={{
                py: 1.5,
                px: 1,
                fontSize: isMobile ? "0.95rem" : "1rem",
                fontWeight: isSelected ? 600 : 400,
                lineHeight: 1.5,
              }}
            >
              {optionLabel}
            </Typography>
          }
          sx={{
            m: 0,
            width: "100%",
            px: 2,
            py: 1,
            "&:hover": { backgroundColor: "transparent" },
          }}
        />
      </Paper>
    );
  });
};

export default QuestionOptions;
