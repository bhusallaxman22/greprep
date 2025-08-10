import React from "react";
import { Box, Button, Stack } from "@mui/material";
import PropTypes from "prop-types";
import LoadingButton from "../atoms/LoadingButton";

const ActionButtonGroup = ({
  primaryAction,
  secondaryActions = [],
  spacing = 2,
  direction = "column",
  sx = {},
}) => {
  return (
    <Stack spacing={spacing} sx={{ mt: 4, ...sx }}>
      {primaryAction && (
        <LoadingButton
          variant="contained"
          size="large"
          loading={primaryAction.loading}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          sx={{ py: 1.5, borderRadius: 2, ...primaryAction.sx }}
        >
          {primaryAction.label}
        </LoadingButton>
      )}
      {secondaryActions.length > 0 && (
        <Stack
          direction={direction === "column" ? "row" : "column"}
          spacing={spacing}
        >
          {secondaryActions.map((action, index) => (
            <LoadingButton
              key={action.key || index}
              variant="outlined"
              loading={action.loading}
              onClick={action.onClick}
              disabled={action.disabled}
              sx={{
                flex: direction === "column" ? 1 : undefined,
                py: 1.5,
                borderRadius: 2,
                ...action.sx,
              }}
            >
              {action.label}
            </LoadingButton>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

ActionButtonGroup.propTypes = {
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    sx: PropTypes.object,
  }),
  secondaryActions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      loading: PropTypes.bool,
      sx: PropTypes.object,
    })
  ),
  spacing: PropTypes.number,
  direction: PropTypes.oneOf(["row", "column"]),
  sx: PropTypes.object,
};

export default ActionButtonGroup;
