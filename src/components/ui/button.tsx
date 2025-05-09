import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'default', 
    size = 'md', 
    isLoading = false,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:opacity-50 disabled:pointer-events-none",
          
          // Variant styles
          variant === 'default' && 
            "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === 'outline' && 
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === 'ghost' && 
            "hover:bg-accent hover:text-accent-foreground",
          variant === 'link' && 
            "text-primary underline-offset-4 hover:underline",
          variant === 'destructive' && 
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          
          // Size styles
          size === 'sm' && "h-8 px-3 text-xs",
          size === 'md' && "h-10 px-4 py-2",
          size === 'lg' && "h-12 px-6 py-3 text-base",
          size === 'icon' && "h-9 w-9",
          
          className
        )}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;