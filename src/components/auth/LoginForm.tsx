import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { isValidPhoneNumber, isValidOTP } from '../../utils/validators';

interface LoginFormProps {
  onRequestOTP: (phoneNumber: string) => Promise<void>;
  onVerifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onRequestOTP,
  onVerifyOTP,
  loading = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async () => {
    setError('');
    setSuccess('');

    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await onRequestOTP(phoneNumber);
      setOtpSent(true);
      setSuccess('OTP sent successfully! Please check your phone.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setSuccess('');

    if (!isValidOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await onVerifyOTP(phoneNumber, otp);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    setOTP('');
    setError('');
    setSuccess('');
    handleRequestOTP();
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter') {
      action();
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Phone Number"
        name="phoneNumber"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        onKeyPress={(e) => !otpSent && handleKeyPress(e, handleRequestOTP)}
        placeholder="Enter your phone number"
        disabled={otpSent || loading}
        helperText="Enter 10-digit phone number"
        sx={{ mb: 2 }}
      />

      {!otpSent ? (
        <Button
          fullWidth
          variant="contained"
          onClick={handleRequestOTP}
          disabled={loading}
          sx={{ height: 48 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Request OTP'}
        </Button>
      ) : (
        <>
          <TextField
            fullWidth
            label="OTP"
            name="otp"
            value={otp}
            onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)}
            placeholder="Enter 6-digit OTP"
            disabled={loading}
            helperText="Enter the OTP sent to your phone"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 6 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            sx={{ mb: 1, height: 48 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
          </Button>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              size="small"
              onClick={() => {
                setOtpSent(false);
                setOTP('');
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              Change Number
            </Button>
            <Button
              size="small"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default LoginForm;
