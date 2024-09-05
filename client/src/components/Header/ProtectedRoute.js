// ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  let location = useLocation();

  return (
    isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} />
  );
};

export default ProtectedRoute;
