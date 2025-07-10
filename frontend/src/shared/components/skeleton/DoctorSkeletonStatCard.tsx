import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

interface DoctorSkeletonStatCardProps {
  className?: string;
  withChange?: boolean;
}

export const DoctorSkeletonStatCard: React.FC<DoctorSkeletonStatCardProps> = ({
  className = '',
  withChange = true
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 dark:bg-surface dark:border-border dark:shadow-2xl ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {/* Icon placeholder with gradient background */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <SkeletonBase
              width="24px"
              height="24px"
              rounded="sm"
              className="bg-white/20"
            />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="space-y-2">
            {/* Title */}
            <SkeletonText 
              variant="caption" 
              width="70%" 
            />
            {/* Value */}
            <SkeletonText 
              variant="h3" 
              width="50%" 
            />
          </div>
        </div>
      </div>
      
      {withChange && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <SkeletonText 
              variant="caption" 
              width="40%" 
            />
            <SkeletonText 
              variant="caption" 
              width="60%" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSkeletonStatCard;
