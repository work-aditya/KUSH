import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-brand-accent hover:bg-brand-accentHover text-black font-semibold shadow-lg shadow-brand-accent/20 focus:ring-brand-accent active:scale-[0.98]',
      emerald:
        'bg-brand-emerald hover:bg-brand-emeraldHover text-black font-semibold shadow-lg shadow-brand-emerald/20 focus:ring-brand-emerald active:scale-[0.98]',
      secondary:
        'bg-brand-card hover:bg-brand-surface text-brand-text border border-brand-border hover:border-brand-borderLight focus:ring-brand-border',
      outline:
        'border-2 border-brand-accent text-brand-accent hover:bg-brand-accent/10 focus:ring-brand-accent',
      ghost:
        'text-brand-muted hover:text-brand-text hover:bg-brand-card/50 focus:ring-brand-muted',
      danger:
        'bg-brand-danger hover:bg-red-600 text-white focus:ring-brand-danger',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
