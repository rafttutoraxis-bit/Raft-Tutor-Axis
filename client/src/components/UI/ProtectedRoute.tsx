import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110d22] text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
        <p className="text-xs font-mono">Verifying Access Gatekeeper...</p>
      </div>
    );
  }

  // If user is logged in, verify allowed roles
  if (user) {
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // If user does not have permission, redirect to landing/root page
      return <Navigate to="/" replace />;
    }
  } else {
    // If not logged in, redirect to /admin/login
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
