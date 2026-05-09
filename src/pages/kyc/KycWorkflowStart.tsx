import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  AccountBalance as BasicIcon,
  Security as EnhancedIcon,
  VerifiedUser as FullIcon,
  ArrowForward as StartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import kycWorkflowService from '../../services/kycWorkflowService';

type VerificationLevel = 'BASIC' | 'ENHANCED' | 'FULL';

interface LevelDetails {
  level: VerificationLevel;
  title: string;
  description: string;
  icon: React.ReactElement;
  features: string[];
  recommended?: boolean;
}

const verificationLevels: LevelDetails[] = [
  {
    level: 'BASIC',
    title: 'Basic Verification',
    description: 'Essential verification for standard transactions',
    icon: <BasicIcon sx={{ fontSize: 40 }} />,
    features: [
      'Email & phone verification',
      'Basic identity check',
      'Transaction limit: $1,000/day',
      'Processing time: ~24 hours'
    ]
  },
  {
    level: 'ENHANCED',
    title: 'Enhanced Verification',
    description: 'Comprehensive verification for higher limits',
    icon: <EnhancedIcon sx={{ fontSize: 40 }} />,
    features: [
      'Document verification',
      'Address confirmation',
      'Transaction limit: $10,000/day',
      'Processing time: ~48 hours'
    ],
    recommended: true
  },
  {
    level: 'FULL',
    title: 'Full Verification',
    description: 'Complete verification for unlimited access',
    icon: <FullIcon sx={{ fontSize: 40 }} />,
    features: [
      'Full identity verification',
      'Enhanced due diligence',
      'Unlimited transactions',
      'Processing time: ~72 hours'
    ]
  }
];

const KycWorkflowStart: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel>('ENHANCED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      const workflow = await kycWorkflowService.startWorkflow(selectedLevel);
      
      // Navigate to wizard with verification ID
      navigate(`/kyc/workflow?verificationId=${workflow.verificationId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start verification workflow');
      console.error('Failed to start workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Start KYC Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Choose your verification level to get started
        </Typography>

        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>What is KYC?</strong> Know Your Customer (KYC) verification ensures the security of your account 
            and helps us comply with financial regulations. The process typically takes 2-5 minutes to complete.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {verificationLevels.map((levelDetails) => (
            <Grid item xs={12} md={4} key={levelDetails.level}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: selectedLevel === levelDetails.level ? '2px solid' : '1px solid',
                  borderColor: selectedLevel === levelDetails.level ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  position: 'relative'
                }}
                onClick={() => setSelectedLevel(levelDetails.level)}
              >
                {levelDetails.recommended && (
                  <Chip
                    label="Recommended"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 1 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {levelDetails.icon}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {levelDetails.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {levelDetails.description}
                  </Typography>

                  <List dense>
                    {levelDetails.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontSize: '0.875rem'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Radio
                    checked={selectedLevel === levelDetails.level}
                    value={levelDetails.level}
                    name="verification-level"
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartWorkflow}
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} /> : <StartIcon />}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Starting...' : 'Start Verification'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 3 }}>
          By proceeding, you agree to provide accurate information and consent to identity verification.
        </Typography>
      </Paper>
    </Container>
  );
};

export default KycWorkflowStart;
