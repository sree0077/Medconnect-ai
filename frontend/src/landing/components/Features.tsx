import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    icon: '🖥️',
    title: 'AI Health Assistant',
    description: 'Get instant health advice from our advanced AI system trained on millions of medical cases.',
    color: 'from-blue-500 to-purple-500'
  },
  {
    icon: '👨‍⚕️',
    title: 'Expert Doctors',
    description: 'Connect with certified healthcare professionals from top medical institutions worldwide.',
    color: 'from-green-500 to-blue-500'
  },
  {
    icon: '📱',
    title: 'Instant Booking',
    description: 'Book appointments with doctors in seconds. No waiting, no hassle, just healthcare.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your health data is protected with enterprise-grade security and HIPAA compliance.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: '💊',
    title: 'Smart Prescriptions',
    description: 'AI-powered prescription management with drug interaction checks and reminders.',
    color: 'from-pink-500 to-purple-500'
  },
  {
    icon: '📊',
    title: 'Health Analytics',
    description: 'Track your health metrics and get personalized insights powered by machine learning.',
    color: 'from-teal-500 to-green-500'
  }
];

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView) {
      const tl = gsap.timeline();

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
      .fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2
        },
        "-=0.3"
      );

      // 3D hover animations for cards
      Array.from(cardsRef.current.children).forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            rotationY: -5,
            rotationX: 5,
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            rotationY: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });
    }
  }, [inView]);

  return (
    <section id="features" ref={ref} className="section-padding bg-white dark:bg-surface relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230066CC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container-custom relative z-10">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-text-primary mb-6">
            Revolutionary <span className="text-gradient">Features</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-text-secondary max-w-4xl mx-auto leading-relaxed">
            Experience healthcare like never before with our cutting-edge AI technology
            and seamless doctor booking system designed for the modern world.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-surface rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 dark:border-border relative overflow-hidden w-full h-[300px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-text-primary mb-4 group-hover:text-purple-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-text-secondary leading-relaxed group-hover:text-gray-700 dark:group-hover:text-text-primary transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/20 dark:group-hover:border-primary-400/20 transition-colors duration-300"></div>
            </div>
          ))}
        </div>

       
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-purple-500/5 dark:bg-primary-400/10 rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-500/5 dark:bg-green-400/10 rounded-full"></div>
    </section>
  );
}