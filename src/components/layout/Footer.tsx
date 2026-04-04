import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2D3748',
        color: '#ffffff',
        py: 3,
        px: 2,
        mt: 'auto',
        width: '100%',
        borderTop: '3px solid #003D2A',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Company Info */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              FinCore
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Financial Management Platform
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link 
                href="/dashboard" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Dashboard
              </Link>
              <Link 
                href="/users" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Users
              </Link>
              <Link 
                href="/organizations" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Organizations
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link 
                href="/settings" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Settings
              </Link>
              <Link 
                href="/diagnostics" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textDecoration: 'none',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Diagnostics
              </Link>
              <Typography 
                variant="body2" 
                sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}
              >
                Help Center
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            mt: 3, 
            pt: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            © {currentYear} FinCore. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
