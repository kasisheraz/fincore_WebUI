import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  VerifiedUser,
  PlayArrow,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import kycWorkflowService, { WorkflowProgress } from '../../services/kycWorkflowService';
import { useAuth } from '../../context/AuthContext';

interface KycWidgetProps {
  userId?: number;
}

const KycWidget: React.FC<KycWidgetProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<WorkflowProgress | null>(null);
  const [hasActiveWorkflow, setHasActiveWorkflow] = useState(false);

  useEffect(() => {
    checkKycStatus();
  }, [userId]);

  const checkKycStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get the latest verification status
      // Note: This assumes we have a way to get the latest verification ID
      // In production, you'd call an endpoint like /api/kyc/workflow/latest
      
      // For now, set to "not started" state
      setHasActiveWorkflow(false);
      setKycStatus(null);
    } catch (err: any) {
      console.error('Failed to check KYC status:', err);
      setError(null); // Don't show error, just assume no KYC
      setHasActiveWorkflow(false);
      setKycStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartKyc = () => {
    navigate('/kyc/start');
  };

  const handleContinueKyc = () => {
    if (kycStatus && kycStatus.verificationId) {
      navigate(`/kyc/status/${kycStatus.verificationId}`);
    } else {
      navigate('/kyc/start');
    }
  };

  const getStatusIcon = () => {
    if (!kycStatus) return <PlayArrow />;

    switch (kycStatus.status) {
      case 'APPROVED':
        return <CheckCircle />;
      case 'REJECTED':
        return <Warning />;
      case 'PENDING':
        return <Schedule />;
      default:
        return <PlayArrow />;
    }
  };

  const getStatusColor = () => {
    if (!kycStatus) return '#003D2A';

    switch (kycStatus.status) {
      case 'APPROVED':
        return '#16A34A';
      case 'REJECTED':
        return '#DC2626';
      case 'PENDING':
        return '#D97706';
      default:
        return '#003D2A';
    }
  };

  const getStatusText = () => {
    if (!kycStatus) return 'Not Started';

    switch (kycStatus.status) {
      case 'APPROVED':
        return 'Verified';
      case 'REJECTED':
        return 'Rejected';
      case 'PENDING':
        return 'Under Review';
      case 'EXPIRED':
        return 'Expired';
      default:
        return 'In Progress';
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #003D2A 0%, #00563D 100%)',
          color: 'white',
          borderRadius: 2,
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Card>
    );
  }

  // No KYC started
  if (!kycStatus || kycStatus.status === 'NOT_STARTED') {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #003D2A 0%, #00563D 100%)',
          color: 'white',
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 61, 42, 0.3)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                p: 1.5,
                mr: 2,
              }}
            >
              <VerifiedUser sx={{ fontSize: 40 }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Complete Your KYC
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Verify your identity to unlock full access
              </Typography>
            </Box>
          </Box>

          <Box sx={{ my: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              ✓ Quick 5-minute process
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              ✓ Secure document upload
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ✓ Instant verification
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleStartKyc}
            startIcon={<PlayArrow />}
            sx={{
              mt: 2,
              backgroundColor: 'white',
              color: '#003D2A',
              fontWeight: 600,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#F0F9FF',
              },
            }}
          >
            Start KYC Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  // KYC approved
  if (kycStatus.status === 'APPROVED') {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                KYC Verified
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your account is fully verified
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
              },
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // KYC in progress or under review
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        color: 'white',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(217, 119, 6, 0.3)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              p: 1.5,
              mr: 2,
            }}
          >
            {getStatusIcon()}
          </Box>
          <Box flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              KYC Verification
            </Typography>
            <Chip
              label={getStatusText()}
              size="small"
              sx={{
                mt: 0.5,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {kycStatus.progressPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={kycStatus.progressPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
              },
            }}
          />
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
            Current Step: {kycStatus.currentStep}
          </Typography>
        </Box>

        {kycStatus.status === 'PENDING' && kycStatus.progressPercentage < 100 ? (
          <Button
            variant="contained"
            fullWidth
            onClick={handleContinueKyc}
            sx={{
              backgroundColor: 'white',
              color: '#D97706',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#FEF3C7',
              },
            }}
          >
            Continue Verification
          </Button>
        ) : (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            }}
          >
            Your verification is under review. We'll notify you once complete.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default KycWidget;
