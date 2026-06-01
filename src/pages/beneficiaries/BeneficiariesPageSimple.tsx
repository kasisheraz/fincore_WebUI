import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AccountBalance } from '@mui/icons-material';

/**
 * Temporary Beneficiaries Page - Simple placeholder until full UI is ready
 * 
 * @author AI Assistant
 * @since 2.2.0
 */
const BeneficiariesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AccountBalance sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Beneficiaries Module
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The Beneficiary Management feature is now available via API.
          </Typography>
          <Typography variant="body2" paragraph>
            Backend API: <strong>LIVE</strong> ✅
          </Typography>
          <Typography variant="body2" paragraph>
            Frontend UI: <strong>In Development</strong> 🚧
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Use API Documentation or Postman Collection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See: postman-beneficiary-management.json
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test Plan: BENEFICIARY_UI_TEST_PLAN.md
            </Typography>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default BeneficiariesPage;
