import { useEffect, useState } from "react";
import axios from "axios";
import { FileDown, Search, Filter, Pill, Clipboard, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import useNotifications from "../../shared/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { SkeletonList, SkeletonText, SkeletonButton } from "../../shared/components/skeleton";

import { Prescription as PrescriptionType } from "../../shared/types/prescription";
import { User } from "../../shared/types/auth";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
}

interface Prescription extends PrescriptionType {
  doctorId: User & {
    specialization?: string;
  };
}

export default function ViewPrescriptions() {
  const { notifyError, notifySuccess } = useNotifications();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'recent', 'older'
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/prescriptions/patient`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPrescriptions(res.data);
        setFilteredPrescriptions(res.data);
      } catch (err) {
        notifyError('Error', 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [notifyError]);
  // Apply filters and search
  useEffect(() => {
    let result = [...prescriptions];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(presc => 
        presc.doctorId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presc.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||        Array.isArray(presc.medicines) && presc.medicines.some(med => 
          typeof med === 'string' && med.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply filter
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    switch (filter) {
      case 'recent':
        result = result.filter(presc => new Date(presc.createdAt) >= thirtyDaysAgo);
        break;
      case 'older':
        result = result.filter(presc => new Date(presc.createdAt) < thirtyDaysAgo);
        break;
      default:
        // 'all' - no filtering
        break;
    }
    
    setFilteredPrescriptions(result);
  }, [filter, searchQuery, prescriptions]);
  const viewProfessionalPrescription = (prescription: Prescription) => {
    // Navigate to the ProfessionalPrescription page with prescription data
    navigate(`/prescription/${prescription._id}`, {
      state: { 
        prescription 
      }
    });
    notifySuccess('Success', 'Opening professional prescription view');
  };
    // Transforms medicine data for display
  const getMedicineDisplay = (medicine: string) => {
    return medicine;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <SkeletonText variant="h1" width="300px" className="mb-2" />
          <SkeletonText variant="body" width="400px" />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SkeletonText variant="body" width="300px" height="40px" />
            </div>
            <div className="flex gap-2">
              <SkeletonButton variant="small" width="80px" />
              <SkeletonButton variant="small" width="80px" />
              <SkeletonButton variant="small" width="100px" />
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <SkeletonList
          variant="detailed"
          items={6}
          withActions={true}
          withStatus={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white opacity-50 z-0"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">My Prescriptions</h1>
          </div>

          {/* Search and filter bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search doctor or medicine"
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
                <option value="all">All Prescriptions</option>
                <option value="recent">Last 30 days</option>
                <option value="older">Older than 30 days</option>
              </select>
            </div>
          </div>

          {/* Prescriptions list */}
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <Clipboard className="h-16 w-16 mx-auto mb-4 p-3 rounded-full bg-gray-200 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No prescriptions found</h3>
              <p className="text-gray-500 mb-4">
                {filter !== 'all' ? 'Try changing your filter' : 'You have no prescriptions yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrescriptions.map((prescription) => (
                <div 
                  key={prescription._id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div 
                    onClick={() => toggleExpand(prescription._id)}
                    className="p-4 cursor-pointer flex flex-col"
                  >
                    {/* Card Header with minimal info */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Clipboard className="h-8 w-8 p-1.5 rounded-full bg-purple-100 text-purple-600 mr-3 shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-900">Dr. {prescription.doctorId.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {expandedId === prescription._id ? 
                          <ChevronUp size={20} className="text-gray-500" /> : 
                          <ChevronDown size={20} className="text-gray-500" />
                        }
                      </div>
                    </div>
                    
                    {/* Download button always visible */}                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewProfessionalPrescription(prescription);
                      }}
                      className="mt-3 flex items-center justify-center w-full px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <FileDown size={16} className="mr-2" />
                      View Prescription
                    </button>
                  </div>
                  
                  {/* Expandable content */}
                  {expandedId === prescription._id && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-4">
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <h4 className="font-medium text-purple-800 mb-2 flex items-center text-sm">
                            <Clipboard size={14} className="mr-2" />
                            Diagnosis
                          </h4>
                          <p className="text-sm text-gray-700">{prescription.diagnosis}</p>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <h4 className="font-medium text-purple-800 mb-2 flex items-center text-sm">
                            <Pill size={14} className="mr-2" />
                            Medicines
                          </h4>
                          <ul className="space-y-1">
                            {Array.isArray(prescription.medicines) && prescription.medicines.map((medicine, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="mr-2">•</span>
                                <span>{getMedicineDisplay(medicine)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {prescription.advice && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-medium text-green-800 mb-2 text-sm">Advice:</h4>
                            <p className="text-sm text-gray-700">{prescription.advice}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}