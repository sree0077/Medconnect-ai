import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { settingsService } from '../../shared/services/api';
import { SystemSettings } from '../../shared/types/settings';

export const AdminSystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    // General Settings
    platformName: 'MedConnect AI',
    supportEmail: 'support@medconnect.ai',
    timezone: 'UTC-5 (Eastern)',
    maintenanceMode: false,
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    loginAttempts: 5,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    doctorApprovalNotifs: true,
    
    // AI Settings
    aiResponseTime: 2,
    confidenceThreshold: 85,
    autoLearnEnabled: true,
    debugMode: false,
  });
  
  // Fetch settings from service on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getSystemSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load settings. Using default values.'
        });
        // Auto-dismiss error after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSettingChange = <T extends keyof SystemSettings>(key: T, value: SystemSettings[T]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'ai', name: 'AI Configuration', icon: Database },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
      </div>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="UTC-8 (Pacific)">UTC-8 (Pacific)</option>
                      <option value="UTC-7 (Mountain)">UTC-7 (Mountain)</option>
                      <option value="UTC-6 (Central)">UTC-6 (Central)</option>
                      <option value="UTC-5 (Eastern)">UTC-5 (Eastern)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Maintenance Mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Policy
                    </label>
                    <select
                      value={settings.passwordPolicy}
                      onChange={(e) => handleSettingChange('passwordPolicy', e.target.value as 'basic' | 'strong' | 'strict')}
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="basic">Basic (8+ characters)</option>
                      <option value="strong">Strong (8+ chars, mixed case, numbers)</option>
                      <option value="strict">Strict (12+ chars, mixed case, numbers, symbols)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.loginAttempts}
                      onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Send system notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">System Alerts</h4>
                      <p className="text-sm text-gray-600">Receive alerts for system events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.systemAlerts}
                      onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Doctor Approval Notifications</h4>
                      <p className="text-sm text-gray-600">Notify when new doctors register</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.doctorApprovalNotifs}
                      onChange={(e) => handleSettingChange('doctorApprovalNotifs', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Response Time (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.aiResponseTime}
                      onChange={(e) => handleSettingChange('aiResponseTime', parseInt(e.target.value))}
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={settings.confidenceThreshold}
                      onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum confidence level for AI responses</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto-Learning</h4>
                      <p className="text-sm text-gray-600">Allow AI to learn from interactions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoLearnEnabled}
                      onChange={(e) => handleSettingChange('autoLearnEnabled', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Debug Mode</h4>
                      <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.debugMode}
                      onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification && (
            <div className={`mt-6 p-3 rounded-lg flex items-center ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          )}
          
          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await settingsService.resetSystemSettings();
                    const defaultSettings = await settingsService.getSystemSettings();
                    setSettings(defaultSettings);
                    
                    if (response.success) {
                      setNotification({
                        type: 'success',
                        message: 'Settings reset to defaults successfully'
                      });
                    } else {
                      setNotification({
                        type: 'error',
                        message: response.message || 'Failed to reset settings'
                      });
                    }
                    setTimeout(() => setNotification(null), 3000);
                  } catch (error) {
                    console.error('Error resetting settings:', error);
                    setNotification({
                      type: 'error',
                      message: 'Failed to reset settings'
                    });
                    setTimeout(() => setNotification(null), 3000);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                type="button"
              >
                {loading ? 'Resetting...' : 'Reset to Defaults'}
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await settingsService.saveSystemSettings(settings);
                    
                    if (response.success) {
                      setNotification({
                        type: 'success',
                        message: 'Settings saved successfully'
                      });
                    } else {
                      setNotification({
                        type: 'error',
                        message: response.message || 'Failed to save settings'
                      });
                    }
                    setTimeout(() => setNotification(null), 3000);
                  } catch (error) {
                    console.error('Error saving settings:', error);
                    setNotification({
                      type: 'error',
                      message: 'Failed to save settings'
                    });
                    setTimeout(() => setNotification(null), 3000);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                type="button"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};