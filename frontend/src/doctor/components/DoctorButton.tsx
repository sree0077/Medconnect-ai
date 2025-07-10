import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface DoctorButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const DoctorButton: React.FC<DoctorButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500 dark:from-primary-500 dark:to-pink-500 dark:hover:from-primary-600 dark:hover:to-pink-600',
    secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 focus:ring-purple-500 dark:from-primary-400 dark:to-primary-500 dark:hover:from-primary-500 dark:hover:to-primary-600',
    outline: 'border border-purple-300 text-purple-700 hover:bg-purple-50 focus:ring-purple-500 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-900/20 dark:focus:ring-primary-500',
    ghost: 'text-purple-700 hover:bg-purple-100 focus:ring-purple-500 dark:text-primary-300 dark:hover:bg-primary-900/20 dark:focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800',
  };
  
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
