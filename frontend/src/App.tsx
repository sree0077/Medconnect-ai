import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Login from './shared/components/Login';
import Signup from './shared/components/Signup';
import Dashboard from './patient/pages/Dashboard';
import LandingHeader from './landing/components/LandingHeader';
import Hero from './landing/components/Hero';
import Features from './landing/components/Features';
import HowItWorks from './landing/components/HowItWorks';
import Pricing from './landing/components/Pricing';
import Footer from './landing/components/Footer';
import ScrollToTop from './shared/components/ScrollToTop';
// Import notifications hook for system-wide security alerts
import { useNotifications } from './shared/hooks/useNotifications';
// Import theme provider
import { ThemeProvider } from './shared/contexts/ThemeContext';
// Import auth provider
import { AuthProvider, useAuth } from './shared/contexts/AuthContext';

import DoctorDashboard from './doctor/pages/DoctorDashboard';
import DoctorAppointments from './doctor/pages/DoctorAppointments';
import DoctorPatients from './doctor/pages/DoctorPatients';
import DoctorGeneratePrescription from './doctor/pages/DoctorGeneratePrescription';
import DoctorSettings from './doctor/pages/DoctorSettings';
import AdminDashboard from './admin/pages/AdminDashboard';
import BookAppointment from './patient/pages/BookAppointment';

// Import new admin components
import { AdminLayout } from './admin/layouts/AdminLayout';
import {
  AdminDashboardOverview,
  AdminUserManagement,
  AdminDoctorApprovals,
  AdminAppointmentMonitoring,
  AdminPrescriptionLogs,
  AdminAIAnalytics,
  AdminSystemSettings,
  AdminSecurityLogs
} from './admin/pages';

import ViewPrescriptions from './patient/pages/ViewPrescriptions';
import SymptomChecker from './patient/pages/SymptomChecker';
import Navbar from './shared/components/Navbar';
import PatientAppointments from './patient/pages/PatientAppointments';
import { PatientLayout } from './patient/layouts/PatientLayout';
import ProfessionalPrescription from './patient/pages/ProfessionalPrescription';
import PatientSettings from './patient/pages/PatientSettings';
import AIConsultation from './patient/pages/AIConsultation';
import ThemeDemo from './shared/components/ThemeDemo';

// Placeholder dashboard components (you'll create these later)
const Unauthorized = () => <div>Unauthorized Access</div>;

// App redirect component that uses auth context
const AppRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = user.role === 'patient' ? '/dashboard'
    : user.role === 'doctor' ? '/doctor/dashboard'
    : user.role === 'admin' ? '/admin/dashboard'
    : '/dashboard';

  return <Navigate to={dashboardPath} replace />;
};

// Landing Page Component
function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

function App() {

  // Initialize notifications context for security alerts
  useNotifications(); // This will check for security alerts automatically

  useEffect(() => {
    // Clear any malformed tokens on app start
    const token = localStorage.getItem('token');
    if (token && token.startsWith('mock-jwt-token')) {
      console.log('Clearing malformed mock token');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Set up animations for elements with the 'fade-in' class
    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach(element => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        onEnter: () => element.classList.add('visible'),
      });
    });

    // Set up staggered animations for elements with the 'staggered-fade-in' class
    const staggeredContainers = document.querySelectorAll('.staggered-container');
    staggeredContainers.forEach(container => {
      const elements = container.querySelectorAll('.staggered-fade-in');

      ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
          });
        },
      });
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-background">
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/theme-demo" element={<ThemeDemo />} />

          {/* Redirect to dashboard based on authentication and role */}
          <Route
            path="/app"
            element={<AppRedirect />}
          />

          {/* Patient Routes with New Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute requiredRole="patient">
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientLayout>
                  <ViewPrescriptions />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/prescription/:id"
            element={
              <ProtectedRoute requiredRole="patient">
                <ProfessionalPrescription />
              </ProtectedRoute>
            }
          />

          <Route
            path="/symptom-checker"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientLayout>
                  <SymptomChecker />
                </PatientLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-consultation"
            element={
              <ProtectedRoute requiredRole="patient">
                <AIConsultation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientSettings />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes with New Layout */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorPatients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/generate-prescription"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorGeneratePrescription />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorSettings />
              </ProtectedRoute>
            }
          />

          {/* Legacy doctor prescription route for backward compatibility */}
          <Route
            path="/doctor/prescriptions/new"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorGeneratePrescription />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes with New Layout */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboardOverview />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminUserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDoctorApprovals />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminAppointmentMonitoring />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/prescriptions"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminPrescriptionLogs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminAIAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminSystemSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/security"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminSecurityLogs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Legacy admin dashboard for backward compatibility */}
          <Route
            path="/admin/old-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <AdminDashboard />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;