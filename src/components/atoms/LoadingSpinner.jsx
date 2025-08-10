import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({
  message = "Loading...",
  size = 60,
  minHeight = "60vh",
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight,
      gap: 2,
    }}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

export default LoadingSpinner;
