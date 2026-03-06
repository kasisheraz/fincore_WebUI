import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning } from '@mui/icons-material';
import { API_CONFIG } from '../config/config';
import apiService from '../services/apiService';
import userService from '../services/userService';
import organizationService from '../services/organizationService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const DiagnosticsPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, details } : r);
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Check Configuration
    updateResult('Configuration', 'pending', 'Checking...');
    try {
      const config = {
        apiBaseUrl: API_CONFIG.BASE_URL,
        environment: process.env.NODE_ENV,
        mockAuth: process.env.REACT_APP_MOCK_AUTH,
      };
      updateResult('Configuration', 'success', 'Configuration loaded', config);
    } catch (error: any) {
      updateResult('Configuration', 'error', error.message);
    }

    // Test 2: Check Authentication
    updateResult('Authentication', 'pending', 'Checking...');
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) {
        updateResult('Authentication', 'success', 'User is authenticated', { 
          user: JSON.parse(user),
          hasToken: true 
        });
      } else {
        updateResult('Authentication', 'warning', 'Not logged in', {
          hasToken: !!token,
          hasUser: !!user
        });
      }
    } catch (error: any) {
      updateResult('Authentication', 'error', error.message);
    }

    // Test 3: Test Users API
    updateResult('Users API', 'pending', 'Fetching users...');
    try {
      const users = await userService.getUsers();
      updateResult('Users API', 'success', `Found ${users.length} users`, {
        count: users.length,
        sample: users.slice(0, 3)
      });
    } catch (error: any) {
      updateResult('Users API', 'error', error.message || 'Failed to fetch users', {
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Test 4: Test Organizations API
    updateResult('Organizations API', 'pending', 'Fetching organizations...');
    try {
      const orgs = await organizationService.getOrganizations();
      updateResult('Organizations API', 'success', `Found ${orgs.length} organizations`, {
        count: orgs.length,
        sample: orgs.slice(0, 3)
      });
    } catch (error: any) {
      updateResult('Organizations API', 'error', error.message || 'Failed to fetch organizations', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }

    // Test 5: Network Connectivity
    updateResult('Network', 'pending', 'Checking connectivity ...');
    try {
      const response = await fetch(API_CONFIG.BASE_URL.replace('/api', ''));
      updateResult('Network', 'success', `Backend server reachable (${response.status})`);
    } catch (error: any) {
      updateResult('Network', 'error', 'Cannot reach backend server', error.message);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'pending':
        return <CircularProgress size={24} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Diagnostics
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Run diagnostics to check system health and connectivity
      </Typography>

      <Box sx={{ mt: 3, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={runDiagnostics}
          disabled={testing}
        >
          {testing ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
      </Box>

      {results.length > 0 && (
        <Stack spacing={2}>
          {results.map((result) => (
            <Card key={result.name}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 2 }}>
                    {getStatusIcon(result.status)}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {result.name}
                  </Typography>
                  <Chip 
                    label={result.status.toUpperCase()} 
                    color={getStatusColor(result.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {result.message}
                </Typography>
                {result.details && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" component="pre" sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200
                    }}>
                      {JSON.stringify(result.details, null, 2)}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {results.length === 0 && !testing && (
        <Alert severity="info">
          Click "Run Diagnostics" to check system health
        </Alert>
      )}
    </Box>
  );
};

export default DiagnosticsPage;
