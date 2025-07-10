import React, { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';

interface PricingPlanProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: Array<{text: string; included: boolean}>;
  buttonText: string;
  highlighted?: boolean;
  index: number;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  highlighted = false,
  index
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cardRef = useRef<HTMLDivElement>(null);

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
        <h3 className={`text-xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-gray-900 dark:text-text-primary'}`}>
          {title}
        </h3>
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
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            highlighted
              ? 'bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 dark:from-primary-500 dark:to-primary-600 text-white hover:from-purple-700 hover:to-purple-800 dark:hover:from-primary-600 dark:hover:to-primary-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {buttonText}
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

  useEffect(() => {
    if (sectionInView && titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );
    }
  }, [sectionInView]);

  const pricingPlans = [
    {
      title: "Free",
      price: "$0",
      period: "/mo",
      description: "Basic features for individuals getting started with healthcare management",
      buttonText: "Start Free",
      features: [
        { text: "Basic symptom checker", included: true },
        { text: "Limited consultations (3/mo)", included: true },
        { text: "Health records storage", included: true },
        { text: "Digital prescriptions", included: false },
        { text: "Priority support", included: false },
        { text: "Family accounts", included: false }
      ]
    },
    {
      title: "Pro",
      price: "$19",
      period: "/mo",
      description: "Advanced features for individuals and families seeking comprehensive care",
      buttonText: "Get Started",
      highlighted: true,
      features: [
        { text: "Advanced symptom checker", included: true },
        { text: "Unlimited consultations", included: true },
        { text: "Health records storage", included: true },
        { text: "Digital prescriptions", included: true },
        { text: "Priority support", included: true },
        { text: "Family accounts (up to 4)", included: true }
      ]
    },
    {
      title: "Clinic",
      price: "$99",
      period: "/mo",
      description: "Complete solution for healthcare providers and small clinics",
      buttonText: "Contact Sales",
      features: [
        { text: "Provider dashboard", included: true },
        { text: "Patient management", included: true },
        { text: "Electronic health records", included: true },
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingPlan
              key={index}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
              highlighted={plan.highlighted}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;