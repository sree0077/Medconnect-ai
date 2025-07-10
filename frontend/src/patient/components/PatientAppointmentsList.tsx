import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Filter, PlusCircle, Search } from 'lucide-react';
import { Appointment } from '../../shared/types/appointment';
import useNotifications from '../../shared/hooks/useNotifications';
import { SkeletonList, SkeletonText, SkeletonButton } from '../../shared/components/skeleton';

const PatientAppointmentsList: React.FC = () => {
  const { notifyError, notifySuccess } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'confirmed', 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch appointments
        const response = await axios.get(`${apiBaseUrl}/api/appointments/patient`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Transform appointments data
        const transformedAppointments = transformAppointments(response.data);
        setAppointments(transformedAppointments);
        setFilteredAppointments(transformedAppointments);
      } catch (err: any) {
        console.error('Appointments fetch error:', err);

        let errorMessage = 'Failed to load appointments';
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
        }

        setError(errorMessage);
        notifyError('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [notifyError]);

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
      location: apt.location || 'MedConnect Clinic',
      status: apt.status || 'pending',
      notes: apt.notes
    }));
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...appointments];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(apt => 
        apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    switch (filter) {
      case 'upcoming':
        result = result.filter(apt => new Date(apt.date) >= new Date());
        break;
      case 'past':
        result = result.filter(apt => new Date(apt.date) < new Date());
        break;
      case 'confirmed':
        result = result.filter(apt => apt.status === 'confirmed');
        break;
      case 'pending':
        result = result.filter(apt => apt.status === 'pending');
        break;
      default:
        // 'all' - no filtering
        break;
    }
    
    setFilteredAppointments(result);
  }, [filter, searchQuery, appointments]);

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rescheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `${apiBaseUrl}/api/appointments/update-status/${appointmentId}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state
      const updatedAppointments = appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
      );
      
      setAppointments(updatedAppointments);
      
      // Update filtered appointments
      const updatedFiltered = filteredAppointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
      );
      
      setFilteredAppointments(updatedFiltered);
      
      notifySuccess('Success', 'Appointment cancelled successfully');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      notifyError('Error', 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SkeletonText variant="body" width="300px" height="40px" />
          </div>
          <div className="flex gap-2">
            <SkeletonButton variant="small" width="80px" />
            <SkeletonButton variant="small" width="80px" />
            <SkeletonButton variant="small" width="80px" />
          </div>
        </div>

        {/* Appointments List */}
        <SkeletonList
          variant="appointment"
          items={6}
          withActions={true}
          withStatus={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">My Appointments</h1>
        <Link 
          to="/book-appointment"
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          Book New Appointment
        </Link>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search doctor or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Appointments</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Appointments list */}
      {filteredAppointments.length > 0 ? (
        <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-5 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div className="mb-3 md:mb-0">
                    <div className="flex items-start">
                      <User className="h-10 w-10 p-2 rounded-full bg-purple-100 text-purple-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Dr. {appointment.doctorName}</h3>
                        <p className="text-sm text-gray-500">{appointment.specialty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="mb-3 md:mb-0">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">{appointment.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">{appointment.time}</span>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border self-start md:self-center ${
                      statusColors[appointment.status as keyof typeof statusColors]
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <button 
                        className="px-3 py-1 bg-white border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button 
                    className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-md text-sm text-purple-700 hover:bg-purple-100"
                    onClick={() => {/* Handle view details */}}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <User className="h-16 w-16 mx-auto mb-4 p-3 rounded-full bg-gray-200 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
          <p className="text-gray-500 mb-4">
            {filter !== 'all' ? 'Try changing your filter' : 'You have no appointments yet'}
          </p>
          <Link
            to="/book-appointment"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <PlusCircle size={16} className="mr-2" />
            Book Your First Appointment
          </Link>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentsList;
