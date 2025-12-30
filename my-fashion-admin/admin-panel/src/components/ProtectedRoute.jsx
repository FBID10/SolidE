import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  // Show a loading message while the context is verifying the token.
  // This prevents a "flicker" to the login page on a refresh.
  if (loading) {
    return <div>Loading session...</div>;
  }

  // If loading is complete and the user is authenticated, show the requested page.
  // The <Outlet /> component renders the nested child route (e.g., DashboardPage).
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect the user to the login page.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;