import axios from 'axios';
import type { LoginFormData, SignupFormData, AuthResponse } from '../../shared/types/auth';
import type { SystemSettings } from '../../shared/types/settings';
import type { SecurityLog, SecurityStats } from '../../shared/types/security';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses (token expired/invalid)
    if (error.response?.status === 401) {
      console.warn('Unauthorized request detected, clearing auth data...');

      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('notifications');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden responses (insufficient permissions)
    if (error.response?.status === 403) {
      console.warn('Forbidden request detected, insufficient permissions');

      // Redirect to appropriate dashboard or unauthorized page
      const role = localStorage.getItem('role');
      const dashboardPath = role === 'patient' ? '/dashboard'
        : role === 'doctor' ? '/doctor/dashboard'
        : role === 'admin' ? '/admin/dashboard'
        : '/unauthorized';

      if (window.location.pathname !== dashboardPath) {
        window.location.href = dashboardPath;
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    
    // Store user data and token in localStorage for persistence
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.user.role);
    localStorage.setItem('name', response.data.user.name || '');
    
    // Store full user object for easy access
    const userData = {
      id: response.data.user._id,
      name: response.data.user.name || '',
      email: response.data.user.email || '',
      role: response.data.user.role
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },

  async signup(data: SignupFormData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/api/auth/signup', data);
    return response.data;
  },

  async logout() {
    try {
      // Call the backend logout endpoint to log the security event
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error logging logout event:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('notifications');
    
    return true;
  }
};

export const userService = {
  // Get all users for admin dashboard
  async getAllUsers() {
    const response = await api.get('/api/users');
    return response.data;
  },

  // Update user status (activate, deactivate, etc)
  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'pending') {
    const response = await api.put(`/api/users/${userId}`, { status });
    return response.data;
  },
  
  // Delete a user account
  async deleteUser(userId: string) {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },

  // Get user by ID
  async getUserById(userId: string) {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  }
};

export const appointmentService = {
  // Get all appointments for admin dashboard
  async getAllAppointments() {
    const response = await api.get('/api/appointments/all');
    return response.data;
  },
  
  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: 'pending' | 'approved' | 'rejected') {
    const response = await api.put(`/api/appointments/update-status/${appointmentId}`, { status });
    return response.data;
  },
  
  // Get appointments for the logged in doctor
  async getDoctorAppointments() {
    const response = await api.get('/api/appointments/doctor');
    return response.data;
  },
  
  // Get appointments for the logged in patient
  async getPatientAppointments() {
    const response = await api.get('/api/appointments/patient');
    return response.data;
  },

  // Book a new appointment
  async bookAppointment(appointmentData: any) {
    const response = await api.post('/api/appointments/book', appointmentData);
    return response.data;
  }
};

export const prescriptionService = {
  // Get all prescriptions for admin dashboard
  async getAllPrescriptions() {
    const response = await api.get('/api/prescriptions/all');
    return response.data;
  },
  
  // Get prescriptions for the logged in doctor
  async getDoctorPrescriptions() {
    const response = await api.get('/api/prescriptions/doctor');
    return response.data;
  },
  
  // Get prescriptions for the logged in patient
  async getPatientPrescriptions() {
    const response = await api.get('/api/prescriptions/patient');
    return response.data;
  },

  // Add a new prescription (for doctors)
  async addPrescription(prescriptionData: any) {
    const response = await api.post('/api/prescriptions/add', prescriptionData);
    return response.data;
  }
};

// Default system settings to use if none are stored
const defaultSettings: SystemSettings = {
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
};

export const settingsService = {
  // Get system settings
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get('/api/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings if API call fails
      return defaultSettings;
    }
  },

  // Save system settings
  async saveSystemSettings(settingsData: SystemSettings) {
    try {
      const response = await api.put('/api/admin/settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error saving settings:', error);

      // Handle different error types
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied. Admin privileges required.'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Invalid settings data'
        };
      } else {
        return {
          success: false,
          message: 'Failed to save settings. Please try again.'
        };
      }
    }
  },

  // Reset settings to default
  async resetSystemSettings() {
    try {
      const response = await api.delete('/api/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error resetting settings:', error);

      // Handle different error types
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied. Admin privileges required.'
        };
      } else {
        return {
          success: false,
          message: 'Failed to reset settings. Please try again.'
        };
      }
    }
  }
};

export const securityLogService = {
  // Get all security logs for admin dashboard
  async getAllLogs() {
    const response = await api.get('/api/security-logs/all');
    return response.data;
  },
  
  // Get logs filtered by severity
  async getLogsBySeverity(severity: 'high' | 'medium' | 'warning' | 'info' | 'all') {
    const response = await api.get(`/api/security-logs/severity/${severity}`);
    return response.data;
  },
  
  // Get logs filtered by time range
  async getLogsByTimeRange(hours: string) {
    const response = await api.get(`/api/security-logs/timerange/${hours}`);
    return response.data;
  },
  
  // Get security dashboard stats
  async getSecurityStats() {
    const response = await api.get('/api/security-logs/stats');
    return response.data;
  },
  
  // Add a new security log
  async addLog(logData: Omit<SecurityLog, 'id' | '_id' | 'timestamp'>) {
    const response = await api.post('/api/security-logs/add', logData);
    return response.data;
  },
  
  // Send security alert to all users
  async sendSecurityAlert(message?: string) {
    const response = await api.post('/api/security-logs/alert', { message });
    return response.data;
  },
  
  // Resolve a security alert
  async resolveSecurityAlert(alertId: string) {
    const response = await api.post(`/api/security-logs/resolve/${alertId}`, {});
    return response.data;
  },

  // Send "Security Issue Solved" notification to all users
  async sendSecurityIssueSolved(message?: string) {
    const response = await api.post('/api/security-logs/issue-solved', { message });
    return response.data;
  },

  // Export security logs to CSV
  async exportLogs() {
    try {
      const response = await api.get('/api/security-logs/export', {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      link.setAttribute('download', `security-logs-${dateStr}.csv`);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Security logs exported successfully' };
    } catch (error) {
      console.error('Error exporting security logs:', error);
      throw new Error('Failed to export security logs');
    }
  }
};

// AI Service API - for AI Consultation feature only
export const aiService = {
  // RAG-powered chat for AI consultation
  async chat(message: string, conversationHistory?: any[], conversationId?: string) {
    const response = await api.post('/api/ai/chat', {
      message,
      conversation_history: conversationHistory,
      conversation_id: conversationId
    });
    return response.data;
  }
};

// AI History Service API - for patient AI history management
export const aiHistoryService = {
  // Get symptom checker history
  async getSymptomCheckerHistory(page = 1, limit = 10, sortBy = 'timestamp', sortOrder = 'desc') {
    const response = await api.get(`/api/patient/ai-history/symptoms?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    return response.data;
  },

  // Get consultation history
  async getConsultationHistory(page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc') {
    const response = await api.get(`/api/patient/ai-history/consultations?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    return response.data;
  },

  // Get AI usage statistics
  async getAIUsageStats() {
    const response = await api.get('/api/patient/ai-history/stats');
    return response.data;
  },

  // Get AI history summary for dashboard
  async getAIHistorySummary() {
    const response = await api.get('/api/patient/ai-history/summary');
    return response.data;
  },

  // Get specific symptom checker session
  async getSymptomCheckerSession(sessionId: string) {
    const response = await api.get(`/api/patient/ai-history/symptoms/${sessionId}`);
    return response.data;
  },

  // Get specific consultation session
  async getConsultationSession(sessionId: string) {
    const response = await api.get(`/api/patient/ai-history/consultations/${sessionId}`);
    return response.data;
  },

  // Submit feedback for symptom checker session
  async submitSymptomCheckerFeedback(sessionId: string, feedback: { helpful?: boolean, rating?: number, comments?: string }) {
    const response = await api.post(`/api/patient/ai-history/symptoms/${sessionId}/feedback`, feedback);
    return response.data;
  },

  // Submit satisfaction rating for consultation session
  async submitConsultationSatisfaction(sessionId: string, satisfaction: { rating?: number, feedback?: string }) {
    const response = await api.post(`/api/patient/ai-history/consultations/${sessionId}/satisfaction`, satisfaction);
    return response.data;
  },

  // Delete AI session
  async deleteAISession(sessionId: string, type: 'symptom' | 'consultation') {
    const response = await api.delete(`/api/patient/ai-history/session/${sessionId}?type=${type}`);
    return response.data;
  },

  // Export AI history data
  async exportAIHistory() {
    const response = await api.get('/api/patient/ai-history/export');
    return response.data;
  }
};

// Subscription Service API - for subscription management
export const subscriptionService = {
  // Get available subscription plans
  async getPlans() {
    const response = await api.get('/api/subscriptions/plans');
    return response.data;
  },

  // Get current user's subscription
  async getCurrentSubscription() {
    const response = await api.get('/api/subscriptions/current');
    return response.data;
  },

  // Update subscription (upgrade/downgrade)
  async updateSubscription(tier: string, paymentMethodId?: string) {
    const response = await api.post('/api/subscriptions/update', {
      tier,
      paymentMethodId,
    });
    return response.data;
  },

  // Cancel subscription
  async cancelSubscription(reason?: string) {
    const response = await api.post('/api/subscriptions/cancel', {
      reason,
    });
    return response.data;
  },

  // Get subscription analytics (admin only)
  async getAnalytics(period = 'monthly') {
    const response = await api.get(`/api/subscriptions/analytics?period=${period}`);
    return response.data;
  },
};

// Usage Tracking Service API - for usage monitoring
export const usageService = {
  // Get current usage statistics
  async getCurrentUsage() {
    const response = await api.get('/api/usage/current');
    return response.data;
  },

  // Get usage history
  async getUsageHistory(period = 'monthly', limit = 12) {
    const response = await api.get(`/api/usage/history?period=${period}&limit=${limit}`);
    return response.data;
  },

  // Check if user can perform action
  async checkActionLimit(action: string) {
    const response = await api.get(`/api/usage/check/${action}`);
    return response.data;
  },

  // Get usage summary for dashboard
  async getUsageSummary() {
    const response = await api.get('/api/usage/summary');
    return response.data;
  },

  // Get usage analytics (admin only)
  async getAnalytics(period = 'monthly', days = 30) {
    const response = await api.get(`/api/usage/analytics?period=${period}&days=${days}`);
    return response.data;
  },

  // Reset user usage (admin only)
  async resetUserUsage(userId: string, period = 'monthly') {
    const response = await api.post(`/api/usage/reset/${userId}`, { period });
    return response.data;
  },
};

// Admin AI Analytics Service API - for admin dashboard analytics
export const adminAIAnalyticsService = {
  // Get system-wide AI usage overview
  async getAIUsageOverview() {
    const response = await api.get('/api/admin/ai-analytics/overview');
    return response.data;
  },

  // Get AI usage trends over time
  async getAIUsageTrends(period = '30d') {
    const response = await api.get(`/api/admin/ai-analytics/trends?period=${period}`);
    return response.data;
  },

  // Get AI performance metrics
  async getAIPerformanceMetrics() {
    const response = await api.get('/api/admin/ai-analytics/performance');
    return response.data;
  },

  // Get top AI users
  async getTopAIUsers(limit = 10) {
    const response = await api.get(`/api/admin/ai-analytics/top-users?limit=${limit}`);
    return response.data;
  },

  // Get detailed user AI activity
  async getUserAIActivity(userId: string) {
    const response = await api.get(`/api/admin/ai-analytics/user/${userId}`);
    return response.data;
  },

  // Get AI system health metrics
  async getSystemHealth() {
    const response = await api.get('/api/admin/ai-analytics/system-health');
    return response.data;
  },

  // Get top symptoms from symptom checker
  async getTopSymptoms() {
    const response = await api.get('/api/admin/ai-analytics/top-symptoms');
    return response.data;
  },

  // Get system trends (user registrations, etc.)
  async getSystemTrends(period = '30d') {
    const response = await api.get(`/api/admin/ai-analytics/system-trends?period=${period}`);
    return response.data;
  }
};

// Admin Plan Management Service
export const adminPlanService = {
  // Get all users with subscription information
  getUsersWithSubscriptions: async (params?: { page?: number; limit?: number; search?: string; tier?: string }) => {
    const response = await api.get('/api/admin/users-with-subscriptions', { params });
    return response.data;
  },

  // Change a user's subscription plan
  changeUserPlan: async (userId: string, newTier: string, reason: string) => {
    const response = await api.post('/api/admin/change-user-plan', {
      userId,
      newTier,
      reason
    });
    return response.data;
  },

  // Get plan change audit logs
  getPlanChangeLogs: async (params?: { page?: number; limit?: number; userId?: string; type?: string }) => {
    const response = await api.get('/api/admin/plan-change-logs', { params });
    return response.data;
  },

  // Get subscription statistics
  getSubscriptionStats: async () => {
    const response = await api.get('/api/admin/subscription-stats');
    return response.data;
  },

  // Bulk plan changes
  bulkChangePlans: async (userIds: string[], newTier: string, reason: string) => {
    const response = await api.post('/api/admin/bulk-change-plans', {
      userIds,
      newTier,
      reason
    });
    return response.data;
  },
};

export default api;