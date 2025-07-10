import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { DoctorButton } from '../../doctor/components/DoctorButton';
import { PatientButton } from '../../patient/components/PatientButton';
import { DoctorStatCard } from '../../doctor/components/DoctorStatCard';
import { PatientStatCard } from '../../patient/components/PatientStatCard';
import { AdminStatCard } from '../../admin/components/AdminStatCard';
import { Users, Calendar, FileText, Activity, Heart, Clock } from 'lucide-react';

export const ThemeDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-text-primary">
            MedConnect AI Theme Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-text-secondary">
            Test the dark/light theme toggle functionality
          </p>
          <div className="flex justify-center">
            <ThemeToggle size="lg" showLabel />
          </div>
        </div>

        {/* Cards Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-text-primary">Stat Cards</h2>

          {/* Doctor Cards */}
          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-text-secondary mb-4">Doctor Dashboard Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DoctorStatCard
                title="Total Patients"
                value="1,234"
                change="+12%"
                changeType="increase"
                icon={Users}
                iconColor="text-purple-600"
              />
              <DoctorStatCard
                title="Appointments Today"
                value="24"
                change="+5%"
                changeType="increase"
                icon={Calendar}
                iconColor="text-green-600"
              />
              <DoctorStatCard
                title="Prescriptions"
                value="89"
                change="-2%"
                changeType="decrease"
                icon={FileText}
                iconColor="text-blue-600"
              />
            </div>
          </div>

          {/* Patient Cards */}
          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-text-secondary mb-4">Patient Dashboard Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PatientStatCard
                title="Health Score"
                value="92%"
                change="+3%"
                changeType="increase"
                icon={Heart}
                iconColor="text-purple-600"
              />
              <PatientStatCard
                title="Next Appointment"
                value="2 days"
                icon={Clock}
                iconColor="text-teal-600"
              />
              <PatientStatCard
                title="Active Prescriptions"
                value="3"
                icon={Activity}
                iconColor="text-green-600"
              />
            </div>
          </div>

          {/* Admin Cards */}
          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-text-secondary mb-4">Admin Dashboard Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AdminStatCard
                title="Total Users"
                value="5,678"
                change="+15%"
                changeType="increase"
                icon={Users}
                iconColor="text-purple-600"
              />
              <AdminStatCard
                title="System Health"
                value="99.9%"
                change="+0.1%"
                changeType="increase"
                icon={Activity}
                iconColor="text-green-600"
              />
              <AdminStatCard
                title="Daily Appointments"
                value="456"
                change="+8%"
                changeType="increase"
                icon={Calendar}
                iconColor="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-text-primary">Buttons</h2>

          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-text-secondary mb-4">Doctor Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <DoctorButton variant="primary">Primary Button</DoctorButton>
              <DoctorButton variant="secondary">Secondary Button</DoctorButton>
              <DoctorButton variant="outline">Outline Button</DoctorButton>
              <DoctorButton variant="ghost">Ghost Button</DoctorButton>
              <DoctorButton variant="danger">Danger Button</DoctorButton>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-text-secondary mb-4">Patient Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <PatientButton variant="primary">Primary Button</PatientButton>
              <PatientButton variant="secondary">Secondary Button</PatientButton>
              <PatientButton variant="outline">Outline Button</PatientButton>
              <PatientButton variant="ghost">Ghost Button</PatientButton>
              <PatientButton variant="danger">Danger Button</PatientButton>
            </div>
          </div>
        </div>

        {/* Sample Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-text-primary">Sample Content</h2>

          <div className="bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-text-primary mb-4">Card Example</h3>
            <p className="text-gray-600 dark:text-text-secondary mb-4">
              This is a sample card showing how content looks in both light and dark themes.
              The theme system automatically adjusts colors for optimal readability and
              maintains the purple theme consistency across all components.
            </p>
            <div className="flex space-x-4">
              <ThemeToggle size="sm" />
              <ThemeToggle size="md" />
              <ThemeToggle size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
