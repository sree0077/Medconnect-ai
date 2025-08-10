import React, { ReactNode } from 'react';

interface FormButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const FormButton: React.FC<FormButtonProps> = ({
  type = 'button',
  children,
  variant = 'primary',
  fullWidth = true,
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  const baseClasses = "py-3 px-6 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg focus:ring-primary/50 dark:bg-primary-500 dark:hover:bg-primary-600",
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg focus:ring-secondary/50 dark:bg-secondary-500 dark:hover:bg-secondary-600",
    outline: "bg-transparent text-primary border border-primary hover:bg-primary/5 focus:ring-primary/30 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-900/20",
  };

  const widthClasses = fullWidth ? "w-full" : "";
  const disabledClasses = disabled ? "opacity-70 cursor-not-allowed" : "";
  const submitClasses = type === 'submit' ? "submit-btn" : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${submitClasses}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default FormButton;
