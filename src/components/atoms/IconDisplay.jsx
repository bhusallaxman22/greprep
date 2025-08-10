import React from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";

const IconDisplay = ({ icon, size = 80, color = "primary", sx = {} }) => {
  const IconComponent = icon;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <IconComponent
        sx={{
          fontSize: size,
          color: `${color}.main`,
        }}
      />
    </Box>
  );
};

IconDisplay.propTypes = {
  icon: PropTypes.elementType.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  sx: PropTypes.object,
};

export default IconDisplay;
