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

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const navigation: NavItem[] = [
    { name: 'Home', to: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Book Appointment', to: '/book-appointment', icon: <Calendar className="h-5 w-5" /> },
    { name: 'My Appointments', to: '/appointments', icon: <Clock className="h-5 w-5" /> },
    { name: 'My Prescriptions', to: '/prescriptions', icon: <FileText className="h-5 w-5" /> },
    { name: 'Symptom Checker', to: '/symptom-checker', icon: <Activity className="h-5 w-5" /> },
    { name: 'AI Consultation', to: '/ai-consultation', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Settings', to: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-blue-600 transform transition-transform ease-in-out duration-300 md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-500">
          <Link to="/dashboard" className="flex items-center text-white font-bold text-xl">
            <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            MedConnect AI
          </Link>
          <button 
            className="md:hidden text-white hover:text-blue-200 focus:outline-none"
            onClick={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="py-4 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-blue-200'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {item.name === 'Symptom Checker' && (
                    <span className="ml-auto bg-white text-blue-600 text-xs py-0.5 px-1.5 rounded-full">
                      AI
                    </span>
                  )}
                  {item.name === 'AI Consultation' && (
                    <span className="ml-auto bg-white text-blue-600 text-xs py-0.5 px-1.5 rounded-full">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
