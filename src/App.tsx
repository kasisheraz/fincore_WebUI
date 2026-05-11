import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import IndividualApplication from './pages/IndividualApplication';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/auth/Login';
import UsersPage from './pages/users/UsersPage';
import OrganizationsPage from './pages/organizations/OrganizationsPage';
import KYCVerificationPage from './pages/kyc/KYCVerificationPage';
import QuestionnairePage from './pages/questionnaire/QuestionnairePage';
import CustomerAnswersPage from './pages/answers/CustomerAnswersPage';
import Diagnostics from './pages/Diagnostics';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

/**
 * Layout component for authenticated pages
 */
const AppLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            m: 0,
            pt: '56px',
            marginLeft: '180px',
            backgroundColor: '#F8F9FA',
            minHeight: '100vh',
            width: 'calc(100% - 180px)',
            overflow: 'hidden',
            overflowY: 'auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Header title="FinCore" />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading application..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected Routes - using layout with Outlet */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/kyc-verification" element={<KYCVerificationPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/customer-answers" element={<CustomerAnswersPage />} />
        <Route path="/new-application" element={<IndividualApplication />} />
        <Route path="/applications/*" element={<Applications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;