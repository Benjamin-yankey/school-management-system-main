import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign-in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.role)) {
      // Redirect to user's dashboard if they don't have required role
      const userRole = user?.role;
      if (userRole === "superadmin") {
        return <Navigate to="/superadmin" replace />;
      } else if (userRole) {
        // Handle special mapping for administration -> admin if needed
        const dashboardPrefix = userRole === "administration" ? "admin" : userRole;
        return <Navigate to={`/${dashboardPrefix}/dashboard`} replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
