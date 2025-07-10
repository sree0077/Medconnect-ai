import React, { useState } from 'react';
import {
  SkeletonBase,
  SkeletonText,
  SkeletonButton,
  SkeletonInput,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonIcon,
  SkeletonForm,
  SkeletonList,
  SkeletonSidebar,
  SkeletonHeader,
  SkeletonDashboard,
  SkeletonLayout,
  SkeletonNotification,
  SkeletonChart,
  SkeletonChat,
  DoctorSkeletonStatCard,
  PatientSkeletonStatCard,
  AdminSkeletonStatCard
} from './index';

interface SkeletonDemoProps {
  className?: string;
}

export const SkeletonDemo: React.FC<SkeletonDemoProps> = ({ className = '' }) => {
  const [selectedDemo, setSelectedDemo] = useState<string>('basic');

  const demos = [
    { id: 'basic', label: 'Basic Components' },
    { id: 'forms', label: 'Forms & Inputs' },
    { id: 'tables', label: 'Tables & Lists' },
    { id: 'dashboards', label: 'Dashboard Components' },
    { id: 'layouts', label: 'Layout Components' },
    { id: 'complex', label: 'Complex Components' }
  ];

  const renderBasicComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Text Components</h3>
        <div className="space-y-4">
          <SkeletonText variant="h1" width="300px" />
          <SkeletonText variant="h2" width="250px" />
          <SkeletonText variant="body" lines={3} />
          <SkeletonText variant="caption" width="150px" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Buttons & Icons</h3>
        <div className="flex items-center space-x-4">
          <SkeletonButton variant="primary" />
          <SkeletonButton variant="secondary" />
          <SkeletonButton variant="small" />
          <SkeletonAvatar size="sm" />
          <SkeletonAvatar size="md" />
          <SkeletonAvatar size="lg" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Base Components</h3>
        <div className="flex items-center space-x-4">
          <SkeletonBase width="100px" height="60px" rounded="lg" />
          <SkeletonBase width="80px" height="80px" rounded="full" />
          <SkeletonBase width="120px" height="40px" rounded="xl" />
        </div>
      </div>
    </div>
  );

  const renderFormComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Input Components</h3>
        <div className="space-y-4">
          <SkeletonInput withLabel={true} />
          <SkeletonInput variant="select" withLabel={true} />
          <SkeletonInput variant="textarea" withLabel={true} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Complete Forms</h3>
        <SkeletonForm 
          fields={6} 
          withTitle={true} 
          withSubtitle={true} 
          layout="grid"
          columns={2}
        />
      </div>
    </div>
  );

  const renderTableComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Tables</h3>
        <SkeletonTable
          rows={5}
          columns={4}
          withHeader={true}
          withActions={true}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lists</h3>
        <SkeletonList variant="appointment" items={4} withActions={true} />
      </div>
    </div>
  );

  const renderDashboardComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Stat Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DoctorSkeletonStatCard />
          <PatientSkeletonStatCard />
          <AdminSkeletonStatCard />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Charts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonChart type="bar" withTitle={true} withLegend={true} />
          <SkeletonChart type="line" withTitle={true} />
        </div>
      </div>
    </div>
  );

  const renderLayoutComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Header</h3>
        <SkeletonHeader />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sidebar</h3>
        <div className="h-96 relative">
          <SkeletonSidebar type="doctor" isOpen={true} />
        </div>
      </div>
    </div>
  );

  const renderComplexComponents = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Chat Interface</h3>
        <SkeletonChat messages={4} withHeader={true} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <SkeletonNotification variant="dropdown" count={3} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Complete Dashboard</h3>
        <SkeletonDashboard type="doctor" />
      </div>
    </div>
  );

  const renderSelectedDemo = () => {
    switch (selectedDemo) {
      case 'basic':
        return renderBasicComponents();
      case 'forms':
        return renderFormComponents();
      case 'tables':
        return renderTableComponents();
      case 'dashboards':
        return renderDashboardComponents();
      case 'layouts':
        return renderLayoutComponents();
      case 'complex':
        return renderComplexComponents();
      default:
        return renderBasicComponents();
    }
  };

  return (
    <div className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
          Skeleton Loading Components Demo
        </h2>
        <p className="text-gray-600 dark:text-text-secondary">
          Interactive showcase of all available skeleton loading components
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 dark:bg-surface-secondary rounded-lg">
        {demos.map((demo) => (
          <button
            key={demo.id}
            onClick={() => setSelectedDemo(demo.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedDemo === demo.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary hover:bg-gray-200 dark:hover:bg-surface'
            }`}
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="min-h-[400px]">
        {renderSelectedDemo()}
      </div>
    </div>
  );
};

export default SkeletonDemo;
