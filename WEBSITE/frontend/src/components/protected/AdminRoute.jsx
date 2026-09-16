import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-sm text-brand-muted">Authenticating privileges...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center space-y-5 border border-red-500/20">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">403 - Forbidden</h1>
          <p className="text-sm text-brand-muted leading-relaxed">
            Access denied. You do not possess administrator credentials to access the CoachKush administrative portal.
          </p>
          <Link to="/">
            <Button variant="secondary" size="md" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Website
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
