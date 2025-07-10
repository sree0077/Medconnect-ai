import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { User, Mail, Lock, Eye, EyeOff, UserCog } from 'lucide-react';
import FormInput from './FormInput';
import AuthLayout from './AuthLayout';
import FormSelect from './FormSelect';
import AuthHeader from './AuthHeader';
import FormButton from './FormButton';
import SocialLogin from './SocialLogin';
import PasswordStrength from './PasswordStrength';

import { authService } from '../../shared/services/api';
import type { SignupFormData } from '../../shared/types/auth';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const formRef = useRef<HTMLFormElement>(null);
  
  const roleOptions = [
    { value: 'patient', label: 'Patient' },
    { value: 'doctor', label: 'Doctor' },
  ];
  
  useEffect(() => {
    // Animate form elements
    const tl = gsap.timeline();
    
    tl.fromTo(
      '.form-element',
      { 
        opacity: 0,
        y: 20,
      },
      { 
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
      },
    );
  }, []);
  
  const validate = () => {
    const newErrors: {
      fullName?: string; 
      email?: string; 
      password?: string;
      role?: string;
    } = {};
    let isValid = true;
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (!role) {
      newErrors.role = 'Please select a role';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const signupData: SignupFormData = {
        name: fullName,
        email,
        password,
        role: role as 'patient' | 'doctor' | 'admin'
      };

      // Use real backend authentication
      console.log('Attempting signup with:', signupData);

      const response = await authService.signup(signupData);

      // Show success message
      setSuccess(response.message || 'Account created successfully! Redirecting to login...');

      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }

    // Animate button on submit
    gsap.to('.submit-btn', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout>
      <div className="page-transition w-full">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full"
        >
          <AuthHeader
            title="Create Your Account"
            subtitle="Join MedConnect AI to access personalized healthcare services"
          />

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4 border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 mb-4 border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-400">{success}</div>
            </div>
          )}

          <div className="space-y-5">
            <div className="form-element">
              <FormInput
                label="Full Name"
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({...errors, fullName: undefined});
                }}
                placeholder="Enter your full name"
                icon={<User size={18} />}
                required
                error={errors.fullName}
              />
            </div>
            
            <div className="form-element">
              <FormInput
                label="Email"
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({...errors, email: undefined});
                }}
                placeholder="Enter your email address"
                icon={<Mail size={18} />}
                required
                error={errors.email}
              />
            </div>
            
            <div className="form-element">
              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({...errors, password: undefined});
                }}
                placeholder="Create a password"
                icon={<Lock size={18} />}
                required
                error={errors.password}
                rightIcon={
                  showPassword ? 
                    <Eye 
                      size={18} 
                      className="cursor-pointer text-slate-400 hover:text-slate-600" 
                      onClick={togglePasswordVisibility}
                    /> : 
                    <EyeOff 
                      size={18} 
                      className="cursor-pointer text-slate-400 hover:text-slate-600" 
                      onClick={togglePasswordVisibility}
                    />
                }
              />
              <PasswordStrength password={password} />
            </div>
            
            <div className="form-element">
              <FormSelect
                label="Role"
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (errors.role) setErrors({...errors, role: undefined});
                }}
                options={roleOptions}
                placeholder="Select your role"
                icon={<UserCog size={18} />}
                required
                error={errors.role}
              />
            </div>
            
            <div className="form-element">
              <FormButton
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Sign Up
              </FormButton>
            </div>
            
            <SocialLogin />
            
            <p className="form-element text-center text-sm text-slate-600 dark:text-text-secondary mt-6">
              Already have an account? {' '}
              <Link to="/login" className="link text-purple-600 dark:text-primary-400 hover:text-purple-700 dark:hover:text-primary-300 font-medium">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;