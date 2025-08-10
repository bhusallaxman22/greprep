import React from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

const GradientText = ({
  children,
  variant = "h3",
  gutterBottom = false,
  fromColor,
  toColor,
  sx = {},
}) => {
  const theme = useTheme();
  const primaryColor = fromColor || theme.palette.primary.main;
  const secondaryColor = toColor || theme.palette.secondary.main;

  return (
    <Typography
      variant={variant}
      gutterBottom={gutterBottom}
      sx={{
        fontWeight: "bold",
        background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

GradientText.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  gutterBottom: PropTypes.bool,
  fromColor: PropTypes.string,
  toColor: PropTypes.string,
  sx: PropTypes.object,
};

export default GradientText;
