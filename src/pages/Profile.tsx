import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Security,
  NotificationsActive,
  AccountBalance,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John Anderson',
    email: 'john.anderson@fincore.com',
    phone: '+1 (555) 123-4567',
    address: '123 Financial District, New York, NY 10004',
    department: 'Financial Services',
    position: 'Senior Financial Advisor',
    employeeId: 'FC-2024-EMP-001',
    joinDate: 'January 15, 2020',
  });

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
  };

  const profileSections = [
    {
      title: 'Personal Information',
      icon: <Person />,
      items: [
        { label: 'Full Name', value: userInfo.name },
        { label: 'Employee ID', value: userInfo.employeeId },
        { label: 'Join Date', value: userInfo.joinDate },
        { label: 'Department', value: userInfo.department },
        { label: 'Position', value: userInfo.position },
      ]
    },
    {
      title: 'Contact Information',
      icon: <Email />,
      items: [
        { label: 'Email', value: userInfo.email },
        { label: 'Phone', value: userInfo.phone },
        { label: 'Address', value: userInfo.address },
      ]
    }
  ];

  const quickActions = [
    { title: 'Security Settings', icon: <Security />, description: 'Manage password and 2FA' },
    { title: 'Notifications', icon: <NotificationsActive />, description: 'Configure alert preferences' },
    { title: 'Account Details', icon: <AccountBalance />, description: 'View account information' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <PageHeader 
        title="My Profile"
        buttonText="Edit Profile"
        buttonIcon={<Edit />}
        onButtonClick={handleEditProfile}
      />
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Header Card */}
          <Grid item xs={12}>
            <Card className="fincore-card-shadow">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{ 
                      width: 120, 
                    height: 120, 
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {userInfo.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {userInfo.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    {userInfo.position}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {userInfo.department}
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Edit />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information */}
        {profileSections.map((section, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card className="fincore-card-shadow" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ color: 'primary.main', mr: 2 }}>
                    {section.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {section.title}
                  </Typography>
                </Box>
                <List>
                  {section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {item.value}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out',
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ color: 'primary.main', mr: 2 }}>
                            {action.icon}
                          </Box>
                          <Typography variant="h6" component="h4">
                            {action.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 3 }}>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profile updated"
                    secondary="Updated contact information - 2 hours ago"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Security color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password changed"
                    secondary="Security settings updated - 1 day ago"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notification preferences updated"
                    secondary="Email notifications enabled - 3 days ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userInfo.name}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userInfo.email}
                  variant="outlined"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={userInfo.phone}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={userInfo.address}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={userInfo.department}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={userInfo.position}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default Profile;