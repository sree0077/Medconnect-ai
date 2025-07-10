import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-secondary text-text-primary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center mr-2">
                <div className="w-6 h-6 rounded-full bg-white"></div>
              </div>
              <span className="text-xl font-bold">MedConnect<span className="text-primary-500">AI</span></span>
            </div>
            <p className="text-text-muted mb-4">
              Intelligent healthcare solutions powered by artificial intelligence. Connecting patients and providers seamlessly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-muted hover:text-primary-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-text-muted hover:text-primary-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-text-muted hover:text-primary-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-text-muted hover:text-primary-500 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Our Team</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Partners</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Developers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">HIPAA Compliance</a></li>
              <li><a href="#" className="text-text-muted hover:text-text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-muted text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MedConnect AI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-text-muted hover:text-text-secondary text-sm transition-colors">Privacy</a>
            <a href="#" className="text-text-muted hover:text-text-secondary text-sm transition-colors">Terms</a>
            <a href="#" className="text-text-muted hover:text-text-secondary text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
