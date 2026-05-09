import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Send as SubmitIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import kycWorkflowService, { WorkflowStatus, QuestionAnswer } from '../../services/kycWorkflowService';
import questionnaireService from '../../services/questionnaireService';
import { Question } from '../../types/questionnaire.types';

const steps = ['User Information', 'Document Verification', 'Compliance Questions', 'Review & Submit'];

const KycWorkflowWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verificationIdParam = searchParams.get('verificationId');

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [verificationId, setVerificationId] = useState<number | null>(
    verificationIdParam ? parseInt(verificationIdParam) : null
  );
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);

  // Step 2: SumSub Mock State
  const [sumsubApplicantId, setSumsubApplicantId] = useState<string>('');
  const [documentUploaded, setDocumentUploaded] = useState(false);

  // Step 3: Questionnaire State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Load workflow status if verificationId exists
  useEffect(() => {
    if (verificationId) {
      loadWorkflowStatus();
    }
  }, [verificationId]);

  // Load questions for step 3
  useEffect(() => {
    if (activeStep === 2) {
      loadQuestions();
    }
  }, [activeStep]);

  const loadWorkflowStatus = async () => {
    if (!verificationId) return;
    
    try {
      setLoading(true);
      const status = await kycWorkflowService.getStatus(verificationId);
      setWorkflowStatus(status);
      
      // Determine current step based on status
      if (!status.steps.DOCUMENT_VERIFICATION) {
        setActiveStep(1);
      } else if (!status.steps.QUESTIONNAIRE) {
        setActiveStep(2);
      } else if (!status.steps.REVIEW) {
        setActiveStep(3);
      } else {
        // Already completed
        navigate(`/kyc/status/${verificationId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load workflow status');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await questionnaireService.search({ status: 'ACTIVE' });
      setQuestions(response.content);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions');
    }
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!verificationId) {
        setError('No verification ID found');
        return;
      }

      // Execute step completion based on current step
      switch (activeStep) {
        case 0:
          await kycWorkflowService.completeStep1(verificationId);
          setSuccess('User information validated successfully');
          break;
        
        case 1:
          if (!sumsubApplicantId) {
            setError('Please complete document verification');
            return;
          }
          await kycWorkflowService.completeStep2(verificationId, sumsubApplicantId);
          setSuccess('Document verification completed successfully');
          break;
        
        case 2:
          // Validate all questions answered
          const unanswered = questions.filter(q => !answers[q.id]);
          if (unanswered.length > 0) {
            setError('Please answer all questions before proceeding');
            return;
          }
          
          const questionAnswers: QuestionAnswer[] = Object.entries(answers).map(([qId, answer]) => ({
            questionId: parseInt(qId),
            answerText: answer
          }));
          
          await kycWorkflowService.completeStep3(verificationId, questionAnswers);
          setSuccess('Questionnaire completed successfully');
          break;
        
        case 3:
          await kycWorkflowService.completeStep4(verificationId);
          setSuccess('Verification submitted for review!');
          // Navigate to status page after brief delay
          setTimeout(() => {
            navigate(`/kyc/status/${verificationId}`);
          }, 2000);
          return;
      }

      setActiveStep((prev) => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete step');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
    setSuccess(null);
  };

  const handleMockDocumentUpload = () => {
    // Simulate document upload with mock SumSub
    const mockId = `MOCK_${Math.random().toString(36).substring(7).toUpperCase()}`;
    setSumsubApplicantId(mockId);
    setDocumentUploaded(true);
    setSuccess('Document uploaded successfully (Mock)');
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll verify that your account information is complete.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Your profile information will be validated automatically. Click "Next" to proceed.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Document Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your identification documents for verification.
            </Typography>
            
            {!documentUploaded ? (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    Mock Document Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    In production, this would integrate with SumSub for real document verification.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMockDocumentUpload}
                    disabled={loading}
                  >
                    Simulate Document Upload
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
                Document verified successfully!
                <br />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Applicant ID: {sumsubApplicantId}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Compliance Questionnaire
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please answer the following questions to complete your verification.
            </Typography>
            
            {questions.length === 0 ? (
              <Alert severity="info">Loading questions...</Alert>
            ) : (
              <Stack spacing={3}>
                {questions.map((question, index) => (
                  <Card key={question.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {index + 1}. {question.questionText}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Enter your answer..."
                        sx={{ mt: 2 }}
                        required
                      />
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your information and submit for verification.
            </Typography>
            
            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Step 1: User Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Profile information validated
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Step 2: Document Verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Documents verified ({sumsubApplicantId})
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Step 3: Compliance Questionnaire
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ {questions.length} questions answered
                  </Typography>
                </CardContent>
              </Card>

              <Alert severity="warning" sx={{ mt: 2 }}>
                By submitting, you confirm that all information provided is accurate and complete.
              </Alert>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!verificationId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          No verification ID found. Please start from the beginning.
        </Alert>
        <Button onClick={() => navigate('/kyc/start')} sx={{ mt: 2 }}>
          Start KYC Process
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          KYC Verification Process
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ minHeight: 300 }}>
          {renderStepContent()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} /> : activeStep === 3 ? <SubmitIcon /> : <NextIcon />}
          >
            {loading ? 'Processing...' : activeStep === 3 ? 'Submit for Review' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default KycWorkflowWizard;
