import React, { useState, memo, useCallback } from 'react';
import { PatientSidebar } from '../components/PatientSidebar';
import { PatientHeader } from '../components/PatientHeader';
import { PersistentLayout } from '../../shared/components/PersistentLayout';

interface PatientLayoutProps {
  children: React.ReactNode;
}

export const PatientLayout: React.FC<PatientLayoutProps> = memo(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <PersistentLayout className="h-screen bg-gray-50 dark:bg-background flex overflow-hidden">
      <PatientSidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientHeader onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </PersistentLayout>
  );
});

PatientLayout.displayName = 'PatientLayout';
