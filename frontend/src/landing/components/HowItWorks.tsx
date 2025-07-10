import React, { useEffect, useRef } from 'react';
import { UserPlus, MessageSquare, Stethoscope, ClipboardCheck } from 'lucide-react';
import gsap from 'gsap';
import { useInView } from 'react-intersection-observer';

const HowItWorks: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const titleRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView) {
      const tl = gsap.timeline();

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
      .fromTo(
        [step1Ref.current, step2Ref.current, step3Ref.current, step4Ref.current],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2
        },
        "-=0.3"
      );
    }
  }, [inView]);

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-text-primary">How MedConnect AI Works</h2>
          <p className="text-lg text-gray-600 dark:text-text-secondary max-w-2xl mx-auto">
            Get started with our intelligent healthcare platform in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div ref={step1Ref} className="relative group h-full">
            <div className="absolute left-0 right-0 top-12 hidden lg:block">
              <div className="h-0.5 bg-primary-200 w-full relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-primary-500"></div>
              </div>
            </div>
            <div className="text-center p-8 relative z-10 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 dark:from-surface-secondary dark:to-surface dark:hover:from-surface dark:hover:to-surface-secondary rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200 hover:border-primary-300 dark:border-border dark:hover:border-primary-400 perspective-1000 h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-200 dark:to-primary-300 flex items-center justify-center mx-auto mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-8 w-8 text-primary-500 dark:text-primary-700" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-text-primary">Register</h3>
              </div>
              <p className="text-gray-600 dark:text-text-secondary leading-relaxed text-sm">
                Sign up as a patient or healthcare provider to access our intelligent platform
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div ref={step2Ref} className="relative group h-full">
            <div className="absolute left-0 right-0 top-12 hidden lg:block">
              <div className="h-0.5 bg-primary-200 w-full relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-primary-500"></div>
              </div>
            </div>
            <div className="text-center p-8 relative z-10 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 dark:from-surface-secondary dark:to-surface dark:hover:from-surface dark:hover:to-surface-secondary rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200 hover:border-primary-300 dark:border-border dark:hover:border-primary-400 perspective-1000 h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-200 dark:to-primary-300 flex items-center justify-center mx-auto mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-primary-500 dark:text-primary-700" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-text-primary">Interact</h3>
              </div>
              <p className="text-gray-600 dark:text-text-secondary leading-relaxed text-sm">
                Book appointments or log symptoms through our AI-powered interface
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div ref={step3Ref} className="relative group h-full">
            <div className="absolute left-0 right-0 top-12 hidden lg:block">
              <div className="h-0.5 bg-primary-200 w-full relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-primary-500"></div>
              </div>
            </div>
            <div className="text-center p-8 relative z-10 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 dark:from-surface-secondary dark:to-surface dark:hover:from-surface dark:hover:to-surface-secondary rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200 hover:border-primary-300 dark:border-border dark:hover:border-primary-400 perspective-1000 h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-200 dark:to-primary-300 flex items-center justify-center mx-auto mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="h-8 w-8 text-primary-500 dark:text-primary-700" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-text-primary">Consult</h3>
              </div>
              <p className="text-gray-600 dark:text-text-secondary leading-relaxed text-sm">
                Connect with a doctor or get instant assistance from our AI assistant
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div ref={step4Ref} className="relative group h-full">
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 dark:from-surface-secondary dark:to-surface dark:hover:from-surface dark:hover:to-surface-secondary rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-purple-200 hover:border-primary-300 dark:border-border dark:hover:border-primary-400 perspective-1000 h-80 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-200 dark:to-primary-300 flex items-center justify-center mx-auto mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <ClipboardCheck className="h-8 w-8 text-primary-500 dark:text-primary-700" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-text-primary">Receive Care</h3>
              </div>
              <p className="text-gray-600 dark:text-text-secondary leading-relaxed text-sm">
                Get digital prescriptions and personalized follow-up care plans
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;