import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PatientLayout } from '../layouts/PatientLayout';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  ArrowLeft, 
  Zap, 
  Building, 
  Crown,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { subscriptionService } from '../../shared/services/api';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  icon: React.ComponentType<any>;
  color: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'pro';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const plans: Record<string, PlanDetails> = {
    pro: {
      id: 'pro',
      name: 'Pro Plan',
      price: 19,
      period: 'month',
      features: [
        'Unlimited AI consultations',
        'Advanced symptom checker',
        'Up to 10 appointments per month',
        'Digital prescriptions',
        'Priority support',
        'Family accounts (up to 4 members)'
      ],
      icon: Zap,
      color: 'purple'
    },
    clinic: {
      id: 'clinic',
      name: 'Clinic Plan',
      price: 99,
      period: 'month',
      features: [
        'Everything in Pro',
        'Unlimited appointments',
        'Provider dashboard',
        'Patient management tools',
        'Electronic health records',
        'Analytics & reporting',
        'API access'
      ],
      icon: Building,
      color: 'blue'
    }
  };

  const selectedPlan = plans[planId] || plans.pro;
  const PlanIcon = selectedPlan.icon;

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  const loadCurrentSubscription = async () => {
    try {
      const data = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(data);
      
      // Redirect if user is already on this plan
      if (data.subscription?.tier === planId) {
        navigate('/dashboard?message=already-subscribed');
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentMethod(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setPaymentMethod(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (!paymentMethod.cardNumber || paymentMethod.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return false;
    }
    if (!paymentMethod.expiryDate || paymentMethod.expiryDate.length < 5) {
      setError('Please enter a valid expiry date');
      return false;
    }
    if (!paymentMethod.cvv || paymentMethod.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    if (!paymentMethod.cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Create a payment method with Stripe
      // 2. Create a subscription with the payment method
      // 3. Handle 3D Secure authentication if required
      
      // For now, we'll simulate the payment process
      const result = await subscriptionService.updateSubscription(planId);
      
      if (result.success) {
        // Redirect to success page
        navigate(`/checkout/success?plan=${planId}`);
      } else {
        setError(result.message || 'Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Subscription</h1>
          <p className="text-gray-600 mt-2">Secure checkout powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className={`border-2 border-${selectedPlan.color}-200 rounded-lg p-4 mb-6`}>
              <div className="flex items-center mb-3">
                <PlanIcon className={`w-6 h-6 text-${selectedPlan.color}-600 mr-3`} />
                <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h3>
              </div>
              
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${selectedPlan.price}
                <span className="text-lg font-normal text-gray-600">/{selectedPlan.period}</span>
              </div>
              
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Plan Comparison */}
            {currentSubscription?.subscription?.tier && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Upgrading from:</h4>
                <div className="flex items-center">
                  <Crown className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600 capitalize">
                    {currentSubscription.subscription.tier} Plan
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Lock className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentMethod.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentMethod.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentMethod.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentMethod.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={paymentMethod.billingAddress.street}
                    onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                    placeholder="Street Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={paymentMethod.billingAddress.city}
                      onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={paymentMethod.billingAddress.state}
                      onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                      placeholder="State"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={paymentMethod.billingAddress.zipCode}
                    onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                    placeholder="ZIP Code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : `bg-gradient-to-r from-${selectedPlan.color}-600 to-${selectedPlan.color}-700 hover:from-${selectedPlan.color}-700 hover:to-${selectedPlan.color}-800 shadow-lg hover:shadow-xl transform hover:scale-105`
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing Payment...
                  </div>
                ) : (
                  `Subscribe to ${selectedPlan.name} - $${selectedPlan.price}/${selectedPlan.period}`
                )}
              </button>

              {/* Security Notice */}
              <div className="text-center text-sm text-gray-500">
                <Lock className="w-4 h-4 inline mr-1" />
                Your payment information is secure and encrypted
              </div>
            </form>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default CheckoutPage;
