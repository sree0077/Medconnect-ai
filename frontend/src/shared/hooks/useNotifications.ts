import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'prescription';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    alertId?: string;
    requiresAction?: boolean;
    resolved?: boolean;
    [key: string]: any;
  };
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  appointmentReminders: boolean;
  patientUpdates: boolean;
  systemUpdates: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    appointmentReminders: true,
    patientUpdates: true,
    systemUpdates: true,
  });



  // Load notifications from server on mount
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        localStorage.removeItem('notifications');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const serverNotifications = response.data.notifications.map((n: any) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: n.read,
      }));

      setNotifications(serverNotifications);

      // Update localStorage with fresh server data
      localStorage.setItem('notifications', JSON.stringify(serverNotifications));
    } catch (error) {
      console.error('Error fetching notifications:', error);

      // Don't fall back to localStorage to avoid stale data
      // Instead, keep current state or clear if it's a 401 error
      if (error.response?.status === 401) {
        setNotifications([]);
        localStorage.removeItem('notifications');
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Load preferences from localStorage
    try {
      const storedPrefs = localStorage.getItem('notificationPreferences');
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }

    // Set up polling for real-time notifications (every 5 seconds for better responsiveness)
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const addNotification = useCallback(async (
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    // Check for duplicate notifications (same title and message within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isDuplicate = notifications.some(n =>
      n.title === title &&
      n.message === message &&
      n.timestamp > fiveMinutesAgo
    );

    if (isDuplicate) {
      console.log('Duplicate notification prevented:', title);
      return null;
    }

    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    };

    // Add to local state immediately for instant feedback
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    // Try to save to server (for persistence across sessions)
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
          title,
          message,
          type
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error saving notification to server:', error);
      // Keep local notification even if server save fails
    }

    // Auto-dismiss success notifications after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setNotifications(prev => {
          const filtered = prev.filter(n => n.id !== notification.id);
          localStorage.setItem('notifications', JSON.stringify(filtered));
          return filtered;
        });
      }, 5000);
    }

    return notification.id;
  }, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedNotifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  const dismissNotification = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const updatedNotifications = notifications.filter(n => n.id !== id);
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        return;
      }

      // Remove from local state immediately for better UX
      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

      // Try to delete from server
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error dismissing notification from server:', error);

      // Notification is already removed from local state and localStorage
      // In case of server error, we keep the local deletion for better UX
      if (error.response?.status === 401) {
        // If unauthorized, clear all data
        setNotifications([]);
        localStorage.removeItem('notifications');
        localStorage.removeItem('token');
      }
    }
  }, [notifications]);

  const clearAllNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Clear from server
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error clearing notifications from server:', error);
    }

    // Clear from local state and storage
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  // Real-time notifications would be handled by WebSocket or polling in production
  // Removed simulated notifications to prevent spam

  // Notification methods for different types
  const notifySuccess = useCallback((title: string, message: string) => {
    return addNotification('success', title, message);
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string) => {
    return addNotification('error', title, message);
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string) => {
    return addNotification('warning', title, message);
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string) => {
    return addNotification('info', title, message);
  }, [addNotification]);

  // Appointment-specific notifications
  const notifyAppointmentBooked = useCallback((doctorName: string, date: string, time: string) => {
    if (preferences.appointmentReminders) {
      notifySuccess(
        'Appointment Booked',
        `Your appointment with Dr. ${doctorName} is scheduled for ${date} at ${time}.`
      );
    }
  }, [preferences.appointmentReminders, notifySuccess]);

  const notifyAppointmentStatusChanged = useCallback((status: string, doctorName: string) => {
    if (preferences.appointmentReminders) {
      const type = status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info';
      addNotification(
        type,
        'Appointment Status Updated',
        `Your appointment with Dr. ${doctorName} has been ${status}.`
      );
    }
  }, [preferences.appointmentReminders, addNotification]);

  const notifyPrescriptionReceived = useCallback((doctorName: string) => {
    if (preferences.patientUpdates) {
      notifyInfo(
        'New Prescription',
        `You have received a new prescription from Dr. ${doctorName}.`
      );
    }
  }, [preferences.patientUpdates, notifyInfo]);

  // Check specifically for security alerts
  const checkSecurityAlerts = useCallback(() => {
    const securityAlerts = notifications.filter(
      notification => 
        notification.title.includes('SECURITY ALERT') && 
        notification.data?.requiresAction === true &&
        !notification.read
    );
    
    if (securityAlerts.length > 0) {
      // Show a system alert for high priority security notifications
      const alertMessage = securityAlerts[0].message || 'Security alert: Please log out of the system';
      
      // Use the browser's built-in alert functionality
      alert(`⚠️ SECURITY ALERT\n\n${alertMessage}\n\nPlease log out immediately for your safety.`);
      
      // Option to automatically log out the user
      if (window.confirm('Would you like to log out now?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }, [notifications]);

  // Check for security alerts when notifications change
  useEffect(() => {
    checkSecurityAlerts();
  }, [checkSecurityAlerts]);

  // Manual refresh function for immediate updates
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    preferences,
    setPreferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    refreshNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyAppointmentBooked,
    notifyAppointmentStatusChanged,
    notifyPrescriptionReceived,
  };
};

export default useNotifications;
