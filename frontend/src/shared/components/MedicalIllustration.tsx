import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MedicalIllustration: React.FC = () => {
  const illustrationRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (illustrationRef.current) {
      // Animate illustration elements
      gsap.fromTo(
        illustrationRef.current.querySelectorAll('.animate-item'),
        { 
          opacity: 0,
          y: 10
        },
        { 
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.3
        }
      );
      
      // Subtle floating animation for doctor
      gsap.to(
        illustrationRef.current.querySelector('.doctor-float'),
        {
          y: '-=8',
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        }
      );
    }
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto">
      <img 
        src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
        alt="Medical professional with technology"
        className="w-full h-auto rounded-lg shadow-lg"
      />
      <div className="mt-8 text-center text-white">
        <h3 className="text-xl font-semibold mb-2 animate-item">Transforming Healthcare</h3>
        <p className="text-sm text-white/80 animate-item">
          Connecting patients with healthcare professionals through innovative AI solutions
        </p>
      </div>
    </div>
  );
};

export default MedicalIllustration;