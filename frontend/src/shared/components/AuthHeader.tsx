import React from 'react';
import { Link } from 'react-router-dom';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-text-primary mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-500 dark:text-text-secondary text-sm md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AuthHeader;
