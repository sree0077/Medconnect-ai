import React, { useState, useEffect } from 'react';
import { AdminStatCard } from '../components/AdminStatCard';
import {
  DollarSign,
  Users,
  Crown,
  Zap,
  Building,
  Download
} from 'lucide-react';
import { subscriptionService } from '../../shared/services/api';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SubscriptionAnalytics {
  subscriptionDistribution: Array<{
    _id: string;
    count: number;
    activeUsers: number;
  }>;
  usageStatistics: Array<{
    _id: string;
    totalUsers: number;
    avgAIMessages: number;
    totalAIMessages: number;
    avgAppointments: number;
    totalAppointments: number;
  }>;
  revenueStatistics: Array<{
    _id: string;
    count: number;
    monthlyRevenue: number;
  }>;
  summary: {
    totalUsers: number;
    totalRevenue: number;
    period: string;
  };
}

const AdminSubscriptionAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const subscriptionData = await subscriptionService.getAnalytics(selectedPeriod);
      
      setAnalytics(subscriptionData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setError('Failed to load subscription analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return Crown;
      case 'pro': return Zap;
      case 'clinic': return Building;
      default: return Users;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return '#6B7280';
      case 'pro': return '#7C3AED';
      case 'clinic': return '#2563EB';
      default: return '#6B7280';
    }
  };

  // Prepare chart data
  const subscriptionChartData = analytics ? {
    labels: analytics.subscriptionDistribution.map(item => 
      item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown'
    ),
    datasets: [
      {
        data: analytics.subscriptionDistribution.map(item => item.count),
        backgroundColor: analytics.subscriptionDistribution.map(item => getTierColor(item._id)),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  } : null;

  const revenueChartData = analytics ? {
    labels: analytics.revenueStatistics.map(item => 
      item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Free'
    ),
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: analytics.revenueStatistics.map(item => item.monthlyRevenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={loadAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Subscription Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor subscription metrics, revenue, and user distribution
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
            
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AdminStatCard
              title="Total Users"
              value={analytics.summary.totalUsers}
              change="+12% from last month"
              changeType="increase"
              icon={Users}
              iconColor="text-blue-600"
            />
            <AdminStatCard
              title="Monthly Revenue"
              value={`$${analytics.summary.totalRevenue.toLocaleString()}`}
              change="+8% from last month"
              changeType="increase"
              icon={DollarSign}
              iconColor="text-green-600"
            />
            <AdminStatCard
              title="Pro Subscribers"
              value={analytics.revenueStatistics.find(r => r._id === 'pro')?.count || 0}
              change="+15% from last month"
              changeType="increase"
              icon={Zap}
              iconColor="text-purple-600"
            />
            <AdminStatCard
              title="Clinic Subscribers"
              value={analytics.revenueStatistics.find(r => r._id === 'clinic')?.count || 0}
              change="+5% from last month"
              changeType="increase"
              icon={Building}
              iconColor="text-blue-600"
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subscription Distribution
            </h3>
            {subscriptionChartData && (
              <div className="h-64">
                <Doughnut data={subscriptionChartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue by Plan
            </h3>
            {revenueChartData && (
              <div className="h-64">
                <Bar data={revenueChartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription Breakdown
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.subscriptionDistribution.map((item, index) => {
                  const Icon = getTierIcon(item._id);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" style={{ color: getTierColor(item._id) }} />
                        <span className="font-medium capitalize">
                          {item._id || 'Unknown'} Plan
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.count} users</div>
                        <div className="text-sm text-gray-500">
                          {item.activeUsers} active
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Usage Statistics
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.usageStatistics.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{item._id} Users</span>
                      <span className="text-sm text-gray-500">{item.totalUsers} users</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Avg AI Messages:</span>
                        <span className="ml-2 font-medium">{item.avgAIMessages.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Appointments:</span>
                        <span className="ml-2 font-medium">{item.avgAppointments.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminSubscriptionAnalytics;
