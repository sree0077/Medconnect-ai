import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../shared/components/ThemeToggle';

const LandingHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-surface/95 backdrop-blur-sm shadow-soft py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="#" className="flex items-center">
          <span className="text-xl font-bold text-text-primary">MedConnectAI</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Features</a>
          <a href="#how-it-works" className="text-text-secondary hover:text-text-primary transition-colors font-medium">How It Works</a>
          <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors font-medium">Pricing</a>
          <ThemeToggle size="sm" />
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">Get Started</Link>
        </nav>

        {/* Mobile Theme Toggle and Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <ThemeToggle size="sm" />
          <button className="text-text-secondary" onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-4 py-4 bg-white/95 dark:bg-surface/95 backdrop-blur-sm border-t border-gray-200 dark:border-border">
          <div className="flex flex-col space-y-4">
            <a href="#features" className="text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary py-2 transition-colors font-medium" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary py-2 transition-colors font-medium" onClick={() => setIsOpen(false)}>How It Works</a>
            <a href="#pricing" className="text-gray-600 dark:text-text-secondary hover:text-gray-900 dark:hover:text-text-primary py-2 transition-colors font-medium" onClick={() => setIsOpen(false)}>Pricing</a>
            <Link to="/login" className="bg-purple-600 hover:bg-purple-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 w-full text-center" onClick={() => setIsOpen(false)}>Get Started</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
