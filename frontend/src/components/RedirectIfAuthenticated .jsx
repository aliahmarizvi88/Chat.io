import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectIfAuthenticated = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;
