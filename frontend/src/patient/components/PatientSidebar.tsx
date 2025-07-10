import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  Clock,
  FileText,
  Activity,
  MessageSquare,
  Settings,
  X
} from 'lucide-react';

interface PatientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Book Appointment', href: '/book-appointment', icon: Calendar },
    { name: 'My Appointments', href: '/appointments', icon: Clock },
    { name: 'My Prescriptions', href: '/prescriptions', icon: FileText },
    { name: 'Symptom Checker', href: '/symptom-checker', icon: Activity },
    { name: 'AI Consultation', href: '/ai-consultation', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-purple-500/30 dark:border-primary-400/30">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">MedConnect AI</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-purple-200 hover:text-white hover:bg-purple-500/30 dark:text-primary-200 dark:hover:bg-primary-400/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-6">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-500/30 text-white shadow-lg dark:bg-primary-200/30'
                      : 'text-purple-100 hover:bg-purple-500/20 hover:text-white dark:text-primary-100 dark:hover:bg-primary-200/20'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-purple-200 group-hover:text-white dark:text-primary-200'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-purple-500/30 dark:border-primary-400/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/30 dark:bg-primary-200/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Patient Portal</p>
              <p className="text-xs text-purple-200 dark:text-primary-200">Healthcare Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
