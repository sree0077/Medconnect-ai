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
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {prescriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {prescriptions.map((prescription) => {
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
                <div key={prescription._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className="bg-purple-100 rounded-lg p-2 mr-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{medicinesString}</h3>
                        <p className="text-sm text-gray-500">
                          {prescription.diagnosis}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Prescribed on {formattedDate}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="text-purple-600 hover:text-purple-800 flex items-center text-sm font-medium"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </button>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <p className="text-gray-600">{prescription.advice || 'No specific advice provided.'}</p>
                    <p className="mt-1 text-gray-500">Dr. {doctor?.name || 'Unknown'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionsList;
