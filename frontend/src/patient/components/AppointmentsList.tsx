import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Appointment } from '../../shared/types/appointment';

interface AppointmentsListProps {
  appointments: Appointment[];
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments }) => {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rescheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
        <Link 
          to="/appointments" 
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
        >
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {appointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Dr. {appointment.doctorName}</h3>
                    <p className="text-sm text-gray-500">{appointment.specialty}</p>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[appointment.status as keyof typeof statusColors]
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 col-span-2">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {appointment.location}
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  {appointment.status === 'confirmed' && (
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      Reschedule
                    </button>
                  )}
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No upcoming appointments</p>
            <Link 
              to="/book-appointment"
              className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors duration-150"
            >
              Book Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
