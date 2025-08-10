import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PatientLayout } from '../layouts/PatientLayout';
import { 
  CheckCircle, 
  Zap, 
  Building, 
  ArrowRight, 
  Download,
  Calendar,
  MessageSquare,
  Users
} from 'lucide-react';

const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'pro';
  const [countdown, setCountdown] = useState(10);

  const planDetails = {
    pro: {
      name: 'Pro Plan',
      price: 19,
      icon: Zap,
      color: 'purple',
      features: [
        'Unlimited AI consultations',
        'Up to 10 appointments per month',
        'Priority support',
        'Family accounts'
      ]
    },
    clinic: {
      name: 'Clinic Plan',
      price: 99,
      icon: Building,
      color: 'blue',
      features: [
        'Everything in Pro',
        'Unlimited appointments',
        'Provider dashboard',
        'Analytics & reporting'
      ]
    }
  };

  const plan = planDetails[planId as keyof typeof planDetails] || planDetails.pro;
  const PlanIcon = plan.icon;

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleDownloadReceipt = () => {
    // In a real implementation, this would download a PDF receipt
    alert('Receipt download would be implemented here');
  };

  return (
    <PatientLayout>
      <div className="max-w-2xl mx-auto py-16 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to {plan.name}!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>

        {/* Plan Details Card */}
        <div className={`bg-gradient-to-r from-${plan.color}-50 to-${plan.color}-100 border border-${plan.color}-200 rounded-xl p-6 mb-8`}>
          <div className="flex items-center justify-center mb-4">
            <PlanIcon className={`w-8 h-8 text-${plan.color}-600 mr-3`} />
            <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-6">
            ${plan.price}/month
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Start AI Consultation</h4>
              <p className="text-sm text-gray-600">Get unlimited access to our AI health assistant</p>
            </div>
            <div className="text-center p-4">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Book Appointments</h4>
              <p className="text-sm text-gray-600">Schedule with our verified healthcare providers</p>
            </div>
            <div className="text-center p-4">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Add Family Members</h4>
              <p className="text-sm text-gray-600">Extend coverage to your family</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleGoToDashboard}
            className={`flex items-center justify-center px-8 py-3 bg-gradient-to-r from-${plan.color}-600 to-${plan.color}-700 text-white font-semibold rounded-lg hover:from-${plan.color}-700 hover:to-${plan.color}-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <div className="text-sm text-gray-500">
          You'll be automatically redirected to your dashboard in {countdown} seconds
        </div>

        {/* Subscription Details */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg text-left">
          <h4 className="font-semibold text-gray-900 mb-3">Subscription Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="font-medium">${plan.price}/month</span>
            </div>
            <div className="flex justify-between">
              <span>Next billing date:</span>
              <span className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@medconnect.ai" className="text-purple-600 hover:text-purple-700">
              support@medconnect.ai
            </a>
          </p>
        </div>
      </div>
    </PatientLayout>
  );
};

export default CheckoutSuccessPage;
