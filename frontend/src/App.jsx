import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MockDataProvider } from './context/MockDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import NotificationToast from './components/NotificationToast';
import PageTransition from './components/PageTransition';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <MockDataProvider>
            <NotificationToast />
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />

              {/* Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <PageTransition><Dashboard /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <Layout>
                    <PageTransition><Vehicles /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/drivers" element={
                <ProtectedRoute allowedRoles={['fleet_manager','safety_officer']}>
                  <Layout>
                    <PageTransition><Drivers /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/trips" element={
                <ProtectedRoute allowedRoles={['fleet_manager','driver']}>
                  <Layout>
                    <PageTransition><Trips /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/maintenance" element={
                <ProtectedRoute allowedRoles={['fleet_manager']}>
                  <Layout>
                    <PageTransition><Maintenance /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute allowedRoles={['fleet_manager','financial_analyst','driver']}>
                  <Layout>
                    <PageTransition><Expenses /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['fleet_manager','financial_analyst']}>
                  <Layout>
                    <PageTransition><Reports /></PageTransition>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </MockDataProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
