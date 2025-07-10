import React, { ReactNode } from 'react';

interface PatientCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          {icon && <div className="text-purple-600">{icon}</div>}
          {title && <h3 className="font-medium text-gray-800">{title}</h3>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
