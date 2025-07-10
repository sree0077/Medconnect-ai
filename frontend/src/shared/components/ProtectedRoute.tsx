import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'patient' | 'doctor' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, validateSession, logout } = useAuth();
  const [isValidating, setIsValidating] = useState(false);

  // Validate session only on mount, not on every route change to prevent blinks
  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated && !isValidating) {
        setIsValidating(true);
        const isValid = await validateSession();
        if (!isValid) {
          console.warn('Invalid session detected, logging out...');
          await logout();
        }
        setIsValidating(false);
      }
    };

    // Only validate on mount, not on route changes
    checkSession();
  }, [isAuthenticated]); // Removed location.pathname dependency

  // Show loading only for initial auth loading, not for quick validations
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Access denied: User role '${user.role}' does not match required role '${requiredRole}'`);

    // Redirect to appropriate dashboard based on user's actual role
    const dashboardPath = user.role === 'patient' ? '/dashboard'
      : user.role === 'doctor' ? '/doctor/dashboard'
      : user.role === 'admin' ? '/admin/dashboard'
      : '/unauthorized';

    return <Navigate to={dashboardPath} replace />;
  }

  // Additional security check for doctor status
  if (user.role === 'doctor' && user.status !== 'active') {
    console.warn(`Doctor access denied: Status '${user.status}' is not active`);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Account Not Active</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your doctor account is currently {user.status}. Please contact the administrator for assistance.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}