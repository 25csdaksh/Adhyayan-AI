import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen } from 'lucide-react';
import { Loader } from '../common/Loader';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8F6] p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#1F5E4B] text-white flex items-center justify-center shadow-md animate-pulse">
          <BookOpen className="w-6 h-6" />
        </div>
        <Loader size="md" text="Verifying Adhyayan-AI secure session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return <Outlet />;
};
