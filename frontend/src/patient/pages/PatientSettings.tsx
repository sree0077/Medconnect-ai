import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, AlertTriangle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientLayout } from '../layouts/PatientLayout';
import { PatientCard } from '../components/PatientCard';
import { PatientButton } from '../components/PatientButton';
import useNotifications from '../../shared/hooks/useNotifications';
import { SkeletonForm, SkeletonText, SkeletonCard } from '../../shared/components/skeleton';

interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
  gender: string;
  bloodType: string;
  height: string; // in cm
  weight: string; // in kg
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  systemUpdates: boolean;
}

const PatientSettings: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthdate: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    appointmentReminders: true,
    medicationReminders: true,
    systemUpdates: true,
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Allergies management
  const [newAllergy, setNewAllergy] = useState('');

  // Load user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching profile data...');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data;
        console.log('Profile data received:', userData);
        
        // Format the data properly
        const patientData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          birthdate: userData.birthdate || '',
          gender: userData.gender || '',
          bloodType: userData.bloodType || '',
          height: userData.height || '',
          weight: userData.weight || '',
          allergies: userData.allergies || [],
          emergencyContact: userData.emergencyContact || {
            name: '',
            phone: '',
            relationship: ''
          }
        };
        
        console.log('Setting patient data:', patientData);
        setPatient(patientData);

        if (userData.notificationPreferences) {
          console.log('Setting notification preferences:', userData.notificationPreferences);
          setNotifications(userData.notificationPreferences);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load profile data';
        setError(errorMessage);
        notifyError('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For number inputs (height, weight), ensure they are valid numbers or empty strings
    if (name === 'height' || name === 'weight') {
      const numValue = value === '' ? '' : value;
      setPatient(prev => ({ ...prev, [name]: numValue }));
    } else {
      setPatient(prev => ({ ...prev, [name]: value }));
    }
    
    setError('');
    setSuccess('');
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value }
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  // Allergies management
  const addAllergy = () => {
    if (newAllergy.trim()) {
      setPatient(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setPatient(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  // Password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordSuccess('Password changed successfully!');
      notifySuccess('Password Changed', 'Your password has been changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Data export
  const handleExportData = async () => {
    setExportingData(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get appointments and prescriptions
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/patient`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/prescriptions/patient`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const exportData = {
        profile: response.data,
        appointments: appointmentsRes.data,
        prescriptions: prescriptionsRes.data,
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully!');
      notifySuccess('Data Exported', 'Your data has been exported successfully!');
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setExportingData(false);
    }
  };

  // Account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including appointments and medical records.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'To confirm account deletion, please type "DELETE" in capital letters:'
    );

    if (doubleConfirm !== 'DELETE') {
      setError('Account deletion cancelled - confirmation text did not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear local storage and redirect
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to delete account. Please contact support.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Ensure we're sending properly formatted data
      const updateData = {
        ...patient,
        height: patient.height?.toString() || '',
        weight: patient.weight?.toString() || '',
        notificationPreferences: notifications,
      };

      console.log("Submitting profile data:", updateData);

      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      notifySuccess('Profile Updated', 'Your profile has been updated successfully!');

      // Update local storage with new name if changed
      if (response.data.user && response.data.user.name) {
        localStorage.setItem('name', response.data.user.name);
      }
      
      // Re-fetch profile data to ensure we have the latest saved data
      const refreshResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const refreshedData = refreshResponse.data;
      console.log('Refreshed data after save:', refreshedData);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorResponse = err.response?.data;
      console.error('Error response:', errorResponse);
      
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      notifyError('Update Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Separate function for notification updates
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log("Submitting notification preferences:", notifications);
      
      // Send the full patient object along with updated notifications
      // This ensures we don't overwrite other profile data
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
        notificationPreferences: notifications,
        // Keep the original patient data intact when updating only notifications
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        birthdate: patient.birthdate,
        gender: patient.gender,
        bloodType: patient.bloodType,
        height: patient.height,
        weight: patient.weight,
        allergies: patient.allergies,
        emergencyContact: patient.emergencyContact
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Notification preferences updated successfully!');
      notifySuccess('Preferences Updated', 'Your notification preferences have been updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating notifications:', err);
      setError(err.response?.data?.error || 'Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <SkeletonText variant="h1" width="300px" className="mb-2" />
            <SkeletonText variant="body" width="400px" />
          </div>

          {/* Settings Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-surface-secondary p-1 rounded-lg">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonText key={`tab-${index}`} variant="body" width="120px" height="40px" />
            ))}
          </div>

          {/* Profile Form */}
          <SkeletonForm
            fields={10}
            withTitle={true}
            withSubtitle={true}
            layout="grid"
            columns={2}
          />

          {/* Notification Settings */}
          <SkeletonCard className="p-6">
            <SkeletonText variant="h3" width="200px" className="mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`notification-${index}`} className="flex items-center justify-between">
                  <div className="flex-1">
                    <SkeletonText variant="body" width="150px" className="mb-1" />
                    <SkeletonText variant="caption" width="200px" />
                  </div>
                  <SkeletonText variant="body" width="40px" height="24px" />
                </div>
              ))}
            </div>
          </SkeletonCard>

          {/* Security Settings */}
          <SkeletonCard className="p-6">
            <SkeletonText variant="h3" width="180px" className="mb-4" />
            <div className="space-y-4">
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="100%" height="40px" />
              <SkeletonText variant="body" width="120px" height="40px" />
            </div>
          </SkeletonCard>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Profile Settings */}
            <div className="lg:col-span-8 w-full">
              <PatientCard title="Profile Settings">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={patient.name}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={patient.email}
                          disabled
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="birthdate"
                          name="birthdate"
                          value={patient.birthdate}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={patient.gender}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={patient.phone}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Type
                        </label>
                        <select
                          id="bloodType"
                          name="bloodType"
                          value={patient.bloodType}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        >
                          <option value="">Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={patient.height}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="175"
                        />
                      </div>
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={patient.weight}
                          onChange={handlePatientChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="70"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={2}
                        value={patient.address}
                        onChange={handlePatientChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="Your home address"
                      />
                    </div>

                    {/* Allergies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies
                      </label>
                      <div className="space-y-2">
                        {patient.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                            <span className="text-sm text-gray-700">{allergy}</span>
                            <button
                              type="button"
                              onClick={() => removeAllergy(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            placeholder="Add new allergy"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                          />
                          <PatientButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addAllergy}
                          >
                            Add
                          </PatientButton>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
                        <div>
                          <label htmlFor="emergencyName" className="block text-xs font-medium text-gray-700 mb-1">
                            Contact Name
                          </label>
                          <input
                            type="text"
                            id="emergencyName"
                            name="name"
                            value={patient.emergencyContact.name}
                            onChange={handleEmergencyContactChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="emergencyPhone" className="block text-xs font-medium text-gray-700 mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            id="emergencyPhone"
                            name="phone"
                            value={patient.emergencyContact.phone}
                            onChange={handleEmergencyContactChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="emergencyRelationship" className="block text-xs font-medium text-gray-700 mb-1">
                            Relationship
                          </label>
                          <select
                            id="emergencyRelationship"
                            name="relationship"
                            value={patient.emergencyContact.relationship}
                            onChange={handleEmergencyContactChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="parent">Parent</option>
                            <option value="child">Child</option>
                            <option value="sibling">Sibling</option>
                            <option value="friend">Friend</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Password Change */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                      </button>

                      {showPasswordForm && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                          <form onSubmit={handlePasswordSubmit}>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Current Password
                                </label>
                                <input
                                  type="password"
                                  name="currentPassword"
                                  value={passwordData.currentPassword}
                                  onChange={handlePasswordChange}
                                  required
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  name="newPassword"
                                  value={passwordData.newPassword}
                                  onChange={handlePasswordChange}
                                  required
                                  minLength={6}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Confirm New Password
                                </label>
                                <input
                                  type="password"
                                  name="confirmPassword"
                                  value={passwordData.confirmPassword}
                                  onChange={handlePasswordChange}
                                  required
                                  minLength={6}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                />
                              </div>

                              {passwordError && (
                                <div className="text-sm text-red-600">{passwordError}</div>
                              )}

                              {passwordSuccess && (
                                <div className="text-sm text-green-600">{passwordSuccess}</div>
                              )}

                              <div className="flex gap-2">
                                <PatientButton
                                  type="submit"
                                  size="sm"
                                  disabled={changingPassword}
                                >
                                  {changingPassword ? 'Changing...' : 'Change Password'}
                                </PatientButton>
                                <PatientButton
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowPasswordForm(false)}
                                >
                                  Cancel
                                </PatientButton>
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <PatientButton type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </PatientButton>
                    </div>
                  </div>
                </form>
              </PatientCard>
            </div>

            {/* Notification Settings */}
            <div className="lg:col-span-4 w-full">
              <PatientCard title="Notification Settings">
                <form onSubmit={handleNotificationSubmit}>
                  <div className="space-y-4">
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700 mb-2">
                        Notification Methods
                      </legend>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="email-notifications"
                            name="email"
                            type="checkbox"
                            checked={notifications.email}
                            onChange={handleNotificationChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="email-notifications"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Email Notifications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="sms-notifications"
                            name="sms"
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={handleNotificationChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="sms-notifications"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            SMS Notifications
                          </label>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700 mb-2">
                        Notification Types
                      </legend>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="appointment-reminders"
                            name="appointmentReminders"
                            type="checkbox"
                            checked={notifications.appointmentReminders}
                            onChange={handleNotificationChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="appointment-reminders"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Appointment Reminders
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="medication-reminders"
                            name="medicationReminders"
                            type="checkbox"
                            checked={notifications.medicationReminders}
                            onChange={handleNotificationChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="medication-reminders"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Medication Reminders
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="system-updates"
                            name="systemUpdates"
                            type="checkbox"
                            checked={notifications.systemUpdates}
                            onChange={handleNotificationChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="system-updates"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            System Updates
                          </label>
                        </div>
                      </div>
                    </fieldset>

                    <div className="pt-2">
                      <PatientButton type="submit" variant="outline" size="sm" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Preferences'}
                      </PatientButton>
                    </div>
                  </div>
                </form>
              </PatientCard>

              <PatientCard title="Account Settings" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Subscription & Billing</h4>
                    <button
                      onClick={() => navigate('/subscription-management')}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <CreditCard size={16} />
                      Manage Subscription
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      View your current plan, usage, and billing history
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Data Management</h4>
                    <button
                      onClick={handleExportData}
                      disabled={exportingData}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <Download size={16} />
                      {exportingData ? 'Exporting...' : 'Export My Data'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Download all your profile data, appointments, and medical records as a JSON file
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Danger Zone</h4>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                    >
                      <AlertTriangle size={16} />
                      Delete Account
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </PatientCard>
            </div>
          </div>
        </div>
      </PatientLayout>
    );
};

export default PatientSettings;
