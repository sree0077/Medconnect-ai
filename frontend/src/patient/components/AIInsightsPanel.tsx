import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, AlertTriangle, ChevronRight, Activity, Clock } from 'lucide-react';
import { aiHistoryService } from '../../shared/services/api';

interface AIInsightsPanelProps {}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = () => {
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAISummary = async () => {
      try {
        setLoading(true);
        const response = await aiHistoryService.getAIHistorySummary();
        setAiSummary(response.summary);
      } catch (err) {
        console.error('Error fetching AI summary:', err);
        setError('Failed to load AI insights');
      } finally {
        setLoading(false);
      }
    };

    fetchAISummary();
  }, []);
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Insights</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex items-center mb-4">
              <div className="bg-gray-200 rounded-full h-10 w-10 mr-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Insights</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const lastSymptomCheck = aiSummary?.lastActivity?.lastSymptomCheck;
  const lastConsultation = aiSummary?.lastActivity?.lastConsultation;
  const hasRecentActivity = aiSummary?.totalInteractions > 0;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Insights</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {hasRecentActivity ? (
          <div className="p-4">
            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Last Symptom Check */}
              {lastSymptomCheck && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center mb-2">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-800">Last Symptom Check</h4>
                  </div>
                  <p className="text-sm text-purple-600 mb-1">
                    {new Date(lastSymptomCheck.date).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lastSymptomCheck.symptoms?.slice(0, 3).map((symptom: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                    {lastSymptomCheck.symptoms?.length > 3 && (
                      <span className="text-xs text-purple-600">+{lastSymptomCheck.symptoms.length - 3} more</span>
                    )}
                  </div>
                  {lastSymptomCheck.severity && (
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(lastSymptomCheck.severity)}`}>
                      {lastSymptomCheck.severity.charAt(0).toUpperCase() + lastSymptomCheck.severity.slice(1)}
                    </span>
                  )}
                </div>
              )}

              {/* Last Consultation */}
              {lastConsultation && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Activity className="h-4 w-4 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">Last Consultation</h4>
                  </div>
                  <p className="text-sm text-blue-600 mb-1">
                    {new Date(lastConsultation.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center text-xs text-blue-600 space-x-3">
                    <span>{lastConsultation.messageCount} messages</span>
                    {lastConsultation.duration && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(lastConsultation.duration / 60)}m
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Activity Stats */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Recent Activity (7 days)</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-purple-600">
                    {aiSummary?.recentActivity?.symptomChecksLast7Days || 0}
                  </p>
                  <p className="text-xs text-gray-600">Symptom Checks</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-600">
                    {aiSummary?.recentActivity?.consultationsLast7Days || 0}
                  </p>
                  <p className="text-xs text-gray-600">Consultations</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-600">
                    {aiSummary?.totalInteractions || 0}
                  </p>
                  <p className="text-xs text-gray-600">Total Sessions</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <Link
                to="/symptom-checker"
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors duration-150"
              >
                New Symptom Check
              </Link>
              <Link
                to="/ai-consultation"
                className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors duration-150"
              >
                AI Consultation Chat
              </Link>
              <Link
                to="/ai-history"
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                View History
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900">No recent symptom checks</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Our AI-powered symptom checker can help you understand your symptoms and provide health guidance.
            </p>
            <Link
              to="/symptom-checker"
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors duration-150 inline-block"
            >
              Start Symptom Check
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-medium text-purple-800 mb-2 flex items-center">
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Health Tips
        </h3>
        <p className="text-sm text-purple-700">
          Remember to stay hydrated and maintain a balanced diet rich in fruits and vegetables. Regular exercise can help boost your immune system.
        </p>
        <Link
          to="/health-tips"
          className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center"
        >
          More health tips <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
