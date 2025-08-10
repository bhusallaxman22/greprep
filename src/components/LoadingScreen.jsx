import React from 'react';
import LoadingSpinner from "./atoms/LoadingSpinner";

const LoadingScreen = ({ message = "Loading..." }) => (
  <LoadingSpinner message={message} />
);

export default LoadingScreen;
