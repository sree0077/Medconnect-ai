import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

interface SkeletonNotificationProps {
  className?: string;
  variant?: 'dropdown' | 'toast' | 'inline';
  count?: number;
}

export const SkeletonNotification: React.FC<SkeletonNotificationProps> = ({
  className = '',
  variant = 'dropdown',
  count = 3
}) => {
  if (variant === 'toast') {
    return (
      <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`toast-${index}`}
            className="bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg shadow-lg p-4 w-80"
          >
            <div className="flex items-start space-x-3">
              <SkeletonBase width="20px" height="20px" rounded="sm" />
              <div className="flex-1">
                <SkeletonText variant="body" width="200px" className="mb-1" />
                <SkeletonText variant="caption" width="150px" />
              </div>
              <SkeletonBase width="16px" height="16px" rounded="sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`inline-${index}`}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg"
          >
            <SkeletonBase width="8px" height="8px" rounded="full" />
            <div className="flex-1">
              <SkeletonText variant="body" width="250px" className="mb-1" />
              <SkeletonText variant="caption" width="100px" />
            </div>
            <SkeletonBase width="20px" height="20px" rounded="sm" />
          </div>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`bg-white dark:bg-surface rounded-lg shadow-lg border border-gray-200 dark:border-border w-80 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-border">
        <div className="flex items-center justify-between">
          <SkeletonText variant="h4" width="120px" />
          <SkeletonBase width="60px" height="20px" rounded="full" />
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`notification-${index}`}
            className="p-4 border-b border-gray-100 dark:border-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-surface-secondary"
          >
            <div className="flex items-start space-x-3">
              <SkeletonBase width="8px" height="8px" rounded="full" className="mt-2" />
              <div className="flex-1">
                <SkeletonText variant="body" width="200px" className="mb-1" />
                <SkeletonText variant="caption" width="180px" className="mb-2" />
                <SkeletonText variant="caption" width="80px" />
              </div>
              <SkeletonBase width="16px" height="16px" rounded="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-border">
        <SkeletonBase width="100%" height="32px" rounded="md" />
      </div>
    </div>
  );
};

export default SkeletonNotification;
