import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User } from 'lucide-react';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorButton } from '../components/DoctorButton';
import { DoctorBadge } from '../components/DoctorBadge';
import { SkeletonList, SkeletonText } from '../../shared/components/skeleton';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
  appointmentCount: number;
}

const DoctorPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Extract unique patients from appointments
        const appointmentsData = response.data;
        const patientsMap = new Map<string, Patient>();

        appointmentsData.forEach((appointment: any) => {
          // Skip appointments with null or undefined patientId
          if (!appointment.patientId) {
            return;
          }
          
          const patientId = appointment.patientId._id;
          const patientName = appointment.patientId.name;
          const patientEmail = appointment.patientId.email;

          if (patientsMap.has(patientId)) {
            const existingPatient = patientsMap.get(patientId)!;
            existingPatient.appointmentCount += 1;

            // Update last visit if this appointment is more recent
            const appointmentDate = new Date(appointment.date);
            const lastVisitDate = existingPatient.lastVisit ? new Date(existingPatient.lastVisit) : new Date(0);
            if (appointmentDate > lastVisitDate) {
              existingPatient.lastVisit = appointment.date;
            }
          } else {
            patientsMap.set(patientId, {
              _id: patientId,
              name: patientName,
              email: patientEmail,
              lastVisit: appointment.date,
              appointmentCount: 1
            });
          }
        });

        setPatients(Array.from(patientsMap.values()));
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <DoctorLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <SkeletonText variant="h1" width="300px" className="mb-2" />
            <SkeletonText variant="body" width="400px" />
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
            <SkeletonText variant="body" width="300px" height="40px" />
          </div>

          {/* Patients List */}
          <SkeletonList
            variant="patient"
            items={8}
            withActions={true}
            withStatus={true}
          />
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="text-red-500 text-center p-8">
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700"
          >
            Retry
          </button>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Patients</h1>
          <p className="text-gray-600 mt-2">
            Patients who have appointments with you ({patients.length} total)
          </p>
        </div>

        <DoctorCard>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="border border-gray-200 rounded-md overflow-hidden hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                    <DoctorBadge variant="info">
                      {patient.appointmentCount} visits
                    </DoctorBadge>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Total Appointments:</span>
                      <span className="font-medium text-gray-900">{patient.appointmentCount}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Last Visit:</span>
                      <span className="font-medium text-gray-900">
                        {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                      <DoctorButton variant="outline" size="sm">
                        View History
                      </DoctorButton>
                      <DoctorButton variant="primary" size="sm">
                        Add Prescription
                      </DoctorButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-gray-500">
                {patients.length === 0 ? 'No patients found. Patients will appear here after they book appointments with you.' : 'No patients found matching your search criteria'}
              </div>
            )}
          </div>
        </DoctorCard>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatients;
