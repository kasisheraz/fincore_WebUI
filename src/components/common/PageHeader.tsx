import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  showButton?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  buttonText = 'Go to Application', 
  buttonIcon = <ArrowForward />,
  onButtonClick,
  showButton = true,
}) => {
  return (
    <Box sx={{ 
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid #E5E7EB',
      pl: 0,
      pr: 4,
      py: 3,
      mb: 3,
      position: 'relative',
      left: '-220px',
      width: 'calc(100% + 220px)',
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pl: '240px', 
        pr: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#003D2A' }}>
          {title}
        </Typography>
        {showButton && (
          <Button
            variant="contained"
            endIcon={buttonIcon}
            onClick={onButtonClick}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
            }}
          >
            {buttonText}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
