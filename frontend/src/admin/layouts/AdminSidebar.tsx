import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Brain,
  CreditCard,
  UserCog,
  Settings,
  Shield,
  X,
  Activity
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Doctor Approvals', href: '/admin/doctors', icon: UserCheck },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Prescriptions', href: '/admin/prescriptions', icon: FileText },
  { name: 'AI Analytics', href: '/admin/analytics', icon: Brain },
  { name: 'Subscription Analytics', href: '/admin/subscription-analytics', icon: CreditCard },
  { name: 'Plan Management', href: '/admin/user-plan-management', icon: UserCog },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Security Logs', href: '/admin/security', icon: Shield },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
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
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border-r-2 border-white dark:bg-primary-200/20 dark:border-primary-200'
                    : 'text-purple-100 hover:text-white hover:bg-white/10 dark:text-primary-100 dark:hover:bg-primary-200/10'
                  }
                `}
                onClick={() => onClose()}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/30">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-purple-200 truncate">admin@medconnect.ai</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
