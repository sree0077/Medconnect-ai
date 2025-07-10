import React, { useState, useEffect } from 'react';
import { Menu, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../../shared/components/NotificationCenter';
import useNotifications from '../../shared/hooks/useNotifications';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { useAuth } from '../../shared/contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
    refreshNotifications
  } = useNotifications();

  // Get admin name from auth context or use default
  const adminName = user?.name || 'Admin User';

  // Load notifications from server on component mount
  useEffect(() => {
    // Notifications are loaded by the useNotifications hook
    // No need to add demo notifications
  }, []);

  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 dark:bg-surface dark:border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-text-muted dark:hover:text-text-secondary dark:hover:bg-surface-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search users, doctors, appointments..."
                className="pl-10 pr-4 py-2 w-80 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:border-border dark:focus:ring-primary-500 dark:bg-surface dark:text-text-primary dark:placeholder-text-muted"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle size="sm" />

          {/* Notifications */}
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismissNotification}
          />

          {/* Profile dropdown */}
          <div className="relative z-50">
            <button
              className="flex items-center text-gray-700 hover:text-purple-600 dark:text-text-secondary dark:hover:text-primary-400"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">{adminName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden md:block ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-text-primary">{adminName}</p>
                <p className="text-xs text-gray-500 dark:text-text-muted">System Administrator</p>
              </div>
              <ChevronDown size={16} className="ml-1" />
            </button>

            {showProfileMenu && (
              <>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:bg-surface dark:border-border">
                  <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-text-secondary dark:hover:bg-surface-secondary">
                    <User size={16} className="mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/settings');
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-text-secondary dark:hover:bg-surface-secondary"
                  >
                    <Settings size={16} className="mr-2" />
                    System Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-border my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-surface-secondary"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
                
                {/* Overlay to close dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
