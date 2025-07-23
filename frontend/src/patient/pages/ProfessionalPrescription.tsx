import React, { useEffect, useState } from 'react';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../shared/prescriptionPrint.css';

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  timing?: string;
}

interface PrescriptionData {
  _id: string;
  diagnosis: string;
  medicines: Array<Medicine | string>;
  advice: string;
  createdAt: string;
  doctorId: {
    name: string;
    specialization?: string;
  };
  patientId?: {
    name: string;
    age?: string;
  };
}

const ProfessionalPrescription: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  
  useEffect(() => {
    // Get prescription data from location state
    if (location.state?.prescription) {
      setPrescription(location.state.prescription);
    }
  }, [location]);

  const handleDownload = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Get medicine display info
  const getMedicineDisplay = (medicine: any) => {
    if (typeof medicine === 'string') {
      return {
        name: medicine,
        dosage: '',
        duration: '',
        timing: ''
      };
    }
    return medicine;
  };

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No prescription data found. <button onClick={handleBack} className="text-purple-600 underline">Go back</button></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back and Download Buttons - Hidden in print */}
        <div className="mb-6 flex justify-between print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Download size={20} />
            Download Prescription
          </button>
        </div>

        {/* Prescription Document */}
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="prescription-letterhead bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">MEDCONNECT-AI</h1>
                <p className="text-purple-100 mt-1">Excellence in Healthcare</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-100">Phone: +1 (555) 123-4567</p>
                <p className="text-sm text-purple-100">Email: info@medconnect-ai.com</p>
                <p className="text-sm text-purple-100">123 Health Street, Medical City</p>
              </div>
            </div>
          </div>

          {/* Prescription Content */}
          <div className="p-8">
            {/* Doctor and Date */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Dr. {prescription.doctorId.name}</h2>
                <p className="text-gray-600">{prescription.doctorId.specialization || 'Medical Doctor'}</p>
                <p className="text-gray-600">License: #MD-{Math.floor(10000 + Math.random() * 90000)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-800">Date: {formatDate(prescription.createdAt)}</p>
                <p className="text-sm text-gray-600 mt-1">Prescription #: RX-{prescription._id.substring(0, 6)}</p>
              </div>
            </div>

            {/* Patient Info Section */}
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name: </span>
                  <span className="font-medium">{prescription.patientId?.name || 'Patient'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age: </span>
                  <span className="font-medium">{prescription.patientId?.age || '-'}</span>
                </div>
              </div>
            </div>

            {/* Diagnosis Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Rx</span>
                Diagnosis
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-800 font-medium">{prescription.diagnosis}</p>
              </div>
            </div>

            {/* Medicines Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">Rx</span>
                Prescribed Medicines
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                {Array.isArray(prescription.medicines) && prescription.medicines.map((medicine, index) => {
                  const med = getMedicineDisplay(medicine);
                  return (
                    <div className="flex items-start mb-4 last:mb-0" key={index}>
                      <span className="text-gray-500 mr-3">•</span>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{med.name}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                          {med.dosage && <span>Dosage: <strong>{med.dosage}</strong></span>}
                          {med.duration && <span>Duration: <strong>{med.duration}</strong></span>}
                          {med.timing && <span>Instructions: <strong>{med.timing}</strong></span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advice Section */}
            {prescription.advice && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">Rx</span>
                  Medical Advice
                </h3>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="text-gray-800">{prescription.advice}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Follow-up required: Yes / No</p>
                  <p className="text-sm text-gray-600">Next appointment: ___________</p>
                </div>
                <div className="text-right">
                  <div className="border-t border-gray-400 w-48 mb-2"></div>
                  <p className="text-sm text-gray-800 font-medium">Dr. {prescription.doctorId.name}</p>
                  <p className="text-xs text-gray-600">Digital Signature</p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <p className="text-red-800 text-sm">
                <strong>Important:</strong> This prescription is valid for 30 days from the date of issue. 
                Please complete the full course of medication as prescribed. Contact your doctor if you 
                experience any adverse reactions.
              </p>
            </div>
          </div>

          {/* Print Footer */}
          <div className="bg-gray-100 p-4 text-center text-xs text-gray-600 print:bg-white">
            <p>MedConnect-AI - Excellence in Healthcare | www.medconnect-ai.com</p>
            <p className="mt-1">This is a computer-generated prescription and is valid without signature</p>
          </div>
        </div>

        {/* Additional Print Button */}
        <div className="mt-6 flex justify-center print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Printer size={16} />
            Print Prescription
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPrescription;
