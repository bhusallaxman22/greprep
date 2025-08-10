import React from "react";
import { Button, CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  variant = "contained",
  size = "medium",
  startIcon,
  endIcon,
  sx = {},
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={onClick}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        position: "relative",
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: "-10px",
            marginTop: "-10px",
            color: variant === "contained" ? "white" : "primary.main",
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>{children}</span>
    </Button>
  );
};

LoadingButton.propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  sx: PropTypes.object,
};

export default LoadingButton;
