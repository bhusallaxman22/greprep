import React from "react";
import QuestionPage from "./pages/QuestionPage";

// Temporary wrapper component for backward compatibility
// TODO: Replace all usages with QuestionPage directly and remove this file
const QuestionDisplay = (props) => {
  return <QuestionPage {...props} />;
};

export default QuestionDisplay;
