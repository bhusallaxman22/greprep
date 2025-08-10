import React from "react";
import PropTypes from "prop-types";
import { Grid, Chip } from "@mui/material";

function SummaryChips({ items }) {
  return (
    <Grid container spacing={2}>
      {items.map((item, idx) => (
        <Grid item key={idx}>
          <Chip
            label={item.label}
            color={item.color}
            variant={item.variant || "outlined"}
          />
        </Grid>
      ))}
    </Grid>
  );
}

SummaryChips.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      variant: PropTypes.oneOf(["filled", "outlined"]),
    })
  ).isRequired,
};

export default SummaryChips;
