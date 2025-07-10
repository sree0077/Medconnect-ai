import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonAvatar } from './SkeletonAvatar';

interface SkeletonHeaderProps {
  className?: string;
  withSearch?: boolean;
  withNotifications?: boolean;
  withProfile?: boolean;
  withThemeToggle?: boolean;
}

export const SkeletonHeader: React.FC<SkeletonHeaderProps> = ({
  className = '',
  withSearch = true,
  withNotifications = true,
  withProfile = true,
  withThemeToggle = true
}) => {
  return (
    <header className={`bg-background shadow-sm border-b border-border px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <SkeletonBase 
            width="20px" 
            height="20px" 
            rounded="sm" 
            className="lg:hidden" 
          />

          {/* Search bar */}
          {withSearch && (
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SkeletonBase width="16px" height="16px" rounded="sm" />
                </div>
                <SkeletonBase 
                  width="320px" 
                  height="40px" 
                  rounded="lg" 
                  className="pl-10" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          {withThemeToggle && (
            <SkeletonBase width="32px" height="32px" rounded="full" />
          )}

          {/* Notifications */}
          {withNotifications && (
            <div className="relative">
              <SkeletonBase width="32px" height="32px" rounded="full" />
              {/* Notification badge */}
              <SkeletonBase 
                width="8px" 
                height="8px" 
                rounded="full" 
                className="absolute -top-1 -right-1 bg-red-400" 
              />
            </div>
          )}

          {/* Profile dropdown */}
          {withProfile && (
            <div className="flex items-center space-x-2">
              <SkeletonAvatar size="sm" />
              <div className="hidden md:block">
                <SkeletonBase width="80px" height="16px" rounded="sm" />
              </div>
              <SkeletonBase width="16px" height="16px" rounded="sm" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SkeletonHeader;
