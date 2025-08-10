import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const EmptyState = ({
  message,
  variant = "h6",
  color = "text.secondary",
  sx = {},
}) => {
  return (
    <Box sx={{ textAlign: "center", ...sx }}>
      <Typography variant={variant} color={color}>
        {message}
      </Typography>
    </Box>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.string,
  color: PropTypes.string,
  sx: PropTypes.object,
};

export default EmptyState;
