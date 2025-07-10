import React from 'react';
import { SkeletonSidebar } from './SkeletonSidebar';
import { SkeletonHeader } from './SkeletonHeader';

interface SkeletonLayoutProps {
  type: 'doctor' | 'patient' | 'admin';
  children?: React.ReactNode;
  className?: string;
}

export const SkeletonLayout: React.FC<SkeletonLayoutProps> = ({
  type,
  children,
  className = ''
}) => {
  return (
    <div className={`h-screen bg-gray-50 dark:bg-background flex overflow-hidden ${className}`}>
      <SkeletonSidebar type={type} isOpen={true} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SkeletonHeader 
          withSearch={true}
          withNotifications={true}
          withProfile={true}
          withThemeToggle={true}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SkeletonLayout;
