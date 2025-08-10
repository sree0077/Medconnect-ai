import React, { useState, useEffect } from 'react';
import { PatientLayout } from '../layouts/PatientLayout';
import { Crown, Zap, Building, CreditCard, Calendar, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { subscriptionService, usageService } from '../../shared/services/api';
import { useNavigate } from 'react-router-dom';

interface SubscriptionData {
  subscription: {
    tier: string;
    status: string;
    startDate: string;
    endDate?: string;
    nextPaymentDate?: string;
    autoRenew: boolean;
  };
  usage: {
    current: any;
    limits: any;
    remaining: any;
    percentage: number;
    hasExceededLimits: boolean;
  };
  billingHistory: any[];
}

const SubscriptionManagement: React.FC = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getCurrentSubscription();
      setSubscriptionData(data);
    } catch (error: any) {
      console.error('Error loading subscription data:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tier: string) => {
    navigate(`/pricing?upgrade=${tier}`);
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      await subscriptionService.cancelSubscription(cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      await loadSubscriptionData();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      setError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return Crown;
      case 'pro': return Zap;
      case 'clinic': return Building;
      default: return Crown;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'text-gray-600';
      case 'pro': return 'text-purple-600';
      case 'clinic': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Subscription</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadSubscriptionData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (!subscriptionData) return null;

  const { subscription, usage, billingHistory } = subscriptionData;
  const TierIcon = getTierIcon(subscription.tier);
  const tierColor = getTierColor(subscription.tier);

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription, view usage, and billing history</p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TierIcon className={`w-8 h-8 ${tierColor} mr-3`} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {subscription.tier} Plan
                </h2>
                <p className="text-gray-600">
                  Status: <span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            {subscription.tier !== 'free' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Cancel Subscription
              </button>
            )}
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Start Date</h3>
              <p className="text-gray-900">{formatDate(subscription.startDate)}</p>
            </div>
            {subscription.nextPaymentDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Next Payment</h3>
                <p className="text-gray-900">{formatDate(subscription.nextPaymentDate)}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Auto Renewal</h3>
              <p className="text-gray-900">{subscription.autoRenew ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          {/* Usage Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">AI Messages</span>
                  <span className="text-sm font-semibold text-purple-900">
                    {subscription.tier === 'free' ? `${usage.current.totalAIMessages}/${usage.limits.aiMessages}` : 'Unlimited'}
                  </span>
                </div>
                {subscription.tier === 'free' && (
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Appointments</span>
                  <span className="text-sm font-semibold text-blue-900">
                    {subscription.tier === 'free' ? `${usage.current.appointmentsBooked}/${usage.limits.appointmentsPerMonth}` : 'Unlimited'}
                  </span>
                </div>
                {subscription.tier === 'free' && (
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((usage.current.appointmentsBooked / usage.limits.appointmentsPerMonth) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          {subscription.tier === 'free' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-purple-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Pro Plan</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Unlimited AI consultations and more features</p>
                  <button
                    onClick={() => handleUpgrade('pro')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade to Pro - $19/month
                  </button>
                </div>
                <div className="border border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center mb-2">
                    <Building className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Clinic Plan</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Complete solution for healthcare providers</p>
                  <button
                    onClick={() => handleUpgrade('clinic')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upgrade to Clinic - $99/month
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Billing History */}
        {billingHistory && billingHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((invoice, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{formatDate(invoice.paymentDate)}</td>
                      <td className="py-3 px-4 text-gray-900">{invoice.description}</td>
                      <td className="py-3 px-4 text-gray-900">${invoice.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {invoice.downloadUrl && (
                          <button className="text-purple-600 hover:text-purple-700 flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Subscription</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  rows={3}
                  placeholder="Help us improve by sharing why you're cancelling..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default SubscriptionManagement;
