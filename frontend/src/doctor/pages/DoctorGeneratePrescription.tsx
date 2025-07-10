import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorButton } from '../components/DoctorButton';
import { SkeletonText } from '../../shared/components/skeleton';

interface Patient {
  _id: string;
  name: string;
  email: string;
}

const DoctorGeneratePrescription: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', duration: '', timing: '' },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch patients when search query changes
  useEffect(() => {
    const fetchPatients = async () => {
      const trimmedQuery = searchQuery.trim();

      // If a patient is already selected and the search query matches exactly, don't search again
      if (selectedPatient && trimmedQuery === selectedPatientName.trim()) {
        setShowDropdown(false);
        setSearchLoading(false);
        return;
      }

      if (trimmedQuery.length < 2) {
        setPatients([]);
        setShowDropdown(false);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Searching for patients with query:', trimmedQuery);
        console.log('Using token:', token ? 'Token present' : 'No token');
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/users/search?query=${encodeURIComponent(trimmedQuery)}&role=patient`);

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/search?query=${encodeURIComponent(trimmedQuery)}&role=patient`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Patient search response:', response.data);
        setPatients(response.data);
        setShowDropdown(response.data.length > 0);
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        console.error('Full error details:', err.response?.data || err.message);
        setPatients([]);
        setShowDropdown(false);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedPatient, selectedPatientName]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', duration: '', timing: '' },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };

  const handleMedicineChange = (
    index: number,
    field: 'name' | 'dosage' | 'duration' | 'timing',
    value: string
  ) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logging
    console.log('Form submission data:', {
      selectedPatient,
      selectedPatientName,
      diagnosis,
      medicines,
      advice,
      followUp
    });

    // Detailed validation with specific error messages
    if (!selectedPatient) {
      setError('Please select a patient from the search results');
      return;
    }

    if (!diagnosis.trim()) {
      setError('Please enter a diagnosis');
      return;
    }

    // Check if at least one medicine has a name
    const validMedicines = medicines.filter(med => med.name.trim() !== '');
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }

    // Check if all medicines with names have required fields
    const incompleteMedicines = validMedicines.filter(med =>
      !med.name.trim() || !med.dosage.trim() || !med.duration.trim() || !med.timing.trim()
    );

    if (incompleteMedicines.length > 0) {
      setError('Please fill in all fields for each medicine (name, dosage, duration, timing)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // Convert medicines to the format expected by backend (array of strings)
      const medicineStrings = validMedicines.map(med =>
        `${med.name} - ${med.dosage} - ${med.duration} - ${med.timing}`
      );

      const prescriptionData = {
        patientId: selectedPatient,
        diagnosis: diagnosis.trim(),
        medicines: medicineStrings,
        advice: advice.trim() || 'Follow the prescribed medication schedule.'
      };

      console.log('Submitting prescription with data:', prescriptionData);
      console.log('Using token:', token ? 'Token present' : 'No token');
      console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/prescriptions/add`);

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/prescriptions/add`, prescriptionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setSelectedPatient('');
      setSelectedPatientName('');
      setSearchQuery('');
      setShowDropdown(false);
      setDiagnosis('');
      setAdvice('');
      setFollowUp('');
      setMedicines([{ name: '', dosage: '', duration: '', timing: '' }]);
      setPatients([]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

      setError('');
      setSuccess('Prescription saved successfully!');
    } catch (err: any) {
      console.error('Error saving prescription:', err);

      // More detailed error handling
      if (err?.response) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to save prescription';
        setError(`Error: ${errorMessage}`);
        console.error('Server response:', err.response.data);
        console.error('Server status:', err.response.status);
      } else if (err?.request) {
        setError('Network error: Unable to connect to server');
        console.error('Network error:', err.request);
      } else {
        setError(`Failed to save prescription. Please try again. ${err?.message || ''}`);
        console.error('Error:', err?.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Generate Prescription</h1>
          <p className="text-gray-600 mt-2">
            Create a new prescription for your patient
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded text-sm">
          <strong>Debug Info:</strong><br />
          Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}<br />
          Role: {localStorage.getItem('role') || 'Not set'}<br />
          Name: {localStorage.getItem('name') || 'Not set'}<br />
          API URL: {import.meta.env.VITE_API_BASE_URL || 'Not set'}
        </div>

        <DoctorCard>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Patient Selection */}
              <div>
                <label
                  htmlFor="patient"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Patient *
                </label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    id="patient"
                    placeholder="Type patient name to search..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);

                      // Only clear selection if user significantly changes the input
                      if (selectedPatient && selectedPatientName) {
                        const trimmedValue = value.trim();
                        const trimmedSelectedName = selectedPatientName.trim();

                        // If the input is completely different from selected patient, clear selection
                        if (trimmedValue !== trimmedSelectedName) {
                          const similarity = trimmedValue.toLowerCase().includes(trimmedSelectedName.toLowerCase()) ||
                                           trimmedSelectedName.toLowerCase().includes(trimmedValue.toLowerCase());

                          // Only clear if there's no similarity and the difference is significant
                          if (!similarity || Math.abs(trimmedValue.length - trimmedSelectedName.length) > 3) {
                            setSelectedPatient('');
                            setSelectedPatientName('');
                          }
                        }
                      }

                      setError('');
                      setSuccess('');

                      // Show dropdown if we have results and user is typing (but not if patient is already selected and matches)
                      if (value.trim().length >= 2 && patients.length > 0 &&
                          !(selectedPatient && value.trim() === selectedPatientName.trim())) {
                        setShowDropdown(true);
                      }
                    }}
                    onFocus={() => {
                      // Only show dropdown if we have results and no patient is selected, or if the search doesn't match selected patient
                      if (patients.length > 0 && searchQuery.length >= 2 &&
                          !(selectedPatient && searchQuery.trim() === selectedPatientName.trim())) {
                        setShowDropdown(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowDropdown(false);
                      }
                    }}
                  />
                  {showDropdown && patients.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                      {patients.map((patient) => (
                        <button
                          key={patient._id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            const trimmedName = patient.name.trim();
                            setSelectedPatient(patient._id);
                            setSelectedPatientName(trimmedName);
                            setSearchQuery(trimmedName);
                            setShowDropdown(false);
                            // Don't clear patients array immediately - keep it for reference
                            setError('');
                            setSuccess('');
                            console.log('Patient selected:', { id: patient._id, name: trimmedName });
                          }}
                        >
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchLoading && searchQuery.length >= 2 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-3">
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={`search-skeleton-${index}`} className="flex items-center space-x-3">
                            <SkeletonText variant="body" width="150px" className="mb-1" />
                            <SkeletonText variant="caption" width="200px" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchQuery.length >= 2 && patients.length === 0 && !searchLoading && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-3">
                      <div className="text-sm text-gray-500">No patients found matching "{searchQuery}"</div>
                    </div>
                  )}
                  {searchQuery.length === 1 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-3">
                      <div className="text-sm text-gray-400">Type at least 2 characters to search...</div>
                    </div>
                  )}
                </div>
                {selectedPatientName && selectedPatient && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm text-green-800">
                      ✓ Selected: <span className="font-medium">{selectedPatientName}</span>
                      <span className="text-xs text-green-600 ml-2">(ID: {selectedPatient})</span>
                    </div>
                  </div>
                )}
                {searchQuery && !selectedPatient && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="text-sm text-yellow-800">
                      ⚠ Please select a patient from the dropdown to proceed
                    </div>
                  </div>
                )}
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Diagnosis */}
              <div>
                <label
                  htmlFor="diagnosis"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Diagnosis
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={3}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                  placeholder="Enter diagnosis details"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Medicines
                  </label>
                  <DoctorButton
                    type="button"
                    size="sm"
                    variant="outline"
                    icon={<Plus size={16} />}
                    onClick={handleAddMedicine}
                  >
                    Add Medicine
                  </DoctorButton>
                </div>

                {medicines.map((medicine, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Medicine #{index + 1}
                      </h4>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                          placeholder="Medicine name"
                          value={medicine.name}
                          onChange={(e) =>
                            handleMedicineChange(index, 'name', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                          placeholder="e.g., 10mg"
                          value={medicine.dosage}
                          onChange={(e) =>
                            handleMedicineChange(index, 'dosage', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                          placeholder="e.g., 7 days"
                          value={medicine.duration}
                          onChange={(e) =>
                            handleMedicineChange(index, 'duration', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Timing
                        </label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                          placeholder="e.g., After meals"
                          value={medicine.timing}
                          onChange={(e) =>
                            handleMedicineChange(index, 'timing', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advice */}
              <div>
                <label
                  htmlFor="advice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Advice
                </label>
                <textarea
                  id="advice"
                  name="advice"
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                  placeholder="Enter advice for the patient"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                />
              </div>

              {/* Follow-up */}
              <div>
                <label
                  htmlFor="followUp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Follow-up Date (Optional)
                </label>
                <input
                  type="date"
                  id="followUp"
                  name="followUp"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <DoctorButton type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Prescription'}
                </DoctorButton>
              </div>
            </div>
          </form>
        </DoctorCard>
      </div>
    </DoctorLayout>
  );
};

export default DoctorGeneratePrescription;
