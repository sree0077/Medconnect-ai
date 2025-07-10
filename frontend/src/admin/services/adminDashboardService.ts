import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types for dashboard data
export interface DashboardStatistic {
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface WeeklyActivityData {
  name: string;
  users: number;
  appointments: number;
  aiSessions: number;
}

export interface RecentActivity {
  id: string;
  type: 'approval' | 'user' | 'appointment' | 'ai' | 'system';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export interface SystemHealth {
  status: string;
  uptime: string;
  activeUsers: number;
  pendingUsers: number;
}

export interface DashboardOverviewData {
  statistics: {
    totalUsers: DashboardStatistic;
    approvedDoctors: DashboardStatistic;
    appointmentsToday: DashboardStatistic;
    aiSessionsActive: DashboardStatistic;
  };
  weeklyActivity: WeeklyActivityData[];
  recentActivities: RecentActivity[];
  systemHealth: SystemHealth;
}

class AdminDashboardService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async getDashboardOverview(): Promise<DashboardOverviewData> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/overview`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw new Error('Failed to fetch dashboard overview');
    }
  }

  // Legacy dashboard endpoint (for backward compatibility)
  async getDashboard(): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/dashboard`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw new Error('Failed to fetch dashboard');
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<any> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/admin/users/${userId}/status`,
        { status },
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }
  }
}

export const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
