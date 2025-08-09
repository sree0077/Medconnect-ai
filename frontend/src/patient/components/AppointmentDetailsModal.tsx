import React from 'react';
import { X, Calendar, Clock, User, MapPin, FileText, Phone, Mail, Stethoscope } from 'lucide-react';
import { Appointment } from '../../shared/types/appointment';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          {/* Doctor Information */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
              Doctor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Doctor Name</p>
                  <p className="font-medium text-gray-900">Dr. {appointment.doctorName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Specialty</p>
                  <p className="font-medium text-gray-900">{appointment.specialty}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Appointment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(appointment.date)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{appointment.location || 'MedConnect Clinic'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Appointment ID</p>
                  <p className="font-medium text-gray-900 text-xs">{appointment.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {appointment.notes && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Notes
              </h3>
              <p className="text-gray-700 leading-relaxed">{appointment.notes}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Clinic Phone</p>
                  <p className="font-medium text-gray-900">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">appointments@medconnect.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Instructions</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Please arrive 15 minutes before your appointment time</li>
              <li>• Bring a valid ID and insurance card</li>
              <li>• Bring any relevant medical records or test results</li>
              <li>• If you need to cancel, please do so at least 24 hours in advance</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
