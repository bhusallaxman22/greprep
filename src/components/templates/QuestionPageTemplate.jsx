import React from "react";
import { Container } from "@mui/material";
import PropTypes from "prop-types";

const QuestionPageTemplate = ({
  children,
  maxWidth = "lg",
  sx = { py: 3 },
}) => {
  return (
    <Container maxWidth={maxWidth} sx={sx}>
      {children}
    </Container>
  );
};

QuestionPageTemplate.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  sx: PropTypes.object,
};

export default QuestionPageTemplate;
