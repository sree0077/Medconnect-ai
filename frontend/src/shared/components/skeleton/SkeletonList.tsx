import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';
import { SkeletonAvatar } from './SkeletonAvatar';

interface SkeletonListProps {
  className?: string;
  items?: number;
  variant?: 'simple' | 'detailed' | 'appointment' | 'patient' | 'notification';
  withAvatar?: boolean;
  withActions?: boolean;
  withStatus?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  className = '',
  items = 5,
  variant = 'simple',
  withAvatar = false,
  withActions = false,
  withStatus = false
}) => {
  const renderListItem = (index: number) => {
    switch (variant) {
      case 'appointment':
        return (
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-surface-secondary">
            <div className="flex items-center space-x-4 flex-1">
              <SkeletonAvatar size="md" />
              <div className="flex-1">
                <SkeletonText variant="body" width="150px" className="mb-1" />
                <SkeletonText variant="caption" width="100px" className="mb-1" />
                <SkeletonText variant="caption" width="80px" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SkeletonBase width="60px" height="24px" rounded="full" />
              {withActions && (
                <div className="flex space-x-2">
                  <SkeletonBase width="24px" height="24px" rounded="sm" />
                  <SkeletonBase width="24px" height="24px" rounded="sm" />
                </div>
              )}
            </div>
          </div>
        );

      case 'patient':
        return (
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-surface-secondary">
            <div className="flex items-center space-x-4 flex-1">
              <SkeletonAvatar size="md" />
              <div className="flex-1">
                <SkeletonText variant="body" width="120px" className="mb-1" />
                <SkeletonText variant="caption" width="180px" className="mb-1" />
                <div className="flex items-center space-x-4">
                  <SkeletonText variant="caption" width="60px" />
                  <SkeletonText variant="caption" width="80px" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SkeletonBase width="70px" height="24px" rounded="full" />
              {withActions && (
                <SkeletonBase width="80px" height="32px" rounded="md" />
              )}
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-surface-secondary">
            <SkeletonBase width="8px" height="8px" rounded="full" className="mt-2" />
            <div className="flex-1">
              <SkeletonText variant="body" width="200px" className="mb-1" />
              <SkeletonText variant="caption" width="300px" className="mb-2" />
              <SkeletonText variant="caption" width="80px" />
            </div>
            {withActions && (
              <SkeletonBase width="20px" height="20px" rounded="sm" />
            )}
          </div>
        );

      case 'detailed':
        return (
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-surface-secondary">
            <div className="flex items-center space-x-4 flex-1">
              {withAvatar && <SkeletonAvatar size="sm" />}
              <div className="flex-1">
                <SkeletonText variant="body" width="160px" className="mb-1" />
                <SkeletonText variant="caption" width="220px" className="mb-1" />
                <div className="flex items-center space-x-2">
                  <SkeletonBase width="12px" height="12px" rounded="full" />
                  <SkeletonText variant="caption" width="100px" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {withStatus && <SkeletonBase width="60px" height="20px" rounded="full" />}
              {withActions && <SkeletonBase width="24px" height="24px" rounded="sm" />}
            </div>
          </div>
        );

      default: // simple
        return (
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-surface-secondary">
            <div className="flex items-center space-x-3 flex-1">
              {withAvatar && <SkeletonAvatar size="sm" />}
              <SkeletonText variant="body" width={`${120 + Math.random() * 80}px`} />
            </div>
            {withActions && (
              <SkeletonBase width="20px" height="20px" rounded="sm" />
            )}
          </div>
        );
    }
  };

  return (
    <div className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border overflow-hidden ${className}`}>
      <div className="divide-y divide-gray-200 dark:divide-border">
        {Array.from({ length: items }).map((_, index) => (
          <div key={`list-item-${index}`}>
            {renderListItem(index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonList;
