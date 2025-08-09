import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Download, ChevronRight } from 'lucide-react';
import { Prescription } from '../../shared/types/prescription';
import { User } from '../../shared/types/auth';
import { format } from 'date-fns';

interface PrescriptionsListProps {
  prescriptions: Prescription[];
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ prescriptions }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Latest Prescriptions</h2>
        <Link
          to="/prescriptions"
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
        >
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[200px] flex flex-col">
        {prescriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {prescriptions.slice(0, 2).map((prescription) => {
              const doctor = prescription.doctorId as User;
              
              // Safely format the date with error handling
              let formattedDate = 'Unknown date';
              try {
                if (prescription.createdAt) {
                  formattedDate = format(new Date(prescription.createdAt), 'MMM dd, yyyy');
                }
              } catch (error) {
                console.warn('Invalid date format for prescription:', prescription._id);
              }
              
              const medicinesString = Array.isArray(prescription.medicines) 
                ? prescription.medicines.join(', ') 
                : '';
              
              return (
                <div key={prescription._id} className="p-3 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className="bg-purple-100 rounded-lg p-2 mr-3">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{medicinesString || 'Prescription'}</h3>
                        <p className="text-xs text-gray-500">
                          Dr. {doctor?.name || 'Unknown'} • {formattedDate}
                        </p>
                      </div>
                    </div>

                    <button
                      className="text-purple-600 hover:text-purple-800 flex items-center text-xs font-medium"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
            {prescriptions.length > 2 && (
              <div className="p-3 text-center bg-gray-50">
                <Link
                  to="/prescriptions"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  View {prescriptions.length - 2} more prescriptions
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center flex-1 flex flex-col justify-center">
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionsList;
