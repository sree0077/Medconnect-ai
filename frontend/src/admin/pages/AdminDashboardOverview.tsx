import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStatCard } from '../components/AdminStatCard';
import { Users, UserCheck, Calendar, Brain, Activity, TrendingUp, Clock } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { adminDashboardService, DashboardOverviewData } from '../services/adminDashboardService';

export const AdminDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await adminDashboardService.getDashboardOverview();
        setData(dashboardData);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigation handlers for quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'review-doctors':
        navigate('/admin/doctors');
        break;
      case 'view-appointments':
        navigate('/admin/appointments');
        break;
      case 'ai-analytics':
        navigate('/admin/analytics');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Handler for view all activities
  const handleViewAllActivities = () => {
    navigate('/admin/security');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="h-9 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-80 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading dashboard data</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          No dashboard data available
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Total Users"
          value={data.statistics.totalUsers.value}
          change={data.statistics.totalUsers.change}
          changeType={data.statistics.totalUsers.changeType}
          icon={Users}
          iconColor="text-purple-600"
        />
        <AdminStatCard
          title="Approved Doctors"
          value={data.statistics.approvedDoctors.value}
          change={data.statistics.approvedDoctors.change}
          changeType={data.statistics.approvedDoctors.changeType}
          icon={UserCheck}
          iconColor="text-green-600"
        />
        <AdminStatCard
          title="Appointments Today"
          value={data.statistics.appointmentsToday.value}
          change={data.statistics.appointmentsToday.change}
          changeType={data.statistics.appointmentsToday.changeType}
          icon={Calendar}
          iconColor="text-blue-600"
        />
        <AdminStatCard
          title="AI Sessions Active"
          value={data.statistics.aiSessionsActive.value}
          change={data.statistics.aiSessionsActive.change}
          changeType={data.statistics.aiSessionsActive.changeType}
          icon={Brain}
          iconColor="text-teal-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-600">User engagement and system usage</p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">+15.3%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.weeklyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                formatter={(value: any, name: any) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name === 'users' ? 'Active Users' :
                  name === 'appointments' ? 'Appointments' :
                  name === 'aiSessions' ? 'AI Sessions' : name
                ]}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="users"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
                name="users"
              />
              <Area
                type="monotone"
                dataKey="appointments"
                stackId="1"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.2}
                name="appointments"
              />
              <Area
                type="monotone"
                dataKey="aiSessions"
                stackId="1"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.2}
                name="aiSessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest system events and updates</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {data.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-purple-50/50 transition-colors">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'error' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleViewAllActivities}
              className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all cursor-pointer"
            >
              View all activities →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickAction('review-doctors')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group cursor-pointer"
          >
            <div className="text-center">
              <UserCheck className="h-8 w-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Review Doctors</span>
            </div>
          </button>
          <button
            onClick={() => handleQuickAction('view-appointments')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group cursor-pointer"
          >
            <div className="text-center">
              <Calendar className="h-8 w-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">View Appointments</span>
            </div>
          </button>
          <button
            onClick={() => handleQuickAction('ai-analytics')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group cursor-pointer"
          >
            <div className="text-center">
              <Brain className="h-8 w-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">AI Analytics</span>
            </div>
          </button>
          <button
            onClick={() => handleQuickAction('manage-users')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group cursor-pointer"
          >
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Manage Users</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
