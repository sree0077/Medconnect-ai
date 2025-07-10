import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Search, X } from 'lucide-react';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorButton } from '../components/DoctorButton';
import { DoctorBadge } from '../components/DoctorBadge';
import { SkeletonTable, SkeletonText } from '../../shared/components/skeleton';

interface AppointmentData {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  type: string;
  notes?: string;
}

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    // Skip appointments with null or undefined patientId
    if (!appointment.patientId) {
      return false;
    }
    
    const matchesSearch = appointment.patientId.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/update-status/${id}`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt._id === id ? { ...apt, status: 'approved' as const } : apt
        )
      );
    } catch (err) {
      console.error('Error approving appointment:', err);
      alert('Failed to approve appointment');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/update-status/${id}`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt._id === id ? { ...apt, status: 'rejected' as const } : apt
        )
      );
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      alert('Failed to reject appointment');
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <SkeletonText variant="h1" width="300px" className="mb-2" />
            <SkeletonText variant="body" width="400px" />
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SkeletonText variant="body" width="300px" height="40px" />
              </div>
              <div className="flex gap-2">
                <SkeletonText variant="body" width="100px" height="40px" />
                <SkeletonText variant="body" width="100px" height="40px" />
                <SkeletonText variant="body" width="100px" height="40px" />
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <SkeletonTable
            rows={8}
            columns={5}
            withHeader={true}
            withActions={true}
            columnWidths={['2fr', '1fr', '1fr', '1fr', '150px']}
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage your appointments and schedule ({appointments.length} total)
          </p>
        </div>

        <DoctorCard>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              <select
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Patient
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type & Notes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {appointment.patientId?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patientId?.email || 'No email available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs">
                          {appointment.type ? appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) : 'Consultation'}
                        </div>
                        {appointment.notes && (
                          <div className="text-xs text-gray-400 mt-1 italic">
                            {appointment.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DoctorBadge
                          variant={
                            appointment.status === 'approved'
                              ? 'success'
                              : appointment.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {appointment.status}
                        </DoctorBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {appointment.status === 'pending' && (
                            <>
                              <DoctorButton
                                variant="primary"
                                size="sm"
                                icon={<Check size={14} />}
                                onClick={() => handleApprove(appointment._id)}
                              >
                                Approve
                              </DoctorButton>
                              <DoctorButton
                                variant="danger"
                                size="sm"
                                icon={<X size={14} />}
                                onClick={() => handleReject(appointment._id)}
                              >
                                Reject
                              </DoctorButton>
                            </>
                          )}
                          {appointment.status === 'approved' && (
                            <DoctorButton
                              variant="outline"
                              size="sm"
                            >
                              View Details
                            </DoctorButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {appointments.length === 0 ? 'No appointments found. Appointments will appear here when patients book with you.' : 'No appointments match your search criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DoctorCard>
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointments;
