import React, { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import MedicalIllustration from './MedicalIllustration';
import BackButton from './BackButton';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animate background elements
    gsap.fromTo(
      bgRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );
    
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
      <div ref={logoRef} className="pt-6 pb-2">
        <BackButton />
      </div>

      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden bg-white dark:bg-surface shadow-card dark:shadow-2xl border dark:border-border">
          {/* Main content - Form */}
          <div className="w-full md:w-1/2 py-8 px-4 md:px-8">
            {children}
          </div>

          {/* Illustration side with DNA video background inside card */}
          <div
            ref={bgRef}
            className="hidden md:block w-full md:w-1/2 relative overflow-hidden rounded-r-3xl"
          >
            {/* DNA Video Background - Fills complete container */}
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover auth-video-bg rounded-r-3xl"
              style={{
                zIndex: 1,
              }}
            >
              <source src="/DNA.mp4" type="video/mp4" />
            </video>

            {/* Video overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/75 via-purple-600/60 to-secondary/75 rounded-r-3xl" style={{ zIndex: 2 }}></div>

            {/* Content overlay - Text over video within card */}
            <div className="relative p-8 h-full flex flex-col justify-center items-center text-white" style={{ zIndex: 3, minHeight: '100%' }}>
              <div className="text-center mb-8">
                <MedicalIllustration />
              </div>
              <h2 className="text-3xl font-bold text-center drop-shadow-lg mb-4">
                Advanced Healthcare Solutions
              </h2>
              <p className="text-center text-white/95 max-w-md drop-shadow-md leading-relaxed text-lg">
                Connect with healthcare professionals and get AI-powered medical insights all in one platform.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} MedConnect AI. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
