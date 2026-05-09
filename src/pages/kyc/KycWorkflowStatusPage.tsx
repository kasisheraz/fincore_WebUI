import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Button,
  Divider
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as ReviewIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import kycWorkflowService, { WorkflowStatus } from '../../services/kycWorkflowService';
import { formatDate } from '../../utils/formatters';

const KycWorkflowStatusPage: React.FC = () => {
  const { verificationId } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (verificationId) {
      loadStatus();
    }
  }, [verificationId]);

  const loadStatus = async () => {
    if (!verificationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await kycWorkflowService.getStatus(parseInt(verificationId));
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (verificationStatus: string) => {
    switch (verificationStatus) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      case 'EXPIRED':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (verificationStatus: string) => {
    switch (verificationStatus) {
      case 'APPROVED':
        return <CompleteIcon />;
      case 'REJECTED':
        return <RejectedIcon />;
      case 'PENDING':
        return <PendingIcon />;
      default:
        return <ReviewIcon />;
    }
  };

  const getStepStatus = (stepCompleted: boolean, currentStepName: string, stepName: string) => {
    if (stepCompleted) return 'completed';
    if (currentStepName === stepName) return 'active';
    return 'pending';
  };

  const renderStepCard = (stepName: string, stepLabel: string, stepCompleted: boolean) => {
    const stepStatus = stepCompleted ? 'completed' : 'pending';

    return (
      <Card
        variant="outlined"
        sx={{
          borderColor: stepCompleted ? 'success.main' : 'divider',
          backgroundColor: stepCompleted ? 'success.lighter' : 'background.paper'
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            {stepCompleted ? (
              <CompleteIcon color="success" />
            ) : (
              <PendingIcon color="disabled" />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">
                {stepLabel}
              </Typography>
            </Box>
            <Chip
              label={stepCompleted ? 'Complete' : 'Pending'}
              color={stepCompleted ? 'success' : 'default'}
              size="small"
            />
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !status) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Verification not found'}
        </Alert>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Verification Status
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadStatus}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Overall Status */}
        <Card variant="outlined" sx={{ mb: 3, backgroundColor: 'background.default' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              {getStatusIcon(status.status)}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">
                  Overall Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verification ID: #{status.verificationId}
                </Typography>
              </Box>
              <Chip
                label={status.status}
                color={getStatusColor(status.status)}
                icon={getStatusIcon(status.status)}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Verification Level:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {status.level}
                </Typography>
              </Box>

              {status.riskLevel && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Risk Level:
                  </Typography>
                  <Chip
                    label={status.riskLevel}
                    size="small"
                    color={status.riskLevel === 'LOW' ? 'success' : status.riskLevel === 'HIGH' ? 'error' : 'warning'}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Submitted:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatDate(status.submittedAt)}
                </Typography>
              </Box>

              {status.reviewedAt && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Reviewed:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(status.reviewedAt)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Completion Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="primary">
              {status.progressPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={status.progressPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Current Step: {status.currentStep.replace(/_/g, ' ')}
          </Typography>
        </Box>

        {/* Workflow Steps */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Verification Steps
        </Typography>
        <Stack spacing={2}>
          {renderStepCard('USER_INFO', 'Step 1: User Information', status.steps.USER_INFO)}
          {renderStepCard('DOCUMENT_VERIFICATION', 'Step 2: Document Verification', status.steps.DOCUMENT_VERIFICATION)}
          {renderStepCard('QUESTIONNAIRE', 'Step 3: Compliance Questionnaire', status.steps.QUESTIONNAIRE)}
          {renderStepCard('REVIEW', 'Step 4: Admin Review', status.steps.REVIEW)}
          {renderStepCard('COMPLETED', 'Final: Completion', status.steps.COMPLETED)}
        </Stack>

        {/* Action Messages */}
        {status.status === 'PENDING' && !status.steps.REVIEW && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Your verification is in progress. Please complete all steps to submit for review.
          </Alert>
        )}

        {status.status === 'PENDING' && status.steps.REVIEW && (
          <Alert severity="info" icon={<ReviewIcon />} sx={{ mt: 3 }}>
            Your verification has been submitted and is currently under review. 
            You will be notified once the review is complete.
          </Alert>
        )}

        {status.status === 'APPROVED' && (
          <Alert severity="success" icon={<CompleteIcon />} sx={{ mt: 3 }}>
            Congratulations! Your verification has been approved. 
            You now have full access to all features.
          </Alert>
        )}

        {status.status === 'REJECTED' && (
          <Alert severity="error" icon={<RejectedIcon />} sx={{ mt: 3 }}>
            Unfortunately, your verification was not approved. 
            Please contact support for more information.
          </Alert>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>

          {!status.steps.COMPLETED && status.progressPercentage < 100 && (
            <Button
              variant="contained"
              onClick={() => navigate(`/kyc/workflow?verificationId=${verificationId}`)}
            >
              Continue Verification
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default KycWorkflowStatusPage;
