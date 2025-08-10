import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Crown, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { usageService } from '../../shared/services/api';
import { useNavigate } from 'react-router-dom';

interface UsageWidgetProps {
  className?: string;
}

const UsageWidget: React.FC<UsageWidgetProps> = ({ className = '' }) => {
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      const data = await usageService.getUsageSummary();
      setUsageSummary(data);
    } catch (error: any) {
      console.error('Error loading usage data:', error);
      setError('Failed to load usage information');
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-surface rounded-xl p-6 shadow-lg border border-gray-200 dark:border-border ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-11 bg-white dark:bg-surface rounded-lg shadow-sm border border-gray-200 dark:border-border hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col h-[388px] p-4 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadUsageData}
            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!usageSummary) return null;

  const { subscriptionTier, currentUsage, limits, usagePercentage, hasUnlimitedUsage, needsUpgrade } = usageSummary;

  // Determine height based on subscription tier and content
  const getCardHeight = () => {
    if (subscriptionTier === 'free') {
      // Free tier should match Health Insights card height with scrollable content
      return 'h-[388px] flex flex-col';
    } else {
      // Pro/Clinic tier should match appointment status card height (~388px)
      return 'h-[388px]';
    }
  };

  return (
    <div className={`mt-11 bg-white dark:bg-surface rounded-lg shadow-sm border border-gray-200 dark:border-border hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col ${getCardHeight()} ${subscriptionTier === 'free' ? 'p-6' : 'p-4'} ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${subscriptionTier === 'free' ? 'mb-4' : 'mb-6'}`}>
        <div className="flex items-center">
          {subscriptionTier === 'free' && <Crown className="w-5 h-5 text-gray-500 mr-2" />}
          {subscriptionTier === 'pro' && <Zap className="w-5 h-5 text-purple-600 mr-2" />}
          {subscriptionTier === 'clinic' && <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
            {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan
          </h3>
        </div>
        {needsUpgrade && (
          <button
            onClick={() => navigate('/pricing')}
            className="text-xs bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            Upgrade
          </button>
        )}
      </div>

      {/* Usage Statistics */}
      <div className={`${subscriptionTier === 'free' ? 'space-y-1' : 'space-y-3'} ${subscriptionTier === 'free' ? 'flex-grow' : ''}`}>
        {/* AI Messages Usage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
                AI Messages
              </span>
            </div>
            <span className={`text-sm font-semibold ${getUsageColor(usagePercentage.aiMessages)}`}>
              {hasUnlimitedUsage ? 'Unlimited' : `${currentUsage.aiMessages}/${limits.aiMessages}`}
            </span>
          </div>
          {!hasUnlimitedUsage && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(usagePercentage.aiMessages)}`}
                style={{ width: `${Math.min(usagePercentage.aiMessages, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Appointments Usage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">
                Appointments
              </span>
            </div>
            <span className={`text-sm font-semibold ${getUsageColor(usagePercentage.appointments)}`}>
              {hasUnlimitedUsage ? 'Unlimited' : `${currentUsage.appointments}/${limits.appointmentsPerMonth}`}
            </span>
          </div>
          {!hasUnlimitedUsage && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(usagePercentage.appointments)}`}
                style={{ width: `${Math.min(usagePercentage.appointments, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for consistent height */}
      <div className="flex-grow"></div>

      {/* Upgrade Prompt - Compact for Free Plan */}
      {needsUpgrade && subscriptionTier === 'free' && (
        <div className="mt-1 p-1.5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-3 h-3 text-purple-600 mr-1.5" />
              <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                Limit Reached
              </span>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded hover:bg-purple-700 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Pro/Clinic Benefits */}
      {hasUnlimitedUsage && (
        <>
          <div className="mt-auto p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                  Unlimited Access
                </h4>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Enjoy unlimited AI consultations and appointments with your {subscriptionTier} plan.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Upgrade Options for Free Tier */}
      {subscriptionTier === 'free' && (
        <div className="mt-1 pt-1.5 border-t border-gray-200 dark:border-border">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-text-primary mb-1">
            Upgrade Your Plan
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/checkout?plan=pro')}
              className="w-full flex items-center justify-between p-1.5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all"
            >
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-purple-600 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Pro Plan</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300">Unlimited AI + 10 appointments</div>
                </div>
              </div>
              <div className="text-sm font-bold text-purple-700 dark:text-purple-300">$19/mo</div>
            </button>

            <button
              onClick={() => navigate('/checkout?plan=clinic')}
              className="w-full flex items-center justify-between p-1.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all"
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Clinic Plan</div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">Everything unlimited + API access</div>
                </div>
              </div>
              <div className="text-sm font-bold text-blue-700 dark:text-blue-300">$99/mo</div>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`${subscriptionTier === 'free' ? 'mt-1 pt-1.5' : 'mt-6 pt-4'} border-t border-gray-200 dark:border-border`}>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/ai-consultation')}
            disabled={!hasUnlimitedUsage && currentUsage.aiMessages >= limits.aiMessages}
            className="flex-1 text-xs bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            AI Consultation
          </button>
          <button
            onClick={() => navigate('/book-appointment')}
            disabled={!hasUnlimitedUsage && currentUsage.appointments >= limits.appointmentsPerMonth}
            className="flex-1 text-xs bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageWidget;
