import React, { useEffect, useRef, useState } from 'react';
import { Check, X, Crown, Zap, Building } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { subscriptionService, usageService } from '../../shared/services/api';

interface PricingPlanProps {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: Array<{text: string; included: boolean}>;
  buttonText: string;
  highlighted?: boolean;
  index: number;
  currentTier?: string;
  isLoggedIn?: boolean;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  id,
  title,
  price,
  period,
  description,
  features,
  buttonText,
  highlighted = false,
  index,
  currentTier,
  isLoggedIn,
  onSelectPlan,
  loading = false,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const isCurrentPlan = currentTier === id;
  const isPlanIcon = id === 'free' ? Crown : id === 'pro' ? Zap : Building;

  useEffect(() => {
    if (inView && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1
        }
      );
    }
  }, [inView, index]);

  return (
    <div ref={ref} className="w-full">
      <div
        ref={cardRef}
        className={`relative h-full rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
          highlighted
            ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 dark:from-primary-400 dark:via-primary-500 dark:to-primary-600 text-white shadow-2xl transform md:-translate-y-4 border border-purple-400/30 dark:border-primary-300/30 animate-pulse-slow'
            : 'bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-surface-secondary dark:via-surface dark:to-surface-secondary text-gray-800 dark:text-text-primary shadow-xl border border-purple-200/50 dark:border-border hover:shadow-2xl hover:border-purple-300/70 dark:hover:border-primary-400/70'
        }`}
        style={{
          boxShadow: highlighted
            ? '0 25px 50px -12px rgba(147, 51, 234, 0.4), 0 0 0 1px rgba(147, 51, 234, 0.1)'
            : '0 20px 40px -12px rgba(147, 51, 234, 0.15), 0 0 0 1px rgba(147, 51, 234, 0.05)'
        }}
      >
        {highlighted && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              Most Popular
            </span>
          </div>
        )}
        {isCurrentPlan && (
          <div className="absolute -top-4 right-4">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Current Plan
            </span>
          </div>
        )}
        <div className="flex items-center mb-2">
          <isPlanIcon className={`w-6 h-6 mr-2 ${highlighted ? 'text-white' : 'text-purple-600'}`} />
          <h3 className={`text-xl font-bold ${highlighted ? 'text-white' : 'text-gray-900 dark:text-text-primary'}`}>
            {title}
          </h3>
        </div>
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          <span className={`text-sm ${highlighted ? 'text-white/80' : 'text-gray-500 dark:text-text-muted'}`}>
            {period}
          </span>
        </div>
        <p className={`mb-6 ${highlighted ? 'text-white/90' : 'text-gray-600 dark:text-text-secondary'}`}>
          {description}
        </p>

        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              {feature.included ? (
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                  highlighted ? 'bg-white text-purple-700 shadow-sm' : 'bg-purple-100 dark:bg-primary-200 text-purple-600 dark:text-primary-700'
                }`}>
                  <Check size={14} strokeWidth={2.5} />
                </span>
              ) : (
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                  highlighted ? 'bg-white/20 text-white/60' : 'bg-gray-100 dark:bg-surface-secondary text-gray-400 dark:text-text-muted'
                }`}>
                  <X size={14} strokeWidth={2} />
                </span>
              )}
              <span className={feature.included
                ? (highlighted ? 'text-white' : 'text-gray-700 dark:text-text-primary')
                : (highlighted ? 'text-white/60' : 'text-gray-400 dark:text-text-muted')
              }>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelectPlan(id)}
          disabled={loading || isCurrentPlan}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isCurrentPlan
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : highlighted
              ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 dark:from-primary-500 dark:to-primary-600 text-white hover:from-purple-700 hover:to-purple-800 dark:hover:from-primary-600 dark:hover:to-primary-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : buttonText}
        </button>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const titleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in and get subscription info
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      loadSubscriptionData();
    }

    // Check for plan parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam && ['pro', 'clinic'].includes(planParam)) {
      // Scroll to the specific plan or highlight it
      setTimeout(() => {
        const planElement = document.getElementById(`plan-${planParam}`);
        if (planElement) {
          planElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          planElement.classList.add('ring-2', 'ring-purple-500', 'ring-opacity-50');
          setTimeout(() => {
            planElement.classList.remove('ring-2', 'ring-purple-500', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (sectionInView && titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
  }, [sectionInView]);

  const loadSubscriptionData = async () => {
    try {
      const [subscriptionData, usageData] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        usageService.getUsageSummary(),
      ]);

      setCurrentSubscription(subscriptionData);
      setUsageSummary(usageData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Don't show error for subscription data, just continue
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      navigate('/login?returnTo=/pricing');
      return;
    }

    if (planId === currentSubscription?.subscription?.tier) {
      return; // Already on this plan
    }

    setLoading(true);
    setError(null);

    try {
      if (planId === 'free') {
        // Handle downgrade to free
        await subscriptionService.cancelSubscription('Downgrade to free plan');
      } else {
        // Handle upgrade to paid plan
        await subscriptionService.updateSubscription(planId);
      }

      // Reload subscription data
      await loadSubscriptionData();

      // Show success message or redirect
      if (planId !== 'free') {
        navigate('/dashboard?upgraded=true');
      }
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      setError(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const pricingPlans = [
    {
      id: "free",
      title: "Free",
      price: "$0",
      period: "/mo",
      description: "Basic features for individuals getting started with healthcare management",
      buttonText: "Start Free",
      features: [
        { text: "Basic symptom checker", included: true },
        { text: "Limited AI consultations (3/mo)", included: true },
        { text: "Health records storage", included: true },
        { text: "1 appointment per month", included: true },
        { text: "Digital prescriptions", included: false },
        { text: "Priority support", included: false },
        { text: "Family accounts", included: false }
      ]
    },
    {
      id: "pro",
      title: "Pro",
      price: "$19",
      period: "/mo",
      description: "Advanced features for individuals and families seeking comprehensive care",
      buttonText: "Upgrade to Pro",
      highlighted: true,
      features: [
        { text: "Advanced symptom checker", included: true },
        { text: "Unlimited AI consultations", included: true },
        { text: "Health records storage", included: true },
        { text: "Up to 10 appointments per month", included: true },
        { text: "Digital prescriptions", included: true },
        { text: "Priority support", included: true },
        { text: "Family accounts (up to 4)", included: true }
      ]
    },
    {
      id: "clinic",
      title: "Clinic",
      price: "$99",
      period: "/mo",
      description: "Complete solution for healthcare providers and small clinics",
      buttonText: "Contact Sales",
      features: [
        { text: "Provider dashboard", included: true },
        { text: "Unlimited patient management", included: true },
        { text: "Electronic health records", included: true },
        { text: "Unlimited appointments", included: true },
        { text: "Prescription management", included: true },
        { text: "Analytics & reporting", included: true },
        { text: "API access", included: true }
      ]
    }
  ];

  return (
    <section id="pricing" ref={sectionRef} className="py-20 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-background dark:via-surface dark:to-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 dark:bg-primary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300/20 dark:bg-primary-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/20 dark:bg-primary-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-text-primary">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 dark:text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees or surprise charges.
          </p>

          {/* Usage Summary for logged-in users */}
          {isLoggedIn && usageSummary && (
            <div className="mt-8 max-w-md mx-auto bg-white dark:bg-surface rounded-xl p-6 shadow-lg border border-purple-200 dark:border-border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-text-primary">Your Current Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-text-secondary">AI Messages</span>
                  <span className="text-sm font-medium">
                    {usageSummary.hasUnlimitedUsage ? 'Unlimited' :
                      `${usageSummary.currentUsage.aiMessages}/${usageSummary.limits.aiMessages}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-text-secondary">Appointments</span>
                  <span className="text-sm font-medium">
                    {usageSummary.hasUnlimitedUsage ? 'Unlimited' :
                      `${usageSummary.currentUsage.appointments}/${usageSummary.limits.appointmentsPerMonth}`}
                  </span>
                </div>
                {usageSummary.needsUpgrade && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You've reached your usage limits. Consider upgrading for unlimited access!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 max-w-md mx-auto p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div key={plan.id} id={`plan-${plan.id}`}>
              <PricingPlan
                id={plan.id}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                buttonText={plan.buttonText}
                highlighted={plan.highlighted}
                index={index}
                currentTier={currentSubscription?.subscription?.tier}
                isLoggedIn={isLoggedIn}
                onSelectPlan={handleSelectPlan}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;