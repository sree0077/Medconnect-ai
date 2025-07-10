import React from 'react';
import { DoctorSkeletonStatCard } from './DoctorSkeletonStatCard';
import { PatientSkeletonStatCard } from './PatientSkeletonStatCard';
import { AdminSkeletonStatCard } from './AdminSkeletonStatCard';
import { SkeletonTable } from './SkeletonTable';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonText } from './SkeletonText';

interface SkeletonDashboardProps {
  type: 'doctor' | 'patient' | 'admin';
  className?: string;
}

export const SkeletonDashboard: React.FC<SkeletonDashboardProps> = ({
  type,
  className = ''
}) => {
  const getStatCardComponent = () => {
    switch (type) {
      case 'doctor':
        return DoctorSkeletonStatCard;
      case 'patient':
        return PatientSkeletonStatCard;
      case 'admin':
        return AdminSkeletonStatCard;
      default:
        return DoctorSkeletonStatCard;
    }
  };

  const StatCardComponent = getStatCardComponent();

  const getDashboardTitle = () => {
    switch (type) {
      case 'doctor':
        return 'Doctor Dashboard';
      case 'patient':
        return 'Patient Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <SkeletonText variant="h1" width="300px" className="mb-2" />
        <SkeletonText variant="body" width="400px" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardComponent key={`stat-${index}`} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile/Info Card */}
        <div className="bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="ml-4 flex-1">
              <SkeletonText variant="h4" width="150px" className="mb-1" />
              <SkeletonText variant="caption" width="200px" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`profile-field-${index}`}>
                <SkeletonText variant="caption" width="80px" className="mb-1" />
                <SkeletonText variant="body" width="120px" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="ml-4">
              <SkeletonText variant="h4" width="120px" className="mb-1" />
              <SkeletonText variant="caption" width="180px" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`action-${index}`} className="p-4 border border-purple-200 dark:border-primary-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-purple-200 dark:bg-primary-700 rounded mr-3"></div>
                  <div className="flex-1">
                    <SkeletonText variant="body" width="100px" className="mb-1" />
                    <SkeletonText variant="caption" width="80px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <SkeletonTable
        rows={6}
        columns={4}
        withHeader={true}
        withActions={true}
        columnWidths={['2fr', '1fr', '1.5fr', '1fr', '100px']}
      />
    </div>
  );
};

export default SkeletonDashboard;
