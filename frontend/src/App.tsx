import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Footer } from './components/Footer.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { SymptomCheckerPage } from './pages/SymptomCheckerPage.js';
import { MedicalReportsPage } from './pages/MedicalReportsPage.js';
import { MedicalImagePage } from './pages/MedicalImagePage.js';
import { MedicineInfoPage } from './pages/MedicineInfoPage.js';
import { HealthProfilePage } from './pages/HealthProfilePage.js';
import { HealthMemoryPage } from './pages/HealthMemoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { EmergencyInfoPage } from './pages/EmergencyInfoPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { HelpPage } from './pages/HelpPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';

// Loading Spinner Component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Initializing Clinical Session...
      </p>
    </div>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Certain public landing pages don't need the sidebar layout
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user && !isAuthPage && !isLandingPage && <Sidebar />}

        <main className={`flex-1 min-w-0 ${user && !isAuthPage && !isLandingPage ? 'md:pl-8' : ''}`}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/emergency" element={<EmergencyInfoPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected Patient Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptoms"
          element={
            <ProtectedRoute>
              <SymptomCheckerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MedicalReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/images"
          element={
            <ProtectedRoute>
              <MedicalImagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <MedicineInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <HealthProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory"
          element={
            <ProtectedRoute>
              <HealthMemoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Telemetry Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};
