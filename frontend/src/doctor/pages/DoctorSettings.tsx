import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Download, AlertTriangle } from 'lucide-react';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorButton } from '../components/DoctorButton';
import useNotifications from '../../shared/hooks/useNotifications';
import { SkeletonForm, SkeletonText, SkeletonCard } from '../../shared/components/skeleton';

interface DoctorProfile {
  name: string;
  email: string;
  specialization: string;
  phone: string;
  address: string;
  bio: string;
  experience: number;
  qualifications: string[];
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  appointmentReminders: boolean;
  patientUpdates: boolean;
  systemUpdates: boolean;
}

const DoctorSettings: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();

  const [doctor, setDoctor] = useState<DoctorProfile>({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    address: '',
    bio: '',
    experience: 0,
    qualifications: [],
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    appointmentReminders: true,
    patientUpdates: true,
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

  // Qualifications management
  const [newQualification, setNewQualification] = useState('');

  // Load user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data;
        setDoctor({
          name: userData.name || '',
          email: userData.email || '',
          specialization: userData.specialization || '',
          phone: userData.phone || '',
          address: userData.address || '',
          bio: userData.bio || '',
          experience: userData.experience || 0,
          qualifications: userData.qualifications || [],
        });

        if (userData.notificationPreferences) {
          setNotifications(userData.notificationPreferences);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);





  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctor(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  // Qualifications management
  const addQualification = () => {
    if (newQualification.trim()) {
      setDoctor(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setDoctor(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
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
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/doctor`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/prescriptions/doctor`, {
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
      link.download = `doctor-data-export-${new Date().toISOString().split('T')[0]}.json`;
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
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including appointments and prescriptions.'
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
      const updateData = {
        ...doctor,
        notificationPreferences: notifications,
      };

      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      notifySuccess('Profile Updated', 'Your profile has been updated successfully!');

      // Update local storage with new name if changed
      if (response.data.user && response.data.user.name) {
        localStorage.setItem('name', response.data.user.name);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
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
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
        notificationPreferences: notifications,
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
      <DoctorLayout>
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
            fields={8}
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
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="md:col-span-2">
            <DoctorCard title="Profile Settings">
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
                        value={doctor.name}
                        onChange={handleDoctorChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
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
                        value={doctor.email}
                        disabled
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={doctor.specialization}
                        onChange={handleDoctorChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                        placeholder="e.g., Cardiologist, Neurologist"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={doctor.phone}
                        onChange={handleDoctorChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experience"
                        name="experience"
                        value={doctor.experience}
                        onChange={handleDoctorChange}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={doctor.address}
                        onChange={handleDoctorChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                        placeholder="Clinic/Hospital address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={doctor.bio}
                      onChange={handleDoctorChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                      placeholder="Brief description of your medical background and expertise"
                    />
                  </div>

                  {/* Qualifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualifications
                    </label>
                    <div className="space-y-2">
                      {doctor.qualifications.map((qualification, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-sm text-gray-700">{qualification}</span>
                          <button
                            type="button"
                            onClick={() => removeQualification(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newQualification}
                          onChange={(e) => setNewQualification(e.target.value)}
                          placeholder="Add new qualification"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                        />
                        <DoctorButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addQualification}
                          icon={<Plus size={16} />}
                        >
                          Add
                        </DoctorButton>
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
                              />
                            </div>

                            {passwordError && (
                              <div className="text-sm text-red-600">{passwordError}</div>
                            )}

                            {passwordSuccess && (
                              <div className="text-sm text-green-600">{passwordSuccess}</div>
                            )}

                            <div className="flex gap-2">
                              <DoctorButton
                                type="submit"
                                size="sm"
                                disabled={changingPassword}
                              >
                                {changingPassword ? 'Changing...' : 'Change Password'}
                              </DoctorButton>
                              <DoctorButton
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordForm(false)}
                              >
                                Cancel
                              </DoctorButton>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <DoctorButton type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </DoctorButton>
                  </div>
                </div>
              </form>
            </DoctorCard>
          </div>

          {/* Notification Settings */}
          <div>
            <DoctorCard title="Notification Settings">
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
                          id="patient-updates"
                          name="patientUpdates"
                          type="checkbox"
                          checked={notifications.patientUpdates}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="patient-updates"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Patient Updates
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
                    <DoctorButton type="submit" variant="outline" size="sm">
                      Save Preferences
                    </DoctorButton>
                  </div>
                </div>
              </form>
            </DoctorCard>

            <DoctorCard title="Account Settings" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Data Management</h4>
                  <DoctorButton
                    onClick={handleExportData}
                    disabled={exportingData}
                    variant="outline"
                    size="sm"
                    icon={<Download size={16} />}
                  >
                    {exportingData ? 'Exporting...' : 'Export My Data'}
                  </DoctorButton>
                  <p className="text-xs text-gray-500 mt-1">
                    Download all your profile data, appointments, and prescriptions as a JSON file
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Danger Zone</h4>
                  <DoctorButton
                    onClick={handleDeleteAccount}
                    variant="danger"
                    size="sm"
                    icon={<AlertTriangle size={16} />}
                  >
                    Delete Account
                  </DoctorButton>
                  <p className="text-xs text-gray-500 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </DoctorCard>


          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorSettings;
