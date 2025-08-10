import React from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

function QuestionCountSelect({ value, onChange, counts, startAdornment }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Number of Questions</InputLabel>
      <Select
        value={value}
        label="Number of Questions"
        onChange={(e) => onChange(e.target.value)}
        startAdornment={startAdornment}
      >
        {counts.map((count) => (
          <MenuItem key={count} value={count}>
            {count} questions
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

QuestionCountSelect.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  counts: PropTypes.arrayOf(PropTypes.number).isRequired,
  startAdornment: PropTypes.node,
};

export default QuestionCountSelect;
