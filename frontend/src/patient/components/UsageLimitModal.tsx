import React from 'react';
import { X, Crown, Zap, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'aiMessage' | 'appointment';
  currentUsage: {
    current: number;
    limit: number;
    remaining: number;
  };
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  limitType,
  currentUsage,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isAIMessage = limitType === 'aiMessage';
  const Icon = isAIMessage ? MessageSquare : Calendar;
  const featureName = isAIMessage ? 'AI Consultations' : 'Appointments';
  const actionText = isAIMessage ? 'start a consultation' : 'book an appointment';

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  const handleViewPlans = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mr-4">
              <Icon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary">
                Usage Limit Reached
              </h2>
              <p className="text-sm text-gray-600 dark:text-text-secondary">
                Free plan limit exceeded
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-text-secondary mb-4">
              You've used <strong>{currentUsage.current} of {currentUsage.limit}</strong> {featureName.toLowerCase()} 
              this month. To {actionText}, please upgrade to our Pro plan for unlimited access.
            </p>

            {/* Usage Progress */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentUsage.current / currentUsage.limit) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-text-secondary">
              {currentUsage.remaining} remaining this month
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="space-y-3 mb-6">
            {/* Free Plan */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Crown className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-text-secondary">Free Plan</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-text-muted">
                {isAIMessage ? '3 AI messages' : '1 appointment'}/month
              </span>
            </div>

            {/* Pro Plan */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Pro Plan</span>
              </div>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Unlimited
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-text-primary mb-3">
              Pro Plan Benefits:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-text-secondary">
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 text-purple-600 mr-2 flex-shrink-0" />
                Unlimited AI consultations and symptom checker
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 text-purple-600 mr-2 flex-shrink-0" />
                Up to 10 appointments per month
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 text-purple-600 mr-2 flex-shrink-0" />
                Priority support and digital prescriptions
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-3 h-3 text-purple-600 mr-2 flex-shrink-0" />
                Family accounts for up to 4 members
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Upgrade to Pro - $19/month
            </button>
            
            <button
              onClick={handleViewPlans}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-text-secondary py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View All Plans
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 dark:text-text-muted py-2 px-4 text-sm hover:text-gray-700 dark:hover:text-text-secondary transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal;
