import React from "react";
import { Container } from "@mui/material";
import PropTypes from "prop-types";

const TestCompletionTemplate = ({
  children,
  maxWidth = "md",
  sx = { mt: 4 },
}) => {
  return (
    <Container maxWidth={maxWidth} sx={sx}>
      {children}
    </Container>
  );
};

TestCompletionTemplate.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  sx: PropTypes.object,
};

export default TestCompletionTemplate;
