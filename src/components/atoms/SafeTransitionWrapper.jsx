import React from "react";
import PropTypes from "prop-types";

/**
 * SafeTransitionWrapper - Prevents transition errors by ensuring proper DOM structure
 */
const SafeTransitionWrapper = ({ children }) => {
  return (
    <div style={{ minHeight: "1px", position: "relative" }}>{children}</div>
  );
};

SafeTransitionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SafeTransitionWrapper;
