import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          {icon && <div className="text-[#2563EB]">{icon}</div>}
          {title && <h3 className="font-medium text-gray-800">{title}</h3>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;
