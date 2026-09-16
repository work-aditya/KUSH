import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, Dumbbell } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-center text-brand-accent mx-auto">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white">404</h1>
        <p className="text-sm text-brand-muted">
          Looks like this page took a rest day. The route you are looking for does not exist.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};
