import React, { memo } from 'react';

interface PersistentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Memoized layout component to prevent unnecessary re-renders
export const PersistentLayout: React.FC<PersistentLayoutProps> = memo(({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`page-container min-h-screen ${className}`}>
      {children}
    </div>
  );
});

PersistentLayout.displayName = 'PersistentLayout';

export default PersistentLayout;
