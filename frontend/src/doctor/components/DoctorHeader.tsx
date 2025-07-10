import React, { useState, useEffect } from 'react';
import { Menu, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DoctorNotificationCenter } from './DoctorNotificationCenter';
import useNotifications from '../../shared/hooks/useNotifications';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { useAuth } from '../../shared/contexts/AuthContext';

interface DoctorHeaderProps {
  onMenuClick: () => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({ onMenuClick }) => {
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

  // Get doctor name from auth context or use default
  const doctorName = user?.name || 'Doctor User';

  // Load notifications from server on component mount
  useEffect(() => {
    // Notifications are loaded by the useNotifications hook
    // No need to add demo notifications
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-background shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search patients, appointments..."
                className="pl-10 pr-4 py-2 w-80 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-background text-text-primary placeholder-text-muted"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle size="sm" />

          {/* Notifications */}
          <DoctorNotificationCenter
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismissNotification}
          />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary focus:outline-none"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-pink-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {doctorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-text-secondary">Dr. {doctorName}</span>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>

            {showProfileMenu && (
              <>
                <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg py-1 z-50 border border-border">
                  <button className="flex w-full items-center px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary">
                    <User size={16} className="mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/doctor/settings');
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary"
                  >
                    <Settings size={16} className="mr-2" />
                    Account Settings
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-surface-secondary"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
