import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, TrendingUp, Users, Activity, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAIAnalyticsService } from '../../shared/services/api';
import { AreaChartSkeleton, PieChartSkeleton, LineChartSkeleton, MetricCardSkeleton, AIAnalyticsPageSkeleton } from '../components/ChartSkeletons';

export const AdminAIAnalytics: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Data state
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [topSymptoms, setTopSymptoms] = useState<any>(null);
  const [systemTrends, setSystemTrends] = useState<any>(null);

  // Fetch all data
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [overviewData, trendsData, performanceData, topUsersData, systemHealthData, topSymptomsData, systemTrendsData] = await Promise.all([
        adminAIAnalyticsService.getAIUsageOverview(),
        adminAIAnalyticsService.getAIUsageTrends(selectedPeriod),
        adminAIAnalyticsService.getAIPerformanceMetrics(),
        adminAIAnalyticsService.getTopAIUsers(10),
        adminAIAnalyticsService.getSystemHealth(),
        adminAIAnalyticsService.getTopSymptoms(),
        adminAIAnalyticsService.getSystemTrends(selectedPeriod)
      ]);

      setOverview(overviewData.overview);
      setTrends(trendsData.trends);
      setPerformance(performanceData.metrics);
      setTopUsers(topUsersData.topUsers);
      setSystemHealth(systemHealthData.systemHealth);
      setTopSymptoms(topSymptomsData);
      setSystemTrends(systemTrendsData.trends);
    } catch (err) {
      console.error('Error fetching AI analytics data:', err);
      setError('Failed to load AI analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  // Refresh data
  const handleRefresh = () => {
    fetchData(true);
  };

  // Transform trends data for daily usage chart - Fix consultation data display
  const dailyAIUsage = trends && trends.length > 0 ? (() => {
    // For daily chart, show last 7 days regardless of selected period
    const last7Days = trends.slice(-7);
    return last7Days.map((day: any) => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      symptomChecks: day.symptomChecks || 0,
      consultations: day.consultations || 0, // Fixed: use 'consultations' instead of 'chatSessions'
      totalInteractions: day.totalInteractions || 0
    }));
  })() : [];

  // Use real top symptoms data from API
  const topSymptomsData = topSymptoms?.topSymptoms || [];

  // Transform performance data with proper field mapping
  const aiPerformanceData = performance ? [
    {
      metric: 'Response Time',
      value: performance.performance?.averageResponseTime ?
        `${(performance.performance.averageResponseTime / 1000).toFixed(1)}s` : '0s',
      trend: performance.performance?.averageResponseTime < 2000 ? '+5%' : '-2%',
      trendType: performance.performance?.averageResponseTime < 2000 ? 'positive' : 'negative'
    },
    {
      metric: 'Confidence Rate',
      value: `${Math.round((performance.confidence?.overall || 0) * 100) / 100}%`,
      trend: performance.confidence?.overall > 80 ? '+2.1%' : '-1.5%',
      trendType: performance.confidence?.overall > 80 ? 'positive' : 'negative'
    },
    {
      metric: 'Success Rate',
      value: `${performance.performance?.successRate || 0}%`,
      trend: performance.performance?.successRate > 90 ? '+1.3%' : '-1.3%',
      trendType: performance.performance?.successRate > 90 ? 'positive' : 'negative'
    },
    {
      metric: 'User Satisfaction',
      value: performance.userSatisfaction?.averageRating ?
        `${Math.round(performance.userSatisfaction.averageRating * 100) / 100}/5` : '0/5',
      trend: performance.userSatisfaction?.averageRating > 4 ? '+0.2' : '-0.1',
      trendType: performance.userSatisfaction?.averageRating > 4 ? 'positive' : 'negative'
    },
  ] : [
    { metric: 'Response Time', value: '0s', trend: '0%', trendType: 'neutral' },
    { metric: 'Confidence Rate', value: '0%', trend: '0%', trendType: 'neutral' },
    { metric: 'Success Rate', value: '0%', trend: '0%', trendType: 'neutral' },
    { metric: 'User Satisfaction', value: '0/5', trend: '0', trendType: 'neutral' },
  ];

  // Transform system trends data for the line chart
  const systemTrendsData = systemTrends && systemTrends.length > 0 ? (() => {
    if (selectedPeriod === '7d' || selectedPeriod === '30d') {
      // For shorter periods, show daily data
      return systemTrends.slice(-14).map((day: any) => ({
        period: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newUsers: day.newUsers || 0,
        newPatients: day.newPatients || 0,
        newDoctors: day.newDoctors || 0,
        totalRegistrations: day.totalRegistrations || 0
      }));
    } else {
      // For longer periods, aggregate by week or month
      const aggregatedData = {};
      systemTrends.forEach((day: any) => {
        const periodKey = selectedPeriod === '90d'
          ? `Week ${Math.ceil(new Date(day.date).getDate() / 7)}`
          : new Date(day.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        if (!aggregatedData[periodKey]) {
          aggregatedData[periodKey] = {
            period: periodKey,
            newUsers: 0,
            newPatients: 0,
            newDoctors: 0,
            totalRegistrations: 0
          };
        }

        aggregatedData[periodKey].newUsers += day.newUsers || 0;
        aggregatedData[periodKey].newPatients += day.newPatients || 0;
        aggregatedData[periodKey].newDoctors += day.newDoctors || 0;
        aggregatedData[periodKey].totalRegistrations += day.totalRegistrations || 0;
      });

      return Object.values(aggregatedData).slice(-12); // Last 12 periods
    }
  })() : [];

  // Loading state
  if (loading) {
    return <AIAnalyticsPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI System Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor AI performance, usage patterns, and insights</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI System Analytics</h1>
            <p className="text-gray-600 mt-2">Monitor AI performance, usage patterns, and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {refreshing ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total AI Interactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview?.totalInteractions?.total?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {overview?.recentActivity?.totalLast30Days || 0} this month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">AI Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview?.totalInteractions?.consultations?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {overview?.recentActivity?.consultationsLast30Days || 0} this month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Symptom Checks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview?.totalInteractions?.symptomChecks?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {overview?.recentActivity?.symptomChecksLast30Days || 0} this month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {performance?.performance?.averageResponseTime ?
                      `${(performance.performance.averageResponseTime / 1000).toFixed(1)}s` : '0s'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {overview?.averages?.sessionDuration ?
                      `${Math.round(overview.averages.sessionDuration)}s avg session` : 'No data'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Usage Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {refreshing ? (
            <AreaChartSkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Usage Trends</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPeriod === '7d' ? 'Last 7 days' :
                     selectedPeriod === '30d' ? 'Last 30 days' :
                     selectedPeriod === '90d' ? 'Last 90 days' : 'Last year'} breakdown
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              {trends && trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyAIUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(label) => `Day: ${label}`}
                      formatter={(value, name) => [
                        value,
                        name === 'symptomChecks' ? 'Symptom Checks' :
                        name === 'consultations' ? 'AI Consultations' :
                        name === 'totalInteractions' ? 'Total Interactions' : name
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="symptomChecks"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Symptom Checks"
                    />
                    <Area
                      type="monotone"
                      dataKey="consultations"
                      stackId="1"
                      stroke="#ec4899"
                      fill="#ec4899"
                      fillOpacity={0.8}
                      name="AI Consultations"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No AI usage data available</p>
                    <p className="text-sm">Data will appear here once users start using AI features</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top Symptoms Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {refreshing ? (
            <PieChartSkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Symptoms</h3>
                  <p className="text-sm text-gray-600">Most frequently reported symptoms by patients</p>
                </div>
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              {topSymptomsData.length > 0 && topSymptomsData[0].name !== 'No Data' ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topSymptomsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      >
                        {topSymptomsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} occurrences`,
                          name
                        ]}
                        labelFormatter={(label) => `Symptom: ${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No symptom data available</p>
                    <p className="text-sm">Top symptoms will appear here once patients start using the symptom checker</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Performance Metrics</h3>
            <p className="text-sm text-gray-600">Key performance indicators and trends</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {aiPerformanceData.map((metric, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-gray-600 mb-2">{metric.metric}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className={`text-sm font-medium ${
                metric.trendType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Registration Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {refreshing ? (
          <LineChartSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Registration Trends</h3>
                <p className="text-sm text-gray-600">
                  User registration patterns over {selectedPeriod === '7d' ? 'the last 7 days' :
                   selectedPeriod === '30d' ? 'the last 30 days' :
                   selectedPeriod === '90d' ? 'the last 90 days' : 'the last year'}
                </p>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            {systemTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={systemTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} label={{ value: 'New Registrations', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      value,
                      name === 'newUsers' ? 'Total New Users' :
                      name === 'newPatients' ? 'New Patients' :
                      name === 'newDoctors' ? 'New Doctors' :
                      name === 'totalRegistrations' ? 'Total Registrations' : name
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalRegistrations"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="totalRegistrations"
                  />
                  <Line
                    type="monotone"
                    dataKey="newPatients"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                    name="newPatients"
                  />
                  <Line
                    type="monotone"
                    dataKey="newDoctors"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    name="newDoctors"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No registration data available</p>
                  <p className="text-sm">Registration trends will appear here as users join the platform</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-900">AI Adoption</h4>
            </div>
            <p className="text-sm text-purple-800">
              {overview?.aiAdoptionRate || 0}% of users have tried AI features.
              {overview?.activeAIUsers || 0} out of {overview?.totalUsers || 0} users are actively using AI tools.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Performance Metrics</h4>
            </div>
            <p className="text-sm text-green-800">
              Average AI confidence: {performance?.confidence?.overall || 0}%.
              User satisfaction: {performance?.userSatisfaction?.averageRating || 0}/5 stars.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">User Preferences</h4>
            </div>
            <p className="text-sm text-yellow-800">
              Most popular feature: {overview?.featurePreferences ?
                Object.entries(overview.featurePreferences).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None'
                : 'None'}.
              Total time spent: {overview?.totalTimeSpent || 0} hours.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">System Health</h4>
            </div>
            <p className="text-sm text-blue-800">
              {systemHealth?.status?.overall || 'Unknown'} system status.
              {systemHealth?.last24Hours?.successRate || 0}% success rate in last 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};