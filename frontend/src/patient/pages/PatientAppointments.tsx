import React from 'react';
import { PatientLayout } from '../layouts/PatientLayout';
import PatientAppointmentsList from '../components/PatientAppointmentsList';

const PatientAppointments: React.FC = () => {
  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Appointments</h1>
          <p className="text-gray-600 mt-2">View and manage your upcoming and past appointments.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <PatientAppointmentsList />
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientAppointments;