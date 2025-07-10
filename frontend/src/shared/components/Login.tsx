import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import FormInput from './FormInput';
import FormButton from './FormButton';
import Checkbox from './Checkbox';
import AuthHeader from './AuthHeader';
import SocialLogin from './SocialLogin';

import { authService } from '../../shared/services/api';
import type { LoginFormData } from '../../shared/types/auth';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [error, setError] = useState<string>('');

  const formRef = useRef<HTMLFormElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

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
    const newErrors: {email?: string; password?: string} = {};
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Use the centralized auth context login method
      await login(email, password);

      // Login successful - navigation is handled by AuthContext
      console.log('Login successful');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Enhanced handling for account status errors
      if (err.response?.status === 403) {
        const errorData = err.response.data;
        // Use more specific error messages based on the error type
        if (errorData.error === "Account pending approval") {
          setError('Your account is awaiting admin approval. Please check back later.');
          console.log("Account is pending approval - login blocked");
        } else if (errorData.error === "Account not approved") {
          setError('Your account has not been approved or has been deactivated. Please contact support.');
          console.log("Account was rejected by admin - login blocked");
        } else {
          setError(errorData.message || 'Your account is not active or requires approval.');
        }
      } else {
        // General login errors
        setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
      }
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
      <div className="page-transition w-full max-w-md mx-auto">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="card"
        >
          <AuthHeader
            title="Login to MedConnect AI"
            subtitle="Enter your credentials to access your account"
          />

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4 border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          )}

          <div className="space-y-5">
            <div className="form-element">
              <FormInput
                label="Email or Username"
                type="text"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({...errors, email: undefined});
                }}
                placeholder="Enter your email or username"
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
                placeholder="Enter your password"
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
            </div>

            <div className="form-element flex items-center justify-between">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                label="Remember me"
              />

              <a href="#" className="link text-sm text-purple-600 dark:text-primary-400 hover:text-purple-700 dark:hover:text-primary-300">
                Forgot password?
              </a>
            </div>

            <div className="form-element">
              <FormButton
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Login
              </FormButton>
            </div>

            <SocialLogin />

            <p className="form-element text-center text-sm text-slate-600 dark:text-text-secondary mt-6">
              Don't have an account? {' '}
              <Link to="/signup" className="link text-purple-600 dark:text-primary-400 hover:text-purple-700 dark:hover:text-primary-300 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;