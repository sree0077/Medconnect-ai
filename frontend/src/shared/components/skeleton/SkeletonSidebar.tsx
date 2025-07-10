import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

interface SkeletonSidebarProps {
  className?: string;
  type?: 'doctor' | 'patient' | 'admin';
  menuItems?: number;
  isOpen?: boolean;
}

export const SkeletonSidebar: React.FC<SkeletonSidebarProps> = ({
  className = '',
  type = 'doctor',
  menuItems = 5,
  isOpen = true
}) => {
  const getThemeClasses = () => {
    switch (type) {
      case 'doctor':
        return 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500';
      case 'patient':
        return 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500';
      case 'admin':
        return 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500';
      default:
        return 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 ${getThemeClasses()} shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-purple-500/30 dark:border-primary-400/30">
          <div className="flex items-center space-x-2">
            <SkeletonBase 
              width="32px" 
              height="32px" 
              rounded="sm" 
              className="bg-white/20" 
            />
            <SkeletonBase 
              width="140px" 
              height="20px" 
              rounded="sm" 
              className="bg-white/20" 
            />
          </div>
          <SkeletonBase 
            width="24px" 
            height="24px" 
            rounded="sm" 
            className="bg-white/20 lg:hidden" 
          />
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-6">
          <div className="space-y-1">
            {Array.from({ length: menuItems }).map((_, index) => (
              <div
                key={`menu-item-${index}`}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  index === 0 
                    ? 'bg-purple-500/30 dark:bg-primary-200/30' 
                    : 'hover:bg-purple-500/20 dark:hover:bg-primary-200/20'
                }`}
              >
                <SkeletonBase 
                  width="20px" 
                  height="20px" 
                  rounded="sm" 
                  className="bg-white/20 mr-3" 
                />
                <SkeletonBase 
                  width={`${80 + Math.random() * 40}px`} 
                  height="16px" 
                  rounded="sm" 
                  className="bg-white/20" 
                />
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-purple-500/30 dark:border-primary-400/30">
          <div className="flex items-center space-x-3">
            <SkeletonBase 
              width="40px" 
              height="40px" 
              rounded="full" 
              className="bg-purple-500/30 dark:bg-primary-200/30" 
            />
            <div className="flex-1">
              <SkeletonBase 
                width="100px" 
                height="14px" 
                rounded="sm" 
                className="bg-white/20 mb-1" 
              />
              <SkeletonBase 
                width="80px" 
                height="12px" 
                rounded="sm" 
                className="bg-white/20" 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkeletonSidebar;
