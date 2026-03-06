import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import IndividualApplication from './pages/IndividualApplication';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/auth/Login';
import UsersPage from './pages/users/UsersPage';
import OrganizationsPage from './pages/organizations/OrganizationsPage';
import KYCDocumentsPage from './pages/kyc/KYCDocumentsPage';
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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: '220px',
            transition: 'margin-left 0.3s ease',
            backgroundColor: '#F8F9FA',
            minHeight: '100vh',
          }}
        >
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title="FinCore" />
          <Outlet />
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
        <Route path="/kyc-documents" element={<KYCDocumentsPage />} />
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
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;