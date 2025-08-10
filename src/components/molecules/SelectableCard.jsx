import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@mui/material";

function SelectableCard({
  selected,
  onClick,
  title,
  description,
  icon,
  center = false,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        cursor: "pointer",
        border: selected ? 2 : 1,
        borderColor: selected ? "primary.main" : "divider",
        "&:hover": { borderColor: "primary.main" },
        height: "100%",
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: center ? "center" : "left" }}>
        {icon && (
          <Typography variant="h3" sx={{ mb: 1 }}>
            {icon}
          </Typography>
        )}
        <Typography variant="h5" color="primary" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

SelectableCard.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  center: PropTypes.bool,
};

export default SelectableCard;
