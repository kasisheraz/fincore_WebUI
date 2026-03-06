import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/auth/LoginForm';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { requestOTP, login, isLoading } = useAuth();

  const handleRequestOTP = async (phoneNumber: string) => {
    await requestOTP(phoneNumber);
  };

  const handleVerifyOTP = async (phoneNumber: string, otp: string) => {
    await login(phoneNumber, otp);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              py: 3,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              FinCore
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              User Management System
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your phone number to receive an OTP
            </Typography>

            <LoginForm
              onRequestOTP={handleRequestOTP}
              onVerifyOTP={handleVerifyOTP}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="white"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2,
            opacity: 0.8,
          }}
        >
          © 2026 FinCore. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;
