import React, { useState, useEffect } from 'react';
import { AdminDataTable } from '../components/AdminDataTable';
import { Calendar, Clock, CheckCircle, XCircle, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { appointmentService } from '../../shared/services/api';
import { Appointment } from '../../shared/types/appointment';
import { User } from '../../shared/types/auth';
import { AdminSkeletonStatCard, SkeletonTable, SkeletonText } from '../../shared/components/skeleton';

const columns = [
  { key: 'patientName', header: 'Patient', sortable: true },
  { key: 'doctorName', header: 'Doctor', sortable: true },
  { key: 'specialty', header: 'Specialty', sortable: true },
  { key: 'date', header: 'Date', sortable: true },
  { key: 'time', header: 'Time', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'type', header: 'Type', sortable: true },
  { key: 'duration', header: 'Duration', sortable: false },
];

interface AppointmentData {
  _id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  type: string;
  duration: string;
  originalStatus: string;
}

export const AdminAppointmentMonitoring: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    noShow: 0
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAllAppointments();
        setAppointments(data);
        
        // Calculate counts for stats
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = data.filter((apt: Appointment) => apt.date === today);
        setTodayCount(todayAppointments.length);
        
        // Count by status
        const pending = data.filter((apt: Appointment) => apt.status === 'pending').length;
        const approved = data.filter((apt: Appointment) => apt.status === 'approved').length;
        const rejected = data.filter((apt: Appointment) => apt.status === 'rejected').length;
        
        setStatusCounts({
          pending,
          approved,
          rejected,
          noShow: 0 // We don't have this status in our model yet
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError(`Failed to load appointments: ${err.message}. Check if the backend server is running.`);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredData = appointments.filter((appointment: Appointment) => {
    const appointmentStatus = typeof appointment.status === 'string' ? appointment.status.toLowerCase() : '';
    const statusMatch = selectedStatus === 'all' || appointmentStatus === selectedStatus;
    const dateMatch = !selectedDate || appointment.date === selectedDate;
    return statusMatch && dateMatch;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (type.toLowerCase()) {
      case 'emergency':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{type}</span>;
      case 'consultation':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>{type}</span>;
      case 'follow-up':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{type}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{type}</span>;
    }
  };

  const enhancedData = filteredData.map((appointment: Appointment) => {
    // Safely extract doctor and patient information
    const doctor = appointment.doctorId as User;
    const patient = appointment.patientId as User;
    
    // Set default duration based on appointment type
    const getDuration = (type: string) => {
      switch(type) {
        case 'emergency': return '60 min';
        case 'consultation': return '45 min';
        case 'follow-up': return '30 min';
        default: return '30 min';
      }
    };
    
    return {
      _id: appointment._id,
      patientName: patient?.name || 'Unknown Patient',
      doctorName: doctor?.name || 'Unknown Doctor',
      specialty: doctor?.specialization || 'General',
      date: appointment.date ? format(new Date(appointment.date), 'MMM dd, yyyy') : 'Unknown',
      time: appointment.time || 'Unknown',
      status: getStatusBadge(appointment.status),
      type: getTypeBadge(appointment.type),
      duration: getDuration(appointment.type),
      originalStatus: appointment.status
    };
  });

  const exportData = () => {
    // This would typically generate and download a CSV/PDF file
    console.log('Exporting appointment data...');
    alert('Appointment data export functionality will be implemented soon.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Appointment Monitoring</h1>
          <p className="text-gray-600 mt-2">Track and manage all appointments across the platform</p>
        </div>
        <button 
          onClick={exportData}
          className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.pending}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.approved}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts.rejected}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1 flex items-end">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <SkeletonText variant="h1" width="300px" className="mb-2" />
            <SkeletonText variant="body" width="400px" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdminSkeletonStatCard key={`stat-${index}`} />
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="100%" height="40px" />
            </div>
          </div>

          {/* Data Table */}
          <SkeletonTable
            rows={10}
            columns={8}
            withHeader={true}
            withActions={false}
            columnWidths={['2fr', '2fr', '1.5fr', '1fr', '1fr', '1fr', '1fr', '1fr']}
          />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={enhancedData}
          searchable={true}
          filterable={false}
          pagination={true}
        />
      )}
    </div>
  );
};