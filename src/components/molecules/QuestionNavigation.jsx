import React from "react";
import PropTypes from "prop-types";
import { Box, Button } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  SkipNext as SkipNextIcon,
} from "@mui/icons-material";
import LoadingButton from "../atoms/LoadingButton";

const QuestionNavigation = ({
  isFirst,
  isLast,
  onPrevious,
  onNext,
  onFinish,
  isNextLoading = false,
  isFinishLoading = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 4,
        gap: 2,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onPrevious}
        disabled={isFirst}
        sx={{ py: 1.5, px: 3, borderRadius: 2 }}
      >
        Previous
      </Button>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<SkipNextIcon />}
          onClick={onNext}
          disabled={isLast}
          sx={{ py: 1.5, px: 2, borderRadius: 2 }}
        >
          Skip
        </Button>
        {isLast ? (
          <LoadingButton
            variant="contained"
            loading={isFinishLoading}
            onClick={onFinish}
            sx={{ py: 1.5, px: 4, borderRadius: 2 }}
          >
            Finish Test
          </LoadingButton>
        ) : (
          <LoadingButton
            variant="contained"
            loading={isNextLoading}
            endIcon={<ArrowForwardIcon />}
            onClick={onNext}
            sx={{ py: 1.5, px: 4, borderRadius: 2 }}
          >
            Next
          </LoadingButton>
        )}
      </Box>
    </Box>
  );
};

QuestionNavigation.propTypes = {
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  isNextLoading: PropTypes.bool,
  isFinishLoading: PropTypes.bool,
};

export default QuestionNavigation;
