import React from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";

function DifficultySelect({ value, onChange, options, startAdornment }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Difficulty Level</InputLabel>
      <Select
        value={value}
        label="Difficulty Level"
        onChange={(e) => onChange(e.target.value)}
        startAdornment={startAdornment}
      >
        {options.map((diff) => (
          <MenuItem key={diff.value} value={diff.value}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Chip
                label={diff.label}
                color={diff.color}
                size="small"
                sx={{ mr: 2 }}
              />
              {diff.description}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

DifficultySelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  startAdornment: PropTypes.node,
};

export default DifficultySelect;
