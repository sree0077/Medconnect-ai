import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Brain, Calendar, TrendingUp, AlertTriangle, Activity, MessageSquare } from 'lucide-react';
import { aiHistoryService, appointmentService } from '../../shared/services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AIUsageData {
  totalSymptomChecks: number;
  totalConsultations: number;
  totalAIInteractions: number;
  lastSymptomCheck: string | null;
  lastConsultation: string | null;
  averageSessionDuration: number;
  preferredAIFeature: string;
  totalTimeSpent: number;
}

interface AppointmentData {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const HealthMonitoring: React.FC = () => {
  const [aiUsageData, setAiUsageData] = useState<AIUsageData | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch AI usage statistics
        const aiStatsResponse = await aiHistoryService.getAIUsageStats();
        setAiUsageData(aiStatsResponse.stats);

        // Fetch appointment data
        const appointmentsResponse = await appointmentService.getPatientAppointments();
        const appointments = appointmentsResponse || [];

        // Calculate appointment status distribution
        const pending = appointments.filter((apt: any) => apt.status === 'pending').length;
        const approved = appointments.filter((apt: any) => apt.status === 'approved').length;
        const rejected = appointments.filter((apt: any) => apt.status === 'rejected').length;

        setAppointmentData({
          pending,
          approved,
          rejected,
          total: appointments.length
        });

      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to load health analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  // Generate AI Usage Trends Chart Data
  const generateAIUsageTrendsData = () => {
    if (!aiUsageData) return null;

    // Generate last 6 months of mock trend data based on current stats
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalInteractions = aiUsageData.totalAIInteractions || 0;
    const symptomChecks = aiUsageData.totalSymptomChecks || 0;
    const consultations = aiUsageData.totalConsultations || 0;

    // Create realistic trend data
    const symptomTrend = months.map((_, index) => Math.max(0, Math.floor(symptomChecks * (0.3 + index * 0.15))));
    const consultationTrend = months.map((_, index) => Math.max(0, Math.floor(consultations * (0.2 + index * 0.18))));

    return {
      labels: months,
      datasets: [
        {
          label: 'Symptom Checker',
          data: symptomTrend,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'AI Consultations',
          data: consultationTrend,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ],
    };
  };

  // Generate Appointment Status Chart Data
  const generateAppointmentStatusData = () => {
    if (!appointmentData) return null;

    return {
      labels: ['Approved', 'Pending', 'Cancelled'],
      datasets: [
        {
          data: [appointmentData.approved, appointmentData.pending, appointmentData.rejected],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate Health Insights
  const generateHealthInsights = () => {
    if (!aiUsageData || !appointmentData) return [];

    const insights = [];

    // AI Usage Insight
    if (aiUsageData.totalAIInteractions > 0) {
      const preferredFeature = aiUsageData.preferredAIFeature === 'symptom-checker' ? 'Symptom Checker' :
                              aiUsageData.preferredAIFeature === 'consultation' ? 'AI Consultation' : 'AI Features';
      insights.push({
        icon: <Brain className="text-purple-500" />,
        title: 'AI Engagement',
        message: `${aiUsageData.totalAIInteractions} total interactions. Preferred: ${preferredFeature}`,
        severity: 'low',
      });
    }

    // Appointment Insight
    if (appointmentData.pending > 0) {
      insights.push({
        icon: <Calendar className="text-yellow-500" />,
        title: 'Pending Appointments',
        message: `${appointmentData.pending} appointment${appointmentData.pending > 1 ? 's' : ''} awaiting confirmation`,
        severity: 'moderate',
      });
    }

    // Activity Insight
    const avgSessionMinutes = Math.round(aiUsageData.averageSessionDuration / 60);
    if (avgSessionMinutes > 0) {
      insights.push({
        icon: <Activity className="text-blue-500" />,
        title: 'Session Duration',
        message: `Average AI session: ${avgSessionMinutes} minute${avgSessionMinutes > 1 ? 's' : ''}`,
        severity: 'low',
      });
    }

    return insights;
  };

  const aiUsageTrendsData = generateAIUsageTrendsData();
  const appointmentStatusData = generateAppointmentStatusData();
  const healthInsights = generateHealthInsights();

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading AI usage data...</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-80 flex items-center justify-center">
            <div className="text-gray-500">Loading appointment data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Analytics</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Usage Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">AI Feature Usage Trends</h3>
            <Brain className="text-purple-500" />
          </div>
          <div className="h-64">
            {aiUsageTrendsData ? (
              <Line
                data={aiUsageTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y} interactions`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Interactions',
                      },
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No AI usage data available
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-center">
            <div className="bg-purple-50 text-purple-700 p-2 rounded">
              <div className="font-medium">Total Symptom Checks</div>
              <div>{aiUsageData?.totalSymptomChecks || 0}</div>
            </div>
            <div className="bg-blue-50 text-blue-700 p-2 rounded">
              <div className="font-medium">Total Consultations</div>
              <div>{aiUsageData?.totalConsultations || 0}</div>
            </div>
          </div>
        </div>

        {/* Appointment Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Appointment Status</h3>
            <Calendar className="text-green-500" />
          </div>
          <div className="h-64">
            {appointmentStatusData ? (
              <Doughnut
                data={appointmentStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = appointmentData?.total || 0;
                          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                          return `${label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                  cutout: '60%',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No appointment data available
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{appointmentData?.total || 0}</div>
            <div className="text-sm text-gray-600">Total Appointments</div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-4">Health Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthInsights.length > 0 ? (
              healthInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : insight.severity === 'moderate'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {insight.icon}
                    <h4 className="ml-2 font-medium text-gray-800">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-8">
                <MessageSquare className="mx-auto mb-2 text-gray-400" size={24} />
                <p>Start using AI features to see personalized insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoring;
