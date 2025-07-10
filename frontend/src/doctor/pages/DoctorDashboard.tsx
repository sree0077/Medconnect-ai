import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, FilePen, UserCheck, Activity } from 'lucide-react';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { DoctorStatCard } from '../components/DoctorStatCard';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorButton } from '../components/DoctorButton';
import { DoctorBadge } from '../components/DoctorBadge';
import { SkeletonDashboard } from '../../shared/components/skeleton';
import { useSessionValidation } from '../../shared/hooks/useSessionValidation';

interface DoctorData {
  profile: {
    name: string;
    email: string;
    specialization: string;
    experience: number;
    qualifications: string[];
  };
  statistics: {
    totalPatients: number;
    appointmentsToday: number;
    appointmentsThisWeek: number;
    completedAppointments: number;
  };
  todayAppointments: Array<{
    _id: string;
    patientId: {
      name: string;
      _id: string;
    };
    date: string;
    time: string;
    status: string;
    type?: string;
    notes?: string;
  }>;
  upcomingAppointments: any[];
}

const DoctorDashboard = () => {
  const [data, setData] = useState<DoctorData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Add session validation for doctor role
  const { isValidating, isSessionValid } = useSessionValidation({
    requiredRole: 'doctor',
    validateOnMount: true,
    validateOnFocus: true,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        console.log('Fetching doctor dashboard data...');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Log detailed information about the data we received
        console.log('Dashboard data received:', response.data);
        console.log('Statistics data:', response.data?.statistics);
        console.log('Total patients:', response.data?.statistics?.totalPatients);
        console.log('Appointments today:', response.data?.statistics?.appointmentsToday);
        console.log('Appointments this week:', response.data?.statistics?.appointmentsThisWeek);
        
        // Validate the response data
        if (!response.data || !response.data.statistics) {
          console.error('Invalid dashboard data received:', response.data);
          throw new Error('Invalid data received from server');
        }
        
        setData(response.data);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DoctorLayout>
        <SkeletonDashboard type="doctor" />
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

  if (!data) {
    return (
      <DoctorLayout>
        <div className="text-center p-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </DoctorLayout>
    );
  }

  const doctorFirstName = data.profile.name.split(' ')[1] || data.profile.name.split(' ')[0];

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, Dr. {doctorFirstName}! Here's what's happening today.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DoctorStatCard
            title="Appointments Today"
            value={data.statistics?.appointmentsToday || 0}
            change="+5.2%"
            changeType="increase"
            icon={Calendar}
            iconColor="text-purple-600"
          />
          <DoctorStatCard
            title="Total Patients"
            value={data.statistics?.totalPatients || 0}
            change="+12 new"
            changeType="increase"
            icon={UserCheck}
            iconColor="text-green-600"
          />
          <DoctorStatCard
            title="This Week"
            value={data.statistics?.appointmentsThisWeek || 0}
            change="+8.1%"
            changeType="increase"
            icon={FilePen}
            iconColor="text-purple-600"
          />
          <DoctorStatCard
            title="Completed"
            value={data.statistics?.completedAppointments || 0}
            change="+15.3%"
            changeType="increase"
            icon={Activity}
            iconColor="text-purple-600"
          />
        </div>

        {/* Doctor Profile and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Doctor Profile</h3>
                <p className="text-sm text-gray-600">Your professional information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">{data.profile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Specialization</p>
                <p className="text-gray-900 font-medium">{data.profile.specialization}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Experience</p>
                <p className="text-gray-900 font-medium">{data.profile.experience} years</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900 text-sm">{data.profile.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Manage your daily tasks efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/doctor/appointments">
                <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Today's Schedule</p>
                      <p className="text-sm text-gray-600">View appointments</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/doctor/generate-prescription">
                <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                  <div className="flex items-center">
                    <FilePen className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">New Prescription</p>
                      <p className="text-sm text-gray-600">Write prescription</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
              <p className="text-sm text-gray-600">Manage your scheduled appointments</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          PATIENT
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          TIME
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          SYMPTOMS
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          STATUS
                        </th>
                      </tr>
                    </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.todayAppointments && data.todayAppointments.length > 0 ? (
                      data.todayAppointments.map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientId?.name || 'Unknown Patient'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{appointment.time}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {appointment.type ? appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) : 'Consultation'}
                            </div>
                            {appointment.notes && (
                              <div className="text-xs text-gray-400 mt-1 italic">
                                {appointment.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <DoctorBadge
                              variant={
                                appointment.status === 'pending' ? 'warning' :
                                appointment.status === 'approved' ? 'success' :
                                appointment.status === 'cancelled' ? 'danger' : 'info'
                              }
                            >
                              {appointment.status}
                            </DoctorBadge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <Calendar size={48} className="text-gray-300 mb-2" />
                            <p>No appointments scheduled for today</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {data.todayAppointments && data.todayAppointments.length > 0 && (
                  <div className="py-3 px-4 border-t border-gray-200">
                    <Link to="/doctor/appointments">
                      <div className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors">
                        View All Appointments
                      </div>
                    </Link>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;