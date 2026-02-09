import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import {
  Person,
  Business,
  CheckCircle,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import StepIndicator from '../components/common/StepIndicator';
import PageHeader from '../components/common/PageHeader';

const IndividualApplication: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    nationality: 'United Kingdom',
    monthlyTurnover: '',
    transactionCount: '',
  });

  const steps = [
    { label: 'Contacts', status: currentStep > 1 ? 'completed' as const : currentStep === 1 ? 'active' as const : 'pending' as const },
    { label: 'Volumes', status: currentStep > 2 ? 'completed' as const : currentStep === 2 ? 'active' as const : 'pending' as const },
    { label: 'CDD & Documents', status: currentStep > 3 ? 'completed' as const : currentStep === 3 ? 'active' as const : 'pending' as const },
    { label: 'Review', status: currentStep === 4 ? 'active' as const : 'pending' as const },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <PageHeader 
        title="New Individual Application"
        buttonText="Go to Application"
        buttonIcon={<ArrowForward />}
        onButtonClick={() => navigate('/applications')}
      />
      
      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {/* Step Progress Indicator */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <StepIndicator steps={steps} />
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '2px solid #2D8A6A', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: '#2D8A6A15',
                    color: '#2D8A6A',
                  }}>
                    <Person fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#002A1A' }}>
                      156
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Total Clients
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '2px solid #F59E0B', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: '#F59E0B15',
                    color: '#F59E0B',
                  }}>
                    <Business fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#002A1A' }}>
                      23
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Pending Reviews
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '2px solid #3B82F6', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: '#3B82F615',
                    color: '#3B82F6',
                  }}>
                    <CheckCircle fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#002A1A' }}>
                      98
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Active Applications
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Form Card */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Step 1: Contacts */}
            {currentStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#002A1A' }}>
                  Contact Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. John"
                      InputLabelProps={{ 
                        sx: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Doe"
                      InputLabelProps={{ 
                        sx: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44..."
                      InputLabelProps={{ 
                        sx: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email (Optional)"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@fincore.com"
                      InputLabelProps={{ 
                        sx: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      InputLabelProps={{ 
                        shrink: true,
                        sx: { fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Nationality
                      </InputLabel>
                      <Select
                        name="nationality"
                        value={formData.nationality}
                        label="Nationality"
                      >
                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                        <MenuItem value="United States">United States</MenuItem>
                        <MenuItem value="France">France</MenuItem>
                        <MenuItem value="Germany">Germany</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Monthly Volumes */}
            {currentStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#002A1A' }}>
                  Monthly Volumes
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Monthly Turnover
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          name="monthlyTurnover"
                          value={formData.monthlyTurnover}
                          displayEmpty
                        >
                          <MenuItem value="">Select Range</MenuItem>
                          <MenuItem value="0-5000">€0 - €5,000</MenuItem>
                          <MenuItem value="5001-20000">€5,001 - €20,000</MenuItem>
                          <MenuItem value="20001+">€20,001+</MenuItem>
                        </Select>
                      </FormControl>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Transaction Count
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          name="transactionCount"
                          value={formData.transactionCount}
                          displayEmpty
                        >
                          <MenuItem value="">Select Range</MenuItem>
                          <MenuItem value="0-50">0 - 50</MenuItem>
                          <MenuItem value="51-200">51 - 200</MenuItem>
                          <MenuItem value="201+">201+</MenuItem>
                        </Select>
                      </FormControl>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 3: CDD & Documents */}
            {currentStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#002A1A' }}>
                  CDD & Documents
                </Typography>
                <Box sx={{ 
                  border: '2px dashed #CBD5E0', 
                  borderRadius: 2, 
                  p: 6, 
                  textAlign: 'center',
                  backgroundColor: '#F8F9FA',
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#4A5568' }}>
                    Drag & Drop Documents Here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    or click to browse files
                  </Typography>
                  <Button variant="outlined" sx={{ borderColor: '#2D8A6A', color: '#2D8A6A' }}>
                    Upload Documents
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#002A1A' }}>
                  Review Application
                </Typography>
                <Box sx={{ p: 3, backgroundColor: '#E6F4F0', borderRadius: 2, border: '1px solid #2D8A6A' }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#2D8A6A', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Application Ready for Submission
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review all details before submitting the application.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #E5E7EB' }}>
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={currentStep === 1}
                sx={{ 
                  color: '#6B7280',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:disabled': {
                    color: '#CBD5E0',
                  }
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                disabled={currentStep === 4}
                sx={{
                  backgroundColor: '#2D8A6A',
                  '&:hover': {
                    backgroundColor: '#246F55',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                }}
              >
                {currentStep === 4 ? 'Submit' : 'Next Step'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IndividualApplication;
