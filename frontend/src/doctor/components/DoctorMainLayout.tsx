import React, { ReactNode } from 'react';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';

interface DoctorMainLayoutProps {
  children: ReactNode;
  doctorName?: string;
}

const DoctorMainLayout: React.FC<DoctorMainLayoutProps> = ({ children, doctorName }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar doctorName={doctorName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader doctorName={doctorName} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorMainLayout;
