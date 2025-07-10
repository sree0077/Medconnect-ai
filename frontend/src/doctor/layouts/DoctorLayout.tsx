import React, { useState, memo, useCallback } from 'react';
import { DoctorSidebar } from '../components/DoctorSidebar';
import { DoctorHeader } from '../components/DoctorHeader';
import { PersistentLayout } from '../../shared/components/PersistentLayout';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = memo(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <PersistentLayout className="h-screen bg-gray-50 dark:bg-background flex overflow-hidden">
      <DoctorSidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </PersistentLayout>
  );
});

DoctorLayout.displayName = 'DoctorLayout';
