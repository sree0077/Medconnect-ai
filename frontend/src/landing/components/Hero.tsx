import React, { useEffect, useRef, Suspense } from 'react';
import { ArrowRight, Shield, Heart, Clock } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import BrainHeroVisualization from './BrainHeroVisualization';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView) {
      const tl = gsap.timeline();

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 30, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power1.out' }
      )
      .fromTo(
        subheadingRef.current,
        { opacity: 0, y: 20, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power1.out' },
        '-=0.7'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power1.out' },
        '-=0.6'
      )
      .fromTo(
        statsRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power1.out' },
        '-=0.5'
      )
      .fromTo(
        imageRef.current,
        { opacity: 0, x: 40, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power1.out' },
        '-=0.8'
      );
    }
  }, [inView]);

  return (
    <section ref={ref} className="min-h-screen pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-background via-primary-50 to-secondary-50 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-70"
          style={{
            zIndex: 1,
          }}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
          onPlay={() => console.log('Video started playing')}
          onError={(e) => console.error('Video error:', e)}
          onLoadedData={() => console.log('Video data loaded')}
        >
          <source src="/neural.mp4" type="video/mp4" />
          <source src="/DNA.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Video overlay to maintain the gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-primary-50/40 to-secondary-50/60" style={{ zIndex: 2 }}></div>
      </div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 flex flex-col items-start">
            <h1
              ref={headingRef}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-8 md:mb-10 leading-tight max-w-3xl lg:max-w-2xl"
            >
              Digital Healthcare
              <span className="text-primary-500 ml-2">Reimagined with Intelligence.</span>
            </h1>
            <p
              ref={subheadingRef}
              className="text-lg md:text-xl text-text-secondary mb-10 md:mb-12 max-w-2xl lg:max-w-xl leading-relaxed"
            >
              Experience the future of healthcare with MedConnect AI. Our intelligent platform connects you with doctors, analyzes symptoms, and manages prescriptions - all powered by advanced AI.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mb-10 w-full">
              <Link to="/login" className="btn btn-primary w-full sm:w-auto">
                Try For Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="#how-it-works" className="btn btn-outline w-full sm:w-auto">
                Schedule a Demo
              </a>
            </div>

            <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-text-primary">HIPAA</div>
                  <div className="text-text-secondary">Compliant</div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-secondary-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-text-primary">98%</div>
                  <div className="text-text-secondary">Satisfaction</div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-text-primary">24/7</div>
                  <div className="text-text-secondary">Support</div>
                </div>
              </div>
            </div>
          </div>

          <div ref={imageRef} className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg h-[500px]">
              {/* Background decorative elements */}
              <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>

              {/* 3D Brain Visualization - No Card, Just Floating */}
              <div className="relative w-full h-full">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  </div>
                }>
                  <BrainHeroVisualization />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;