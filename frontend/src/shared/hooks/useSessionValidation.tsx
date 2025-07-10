import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SessionValidationOptions {
  requiredRole?: 'patient' | 'doctor' | 'admin';
  redirectOnFailure?: boolean;
  validateOnMount?: boolean;
  validateOnFocus?: boolean;
}

export const useSessionValidation = (options: SessionValidationOptions = {}) => {
  const {
    requiredRole,
    redirectOnFailure = true,
    validateOnMount = true,
    validateOnFocus = true,
  } = options;

  const { user, isAuthenticated, validateSession, logout } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  // Minimum time between validations (10 minutes to reduce blinks)
  const VALIDATION_INTERVAL = 10 * 60 * 1000;

  const performValidation = async (force = false) => {
    // Skip if already validating or recently validated (unless forced)
    if (isValidating || (!force && lastValidation && 
        Date.now() - lastValidation.getTime() < VALIDATION_INTERVAL)) {
      return true;
    }

    setIsValidating(true);
    
    try {
      const isValid = await validateSession();
      setLastValidation(new Date());

      if (!isValid) {
        console.warn('Session validation failed');
        if (redirectOnFailure) {
          await logout();
        }
        return false;
      }

      // Check role-based access if required
      if (requiredRole && user?.role !== requiredRole) {
        console.warn(`Role validation failed: expected ${requiredRole}, got ${user?.role}`);
        if (redirectOnFailure) {
          const dashboardPath = user?.role === 'patient' ? '/dashboard'
            : user?.role === 'doctor' ? '/doctor/dashboard'
            : user?.role === 'admin' ? '/admin/dashboard'
            : '/unauthorized';
          navigate(dashboardPath);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      if (redirectOnFailure) {
        await logout();
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Validate on mount with delay to prevent initial blink
  useEffect(() => {
    if (validateOnMount && isAuthenticated) {
      // Add small delay to prevent blink on page load
      const timer = setTimeout(() => {
        performValidation();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [validateOnMount, isAuthenticated]);

  // Validate when window gains focus (user returns to tab)
  useEffect(() => {
    if (!validateOnFocus) return;

    const handleFocus = () => {
      if (isAuthenticated) {
        performValidation();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [validateOnFocus, isAuthenticated]);

  // Validate periodically while page is active
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        performValidation();
      }
    }, VALIDATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    isValidating,
    lastValidation,
    validateNow: () => performValidation(true),
    isSessionValid: isAuthenticated && (!requiredRole || user?.role === requiredRole),
  };
};
