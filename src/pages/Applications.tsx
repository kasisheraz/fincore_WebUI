import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

interface Application {
  id: number;
  applicantName: string;
  applicationId: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  priority: string;
}

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      applicantName: 'John Doe',
      applicationId: 'FC-2024-001',
      type: 'Personal Loan',
      amount: '$50,000',
      status: 'Approved',
      date: '2024-02-09',
      priority: 'High',
    },
    {
      id: 2,
      applicantName: 'Jane Smith',
      applicationId: 'FC-2024-002',
      type: 'Credit Card',
      amount: '$15,000',
      status: 'Under Review',
      date: '2024-02-08',
      priority: 'Medium',
    },
    {
      id: 3,
      applicantName: 'Mike Johnson',
      applicationId: 'FC-2024-003',
      type: 'Mortgage',
      amount: '$300,000',
      status: 'Pending',
      date: '2024-02-07',
      priority: 'High',
    },
    {
      id: 4,
      applicantName: 'Sarah Wilson',
      applicationId: 'FC-2024-004',
      type: 'Auto Loan',
      amount: '$25,000',
      status: 'Approved',
      date: '2024-02-06',
      priority: 'Low',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [newApplicationOpen, setNewApplicationOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Under Review':
        return 'warning';
      case 'Pending':
        return 'info';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesType = !typeFilter || app.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleNewApplication = () => {
    setNewApplicationOpen(true);
  };

  const handleCloseNewApplication = () => {
    setNewApplicationOpen(false);
  };

  const applicationTypes = ['Personal Loan', 'Credit Card', 'Mortgage', 'Auto Loan', 'Business Loan'];
  const statuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <PageHeader 
        title="Applications Management"
        buttonText="New Application"
        buttonIcon={<Add />}
        onButtonClick={() => navigate('/new-application')}
      />
      
      <Box sx={{ p: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="fincore-metric-card fincore-hover-lift">
              <CardContent>
                <Typography 
                  variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="fincore-metric-card fincore-hover-lift">
            <CardContent>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {applications.filter(app => app.status === 'Approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {applications.filter(app => app.status === 'Under Review').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {applications.filter(app => app.status === 'Pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card className="fincore-card-shadow" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {applicationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="fincore-card-shadow">
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Application ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow 
                    key={application.id}
                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                  >
                    <TableCell>{application.applicationId}</TableCell>
                    <TableCell>{application.applicantName}</TableCell>
                    <TableCell>{application.type}</TableCell>
                    <TableCell>{application.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status) as any}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.priority}
                        color={getPriorityColor(application.priority) as any}
                        variant="filled"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{application.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="info">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* New Application Dialog */}
      <Dialog open={newApplicationOpen} onClose={handleCloseNewApplication} maxWidth="md" fullWidth>
        <DialogTitle>Create New Application</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Applicant Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Application Type</InputLabel>
                  <Select label="Application Type">
                    {applicationTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority">
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewApplication}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseNewApplication}>
            Create Application
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default Applications;