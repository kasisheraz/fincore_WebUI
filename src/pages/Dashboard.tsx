import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AccountBalance,
  Assignment,
  AccessTime,
  CheckCircle,
  Add,
} from '@mui/icons-material';
import StepIndicator from '../components/common/StepIndicator';
import PageHeader from '../components/common/PageHeader';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = [
    {
      title: 'Total Applications',
      value: '24',
      icon: <Assignment fontSize="large" />,
      color: '#003D2A',
      trend: '+12%',
    },
    {
      title: 'Pending Review',
      value: '8',
      icon: <AccessTime fontSize="large" />,
      color: '#D97706',
      trend: '+5%',
    },
    {
      title: 'Approved',
      value: '14',
      icon: <CheckCircle fontSize="large" />,
      color: '#1F7A5C',
      trend: '+8%',
    },
    {
      title: 'Success Rate',
      value: '76%',
      icon: <TrendingUp fontSize="large" />,
      color: '#2563EB',
      trend: '+3%',
    },
  ];

  const steps = [
    { label: 'Personal & Contacts', status: 'completed' as const },
    { label: 'Financial Volumes', status: 'completed' as const },
    { label: 'CDD & Documents', status: 'active' as const },
    { label: 'Agreements & Blacklist', status: 'pending' as const },
  ];

  const recentApplications = [
    { id: 1, name: 'Personal Loan', status: 'Approved', amount: '$50,000', date: '2024-02-09' },
    { id: 2, name: 'Credit Card', status: 'Under Review', amount: '$15,000', date: '2024-02-08' },
    { id: 3, name: 'Mortgage', status: 'Pending', amount: '$300,000', date: '2024-02-07' },
    { id: 4, name: 'Auto Loan', status: 'Approved', amount: '$25,000', date: '2024-02-06' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#1F7A5C';
      case 'Under Review':
        return '#D97706';
      case 'Pending':
        return '#D97706';
      case 'Rejected':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#E6F7F1';
      case 'Under Review':
        return '#FEF3C7';
      case 'Pending':
        return '#FEF3C7';
      case 'Rejected':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <PageHeader 
        title="FINCORE Dashboard" 
        buttonText="New Application"
        buttonIcon={<Add />}
        onButtonClick={() => navigate('/new-application')}
      />
      
      <Box sx={{ p: 3 }}>
        {/* Step Indicator */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 61, 42, 0.08)' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#003D2A', fontWeight: 600 }}>
          Application Progress
        </Typography>
        <StepIndicator steps={steps} />
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{
                background: '#ffffff',
                border: `2px solid ${stat.color}`,
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 20px ${stat.color}40`,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    color: stat.color, 
                    mr: 2,
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: `${stat.color}15`,
                  }}>
                    {stat.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#003D2A',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={stat.trend} 
                  size="small" 
                  sx={{
                    backgroundColor: stat.color === '#2D8A6A' || stat.color === '#F59E0B' ? stat.color : `${stat.color}15`,
                    color: stat.color === '#2D8A6A' || stat.color === '#F59E0B' ? '#ffffff' : stat.color,
                    fontWeight: 600,
                    border: stat.color === '#2D8A6A' || stat.color === '#F59E0B' ? 'none' : `1px solid ${stat.color}`,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} md={8}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#003D2A', fontWeight: 600 }}>
                Recent Applications
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recentApplications.map((app) => (
                  <Box
                    key={app.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#002A1A' }}>
                        {app.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {app.amount} • {app.date}
                      </Typography>
                    </Box>
                    <Chip 
                      label={app.status} 
                      size="small"
                      sx={{
                        backgroundColor: getStatusBg(app.status),
                        color: getStatusColor(app.status),
                        fontWeight: 600,
                        border: `1px solid ${getStatusColor(app.status)}`,
                        borderRadius: '16px',
                        px: 1,
                      }}
                    />
                  </Box>
                ))}
              </Box>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/applications')}
                sx={{ 
                  mt: 2,
                  borderColor: '#1F7A5C',
                  color: '#1F7A5C',
                  borderWidth: '1.5px',
                  '&:hover': {
                    borderColor: '#003D2A',
                    backgroundColor: 'rgba(0, 61, 42, 0.05)',
                    transform: 'translateY(-1px)',
                  }
                }}
                fullWidth
              >
                View All Applications
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#003D2A', fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained"
                  fullWidth
                  startIcon={<Assignment />}
                  sx={{
                    backgroundColor: '#1F7A5C',
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#0D5940',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(45, 138, 106, 0.4)',
                    }
                  }}
                >
                  New Application
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<AccountBalance />}
                  sx={{
                    borderColor: '#2D8A6A',
                    color: '#2D8A6A',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: '1.5px',
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#002A1A',
                      backgroundColor: '#002A1A05',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  View Portfolio
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<TrendingUp />}
                  sx={{
                    borderColor: '#2D8A6A',
                    color: '#2D8A6A',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: '1.5px',
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#002A1A',
                      backgroundColor: '#002A1A05',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="fincore-card-shadow" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#003D2A', fontWeight: 600 }}>
                Performance Overview
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  Application Completion Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    mb: 2,
                    backgroundColor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1F7A5C',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  85% completed this month
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  Customer Satisfaction
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={92} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    mb: 2,
                    backgroundColor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#3B82F6',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  92% satisfaction rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
