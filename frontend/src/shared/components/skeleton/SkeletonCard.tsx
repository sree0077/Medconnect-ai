import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

interface SkeletonCardProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  withHeader?: boolean;
  withContent?: boolean;
  withFooter?: boolean;
  contentLines?: number;
  padding?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  width = '100%',
  height,
  withHeader = true,
  withContent = true,
  withFooter = false,
  contentLines = 3,
  padding = 'p-6'
}) => {
  return (
    <div 
      className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border ${padding} ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height 
      }}
    >
      <div className="space-y-4">
        {withHeader && (
          <div className="flex items-center space-x-4">
            <SkeletonBase
              width="48px"
              height="48px"
              rounded="lg"
            />
            <div className="flex-1 space-y-2">
              <SkeletonText variant="h4" width="60%" />
              <SkeletonText variant="caption" width="40%" />
            </div>
          </div>
        )}
        
        {withContent && (
          <div className="space-y-3">
            <SkeletonText lines={contentLines} />
          </div>
        )}
        
        {withFooter && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-border">
            <SkeletonText variant="caption" width="30%" />
            <SkeletonBase width="80px" height="32px" rounded="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkeletonCard;
