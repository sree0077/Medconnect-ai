import React from 'react';
import { Calendar, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Book New Appointment',
      description: 'Schedule a visit with your doctor',
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      link: '/book-appointment',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Run Symptom Checker',
      description: 'AI-powered health assessment',
      icon: <Activity className="h-8 w-8 text-green-600" />,
      link: '/symptom-checker',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Start AI Consultation',
      description: 'Chat with our medical AI assistant',
      icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
      link: '/ai-consultation',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      borderColor: 'border-purple-200'
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={index}
            to={action.link}
            className={`${action.bgColor} ${action.hoverColor} border ${action.borderColor} rounded-lg p-4 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md`}
          >
            <div className="rounded-full p-3 mb-3">
              {action.icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
