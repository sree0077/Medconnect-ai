import React, { useState, memo, useCallback } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { PersistentLayout } from '../../shared/components/PersistentLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = memo(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);

  return (
    <PersistentLayout className="h-screen bg-gray-50 dark:bg-background flex overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </PersistentLayout>
  );
});

AdminLayout.displayName = 'AdminLayout';
