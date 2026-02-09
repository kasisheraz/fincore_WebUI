import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface StepIndicatorProps {
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  return (
    <Box sx={{ width: '100%', py: 3 }}>
      <Stack direction="row" spacing={0} alignItems="center" justifyContent="space-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Step Circle */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor:
                    step.status === 'completed' ? '#1F7A5C' :
                    step.status === 'active' ? '#D97706' :
                    '#E5E7EB',
                  border: step.status === 'active' ? '3px solid #D97706' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step.status === 'pending' ? '#6B7280' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  mb: 1.5,
                  position: 'relative',
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                {step.status === 'completed' ? '✓' : index + 1}
              </Box>
              {/* Step Label */}
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  color: step.status === 'active' ? '#003D2A' : '#6B7280',
                  fontWeight: step.status === 'active' ? 600 : 400,
                  fontSize: '0.75rem',
                  px: 1,
                  textTransform: 'none',
                  lineHeight: 1.3,
                  maxWidth: '120px',
                }}
              >
                {step.label}
              </Typography>
            </Box>
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 0.5,
                  height: 2,
                  backgroundColor:
                    steps[index + 1].status === 'completed' || step.status === 'completed'
                      ? '#1F7A5C'
                      : '#E5E7EB',
                  mb: 5,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  top: '-18px',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
};

export default StepIndicator;
