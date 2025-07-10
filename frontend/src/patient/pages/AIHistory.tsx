import React, { useState, useEffect } from 'react';
import { PatientLayout } from '../layouts/PatientLayout';
import { Brain, MessageSquare, Calendar, Clock, Download, Trash2, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { aiHistoryService } from '../../shared/services/api';

interface SymptomSession {
  sessionId: string;
  timestamp: string;
  symptoms: string[];
  aiAnalysis: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  userFeedback?: {
    helpful?: boolean;
    rating?: number;
    comments?: string;
  };
}

interface ConsultationSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalMessages: number;
  sessionDuration: number;
  averageConfidence: number;
  userSatisfaction?: {
    rating?: number;
    feedback?: string;
  };
}

const AIHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'consultations' | 'stats'>('symptoms');
  const [symptomHistory, setSymptomHistory] = useState<SymptomSession[]>([]);
  const [consultationHistory, setConsultationHistory] = useState<ConsultationSession[]>([]);
  const [aiStats, setAiStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'symptoms') {
        const response = await aiHistoryService.getSymptomCheckerHistory();
        setSymptomHistory(response.history);
      } else if (activeTab === 'consultations') {
        const response = await aiHistoryService.getConsultationHistory();
        setConsultationHistory(response.history);
      } else if (activeTab === 'stats') {
        const response = await aiHistoryService.getAIUsageStats();
        setAiStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching AI history:', err);
      setError('Failed to load AI history');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await aiHistoryService.exportAIHistory();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const handleDeleteSession = async (sessionId: string, type: 'symptom' | 'consultation') => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      await aiHistoryService.deleteAISession(sessionId, type);
      fetchData(); // Refresh the data
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderSymptomHistory = () => (
    <div className="space-y-4">
      {symptomHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No symptom checker sessions found</p>
        </div>
      ) : (
        symptomHistory.map((session) => (
          <div key={session.sessionId} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <h3 className="font-medium text-gray-900">Symptom Analysis</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(session.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(session.severity)}`}>
                  {session.severity.charAt(0).toUpperCase() + session.severity.slice(1)}
                </span>
                <button
                  onClick={() => handleDeleteSession(session.sessionId, 'symptom')}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Symptoms:</p>
              <div className="flex flex-wrap gap-1">
                {session.symptoms.map((symptom, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">AI Analysis:</p>
              <p className="text-sm text-gray-800 bg-gray-50 rounded p-2">
                {session.aiAnalysis}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Confidence: {session.confidence}%</span>
              {session.userFeedback?.rating && (
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span>{session.userFeedback.rating}/5</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderConsultationHistory = () => (
    <div className="space-y-4">
      {consultationHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No consultation sessions found</p>
        </div>
      ) : (
        consultationHistory.map((session) => (
          <div key={session.sessionId} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-medium text-gray-900">AI Consultation</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(session.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSession(session.sessionId, 'consultation')}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div className="text-center">
                <p className="font-medium text-blue-600">{session.totalMessages}</p>
                <p className="text-gray-500">Messages</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">
                  {Math.floor(session.sessionDuration / 60)}m
                </p>
                <p className="text-gray-500">Duration</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-purple-600">{session.averageConfidence}%</p>
                <p className="text-gray-500">Avg Confidence</p>
              </div>
            </div>

            {session.userSatisfaction?.rating && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Your Rating:</span>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span>{session.userSatisfaction.rating}/5</span>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {aiStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{aiStats.totalSymptomChecks}</p>
              <p className="text-sm text-gray-600">Symptom Checks</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{aiStats.totalConsultations}</p>
              <p className="text-sm text-gray-600">Consultations</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(aiStats.averageSessionDuration / 60)}m
              </p>
              <p className="text-sm text-gray-600">Avg Session</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Last 30 days:</p>
                <p className="font-medium">
                  {aiStats.recentActivity?.symptomChecksLast30Days || 0} symptom checks, {' '}
                  {aiStats.recentActivity?.consultationsLast30Days || 0} consultations
                </p>
              </div>
              <div>
                <p className="text-gray-600">Preferred feature:</p>
                <p className="font-medium capitalize">{aiStats.preferredAIFeature}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <PatientLayout>
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI History
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage your AI interaction history
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'symptoms', label: 'Symptom Checker', icon: Brain },
              { id: 'consultations', label: 'Consultations', icon: MessageSquare },
              { id: 'stats', label: 'Statistics', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'symptoms' && renderSymptomHistory()}
            {activeTab === 'consultations' && renderConsultationHistory()}
            {activeTab === 'stats' && renderStats()}
          </>
        )}
      </div>
    </PatientLayout>
  );
};

export default AIHistory;
