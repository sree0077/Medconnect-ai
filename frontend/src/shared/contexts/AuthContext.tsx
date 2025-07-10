import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Skip validation on initial load to prevent blink
          // Validation will happen via useSessionValidation hook in components
        } else {
          // No stored auth, set loading to false immediately
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await logout();
      } finally {
        // Set loading to false after a minimal delay to prevent flash
        setTimeout(() => setIsLoading(false), 50);
      }
    };

    initializeAuth();
  }, []);

  const validateSession = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return false;

      // Make a test API call to validate token
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update user data if it has changed
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      setToken(response.token);
      setUser(response.user);
      
      // Navigate based on user role
      const dashboardPath = response.user.role === 'patient' ? '/dashboard'
        : response.user.role === 'doctor' ? '/doctor/dashboard'
        : '/admin/dashboard';
      
      navigate(dashboardPath);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all auth state
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('notifications');
      
      // Navigate to login
      navigate('/login');
    }
  };

  const refreshAuth = async (): Promise<void> => {
    await validateSession();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    validateSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
