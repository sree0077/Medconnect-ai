import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, FileText, Activity, Clock } from 'lucide-react';
import { PatientLayout } from '../layouts/PatientLayout';
import { PatientStatCard } from '../components/PatientStatCard';
import QuickActions from '../components/QuickActions';
import AppointmentsList from '../components/AppointmentsList';
import PrescriptionsList from '../components/PrescriptionsList';
import AIInsightsPanel from '../components/AIInsightsPanel';
import HealthMonitoring from '../components/HealthMonitoring';
import { Appointment } from '../../shared/types/appointment';
import { Prescription } from '../../shared/types/prescription';
import { useSessionValidation } from '../../shared/hooks/useSessionValidation';
import useNotifications from '../../shared/hooks/useNotifications';
import { SkeletonDashboard } from '../../shared/components/skeleton';

interface PatientDashboardData {
  profile: {
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    medicalHistory: string[];
  };
  appointments: any[];
  upcomingAppointments: any[];
  pastAppointments: any[];
}



const Dashboard: React.FC = () => {
  const { notifyInfo, notifySuccess } = useNotifications();
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add session validation for patient role
  const { isValidating, isSessionValid } = useSessionValidation({
    requiredRole: 'patient',
    validateOnMount: true,
    validateOnFocus: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch dashboard data
        const dashboardResponse = await axios.get(`${apiBaseUrl}/api/patient/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch prescriptions
        const prescriptionsResponse = await axios.get(`${apiBaseUrl}/api/prescriptions/patient`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDashboardData(dashboardResponse.data);
        setPrescriptions(prescriptionsResponse.data);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        console.error('Error details:', err.response?.data);

        let errorMessage = 'Failed to load dashboard data';
        if (err.message === 'No authentication token found') {
          errorMessage = 'Please log in again';
          // Redirect to login
          window.location.href = '/login';
          return;
        } else if (err.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again';
          // Clear token and redirect
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. Please check your account permissions';
        } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Transform appointments data to match component interface
  const transformAppointments = (appointments: any[]): Appointment[] => {
    return appointments.map(apt => ({
      id: apt._id,
      doctorName: apt.doctorId?.name || 'Unknown Doctor',
      specialty: apt.doctorId?.specialization || 'General Practice',
      date: new Date(apt.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: apt.time,
      location: 'MedConnect Clinic', // Default location since not in backend
      status: apt.status as 'confirmed' | 'pending' | 'rescheduled' | 'cancelled',
      notes: apt.notes || ''
    }));
  };

  // Transform prescriptions data to match component interface
  const transformPrescriptions = (prescriptions: any[]): Prescription[] => {
    return prescriptions.map(presc => ({
      id: presc._id,
      medication: presc.medicines?.[0]?.name || 'Unknown Medication',
      dosage: presc.medicines?.[0]?.dosage || 'As prescribed',
      frequency: presc.medicines?.[0]?.timing || 'As directed',
      instructions: presc.advice || 'Follow doctor\'s instructions',
      prescribedBy: presc.doctorId?.name || 'Unknown Doctor',
      prescribedDate: new Date(presc.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      expiryDate: 'Not specified',
      refillsLeft: 0, // Not tracked in current backend
      pharmacy: {
        name: 'MedConnect Pharmacy',
        address: '123 Health St, Medical Center',
        phone: '(555) 123-4567'
      }
    }));
  };



  if (loading) {
    return (
      <PatientLayout>
        <SkeletonDashboard type="patient" />
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="text-red-500 text-center p-8">
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="py-4">
        <div className="text-center p-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = transformAppointments(dashboardData.upcomingAppointments || []);
  const transformedPrescriptions = transformPrescriptions(prescriptions);

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back, {dashboardData.profile.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">Here's your health overview and upcoming appointments.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PatientStatCard
            title="Upcoming Appointments"
            value={upcomingAppointments.length}
            change="+2 this week"
            changeType="increase"
            icon={Calendar}
            iconColor="text-purple-600"
          />
          <PatientStatCard
            title="Active Prescriptions"
            value={transformedPrescriptions.length}
            change="3 active"
            changeType="neutral"
            icon={FileText}
            iconColor="text-green-600"
          />
          <PatientStatCard
            title="Health Score"
            value="85%"
            change="+5% improvement"
            changeType="increase"
            icon={Activity}
            iconColor="text-blue-600"
          />
          <PatientStatCard
            title="Last Checkup"
            value="2 weeks ago"
            change="Next due in 4 weeks"
            changeType="neutral"
            icon={Clock}
            iconColor="text-purple-600"
          />
        </div>

        <QuickActions />
        <HealthMonitoring />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <AppointmentsList appointments={upcomingAppointments} />
          </div>
          <div>
            <PrescriptionsList prescriptions={transformedPrescriptions} />
          </div>
        </div>

        <AIInsightsPanel />
      </div>
    </PatientLayout>
  );
};

export default Dashboard;
