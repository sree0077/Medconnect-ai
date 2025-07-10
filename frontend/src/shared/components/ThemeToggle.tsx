import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../shared/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: {
      container: 'w-10 h-5',
      toggle: 'w-4 h-4',
      translate: 'translate-x-5',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'w-12 h-6',
      toggle: 'w-5 h-5',
      translate: 'translate-x-6',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'w-14 h-7',
      toggle: 'w-6 h-6',
      translate: 'translate-x-7',
      icon: 'w-5 h-5'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-text-secondary">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex ${sizes.container} items-center rounded-full 
          transition-colors duration-300 ease-in-out focus:outline-none 
          focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${theme === 'dark' 
            ? 'bg-primary-600 hover:bg-primary-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
        `}
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {/* Toggle Circle */}
        <span
          className={`
            ${sizes.toggle} inline-block rounded-full bg-white shadow-lg 
            transform transition-transform duration-300 ease-in-out
            flex items-center justify-center
            ${theme === 'dark' ? sizes.translate : 'translate-x-0.5'}
          `}
        >
          {/* Icon */}
          {theme === 'light' ? (
            <Sun className={`${sizes.icon} text-yellow-500 transition-opacity duration-300`} />
          ) : (
            <Moon className={`${sizes.icon} text-purple-600 transition-opacity duration-300`} />
          )}
        </span>

        {/* Background Icons */}
        <span className="absolute inset-0 flex items-center justify-between px-1">
          <Sun 
            className={`
              ${sizes.icon} text-yellow-400 transition-opacity duration-300
              ${theme === 'light' ? 'opacity-0' : 'opacity-60'}
            `} 
          />
          <Moon 
            className={`
              ${sizes.icon} text-purple-300 transition-opacity duration-300
              ${theme === 'dark' ? 'opacity-0' : 'opacity-60'}
            `} 
          />
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;
