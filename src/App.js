import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import NavigationLoader from './components/common/NavigationLoader';

// Pages
import Home from './pages/Home';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VolunteerRegister from './components/auth/VolunteerRegister';

// User Components
import Dashboard from './components/user/Dashboard';
import SafetyProfile from './components/user/SafetyProfile';
import EmergencyContacts from './components/user/EmergencyContacts';
import { AlertHistoryPage } from './components/user/AlertHistory';

// Volunteer Components
import VolunteerDashboard from './components/volunteer/VolunteerDashboard';
import VolunteerProfile from './components/volunteer/VolunteerProfile';
import AlertNotifications from './components/volunteer/AlertNotifications';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import VolunteerManagement from './components/admin/VolunteerManagement';
import AlertMonitoring from './components/admin/AlertMonitoring';
import Reports from './components/admin/Reports';
import SafeZoneManagement from './components/admin/SafeZoneManagement';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'volunteer':
        return <Navigate to="/volunteer/dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

// Layout Component
const Layout = ({ children, showFooter = true }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />

      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      <Route path="/volunteer/register" element={
        <PublicRoute>
          <VolunteerRegister />
        </PublicRoute>
      } />

      {/* User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['user']}>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['user']}>
          <Layout><SafetyProfile /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/contacts" element={
        <ProtectedRoute allowedRoles={['user']}>
          <Layout><EmergencyContacts /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/history" element={
        <ProtectedRoute allowedRoles={['user']}>
          <Layout><AlertHistoryPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Volunteer Routes */}
      <Route path="/volunteer/dashboard" element={
        <ProtectedRoute allowedRoles={['volunteer']}>
          <Layout><VolunteerDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/volunteer/alerts" element={
        <ProtectedRoute allowedRoles={['volunteer']}>
          <Layout>
            <div className="container" style={{ padding: '20px 0' }}>
              <div className="card">
                <h2 style={{ marginBottom: '20px' }}>Alert Notifications</h2>
                <AlertNotifications />
              </div>
            </div>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/volunteer/profile" element={
        <ProtectedRoute allowedRoles={['volunteer']}>
          <Layout><VolunteerProfile /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout showFooter={false}><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout showFooter={false}><UserManagement /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/volunteers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout showFooter={false}><VolunteerManagement /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/alerts" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout showFooter={false}><AlertMonitoring /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout showFooter={false}><Reports /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/safezones" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout showFooter={false}><SafeZoneManagement /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <NavigationLoader />
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
