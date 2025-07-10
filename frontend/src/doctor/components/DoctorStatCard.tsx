import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DoctorStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export const DoctorStatCard: React.FC<DoctorStatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-purple-600'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getIconBg = () => {
    if (iconColor.includes('purple')) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (iconColor.includes('green')) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (iconColor.includes('blue')) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (iconColor.includes('teal')) return 'bg-gradient-to-r from-teal-500 to-cyan-500';
    return 'bg-gradient-to-r from-purple-500 to-pink-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 dark:bg-surface dark:border-border dark:shadow-2xl">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${getIconBg()}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-text-muted truncate">{title}</dt>
            <dd className="text-2xl font-bold text-gray-900 dark:text-text-primary">{value}</dd>
          </dl>
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 dark:text-text-muted ml-2">from last month</span>
          </div>
        </div>
      )}
    </div>
  );
};
