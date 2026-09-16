import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'accent', className }) => {
  const variants = {
    accent: 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30',
    emerald: 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30',
    muted: 'bg-brand-card text-brand-muted border border-brand-border',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
