import React, { useState, useEffect } from 'react';
import { AdminDataTable } from '../components/AdminDataTable';
import { FileText, Eye, Download, Calendar, User, UserCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { prescriptionService } from '../../shared/services/api';
import { Prescription } from '../../shared/types/prescription';
import { User as UserType } from '../../shared/types/auth';
import { AdminSkeletonStatCard, SkeletonTable, SkeletonText } from '../../shared/components/skeleton';

// Fallback dummy data in case API fails
const dummyPrescriptionData = [
  {
    _id: '1',
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Johnson',
    medications: 'Lisinopril 10mg, Metformin 500mg',
    issuedDate: '2024-01-20',
    diagnosis: 'Hypertension, Diabetes Type 2',
    advice: 'Take once daily with food',
    status: 'Active'
  },
];

interface ProcessedPrescription {
  _id: string;
  patientName: string;
  doctorName: string;
  medicines: string | React.ReactNode;
  diagnosis: string | React.ReactNode;
  createdAt: string;
  status: React.ReactNode;
}

const columns = [
  { key: 'patientName', header: 'Patient', sortable: true },
  { key: 'doctorName', header: 'Doctor', sortable: true },
  { key: 'medicines', header: 'Medications', sortable: false },
  { key: 'diagnosis', header: 'Diagnosis', sortable: false },
  { key: 'createdAt', header: 'Issued Date', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
];

export const AdminPrescriptionLogs: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<string[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const data = await prescriptionService.getAllPrescriptions();
        setPrescriptions(data);
        
        // Extract unique doctor names
        const uniqueDoctors = [...new Set(data.map((p: Prescription) => {
          const doctor = p.doctorId as UserType;
          return doctor.name;
        }))];
        
        setDoctors(uniqueDoctors);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const getStatusBadge = (date: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const prescDate = new Date(date);
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    if (prescDate > oneMonthAgo) {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
    } else {
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Completed</span>;
    }
  };

  const filteredData = prescriptions.filter(prescription => {
    const doctor = prescription.doctorId as UserType;
    const doctorName = doctor?.name || 'Unknown Doctor';
    
    const doctorMatch = selectedDoctor === 'all' || doctorName === selectedDoctor;
    
    const prescDate = new Date(prescription.createdAt);
    const isActive = new Date(prescDate.getTime() + 30 * 24 * 60 * 60 * 1000) > new Date();
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'active' && isActive) || 
      (selectedStatus === 'completed' && !isActive);
    
    let dateMatch = true;
    if (selectedDateRange !== 'all') {
      const today = new Date();
      const daysAgo = parseInt(selectedDateRange);
      const cutoffDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      dateMatch = prescDate >= cutoffDate;
    }
    
    return doctorMatch && statusMatch && dateMatch;
  });

  const enhancedData: ProcessedPrescription[] = filteredData.map(prescription => {
    const patient = prescription.patientId as UserType;
    const doctor = prescription.doctorId as UserType;
    const medicinesString = Array.isArray(prescription.medicines) 
      ? prescription.medicines.join(', ') 
      : prescription.medicines || '';
    
    return {
      _id: prescription._id,
      patientName: patient?.name || 'Unknown Patient',
      doctorName: doctor?.name || 'Unknown Doctor',
      createdAt: format(new Date(prescription.createdAt), 'MMM dd, yyyy'),
      status: getStatusBadge(prescription.createdAt),
      medicines: (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900 truncate" title={medicinesString}>
            {medicinesString}
          </p>
        </div>
      ),
      diagnosis: (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate" title={prescription.diagnosis}>
            {prescription.diagnosis}
          </p>
        </div>
      ),
    };
  });

  const actions = (row: ProcessedPrescription) => (
    <div className="flex items-center space-x-2">
      <button 
        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
        title="View Full Prescription"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button 
        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
        title="Download PDF"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonText variant="body" width="100%" height="40px" />
            <SkeletonText variant="body" width="100%" height="40px" />
            <SkeletonText variant="body" width="100%" height="40px" />
          </div>
        </div>

        {/* Data Table */}
        <SkeletonTable
          rows={10}
          columns={6}
          withHeader={true}
          withActions={true}
          columnWidths={['2fr', '2fr', '2fr', '2fr', '1fr', '1fr', '150px']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Prescription Logs</h1>
          <p className="text-gray-600 mt-2">View and manage all prescription records</p>
        </div>
        <button className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter((p: Prescription) => {
                  const prescDate = new Date(p.createdAt);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return prescDate >= weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter((p: Prescription) => {
                  const prescDate = new Date(p.createdAt);
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  return prescDate > oneMonthAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Unique Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Doctors</option>
              {doctors.map((doctor: string) => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={enhancedData}
        actions={actions}
        searchable={true}
        filterable={false}
        pagination={true}
      />
    </div>
  );
};