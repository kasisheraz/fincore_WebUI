import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  PictureAsPdf,
  Download,
  DateRange,
  BarChart,
  Add,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const reportTypes = [
    {
      title: 'Application Summary Report',
      description: 'Overview of all applications with status breakdown',
      icon: <Assessment />,
      frequency: 'Daily',
      lastGenerated: '2024-02-09',
    },
    {
      title: 'Financial Performance Report',
      description: 'Portfolio performance and financial metrics',
      icon: <TrendingUp />,
      frequency: 'Weekly',
      lastGenerated: '2024-02-07',
    },
    {
      title: 'Customer Analytics Report',
      description: 'Customer behavior and satisfaction metrics',
      icon: <BarChart />,
      frequency: 'Monthly',
      lastGenerated: '2024-02-01',
    },
  ];

  const recentReports = [
    {
      name: 'Monthly Application Report - January 2024',
      type: 'Application Summary',
      date: '2024-02-01',
      status: 'Ready',
    },
    {
      name: 'Q4 2023 Financial Performance',
      type: 'Financial Performance',
      date: '2024-01-15',
      status: 'Ready',
    },
    {
      name: 'Customer Satisfaction Analysis',
      type: 'Customer Analytics',
      date: '2024-01-30',
      status: 'Ready',
    },
    {
      name: 'Weekly Operations Report',
      type: 'Operations',
      date: '2024-02-05',
      status: 'Processing',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <PageHeader 
        title="Reports & Analytics"
        buttonText="Generate Report"
        buttonIcon={<Add />}
        onButtonClick={() => console.log('Generate new report')}
      />
      
      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="fincore-card-shadow">
              <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                247
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reports Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                98%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Report Templates */}
        <Grid item xs={12} md={6}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Available Report Types
              </Typography>
              <Box sx={{ mt: 2 }}>
                {reportTypes.map((report, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        py: 2,
                      }}
                    >
                      <Box sx={{ color: 'primary.main', mr: 2, mt: 0.5 }}>
                        {report.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {report.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {report.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Generated {report.frequency} • Last: {report.lastGenerated}
                        </Typography>
                      </Box>
                      <Button variant="outlined" size="small">
                        Generate
                      </Button>
                    </Box>
                    {index < reportTypes.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12} md={6}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Recent Reports
                </Typography>
                <Button variant="outlined" size="small" startIcon={<DateRange />}>
                  View All
                </Button>
              </Box>
              <List>
                {recentReports.map((report, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      px: 0, 
                      py: 1.5,
                      borderBottom: index < recentReports.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon>
                      <PictureAsPdf color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          {report.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {report.type} • {report.date}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: report.status === 'Ready' ? 'success.main' : 'warning.main',
                              fontWeight: 'medium'
                            }}
                          >
                            {report.status}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Download />}
                      disabled={report.status !== 'Ready'}
                    >
                      Download
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
                Quick Report Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<Assessment />}
                    sx={{ height: 56 }}
                  >
                    Generate Summary
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<TrendingUp />}
                    sx={{ height: 56 }}
                  >
                    Performance Report
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<BarChart />}
                    sx={{ height: 56 }}
                  >
                    Analytics Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    startIcon={<DateRange />}
                    sx={{ height: 56 }}
                  >
                    Schedule Report
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default Reports;