import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Notifications,
  Security,
  Language,
  Palette,
  Storage,
  AccountCircle,
  Email,
  Phone,
  Lock,
  Save,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC-5',
    currency: 'USD',
  });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const settingSections = [
    {
      title: 'Account Settings',
      icon: <AccountCircle />,
      items: [
        {
          label: 'Change Password',
          description: 'Update your account password',
          action: () => setPasswordDialogOpen(true),
        },
        {
          label: 'Two-Factor Authentication',
          description: 'Enable 2FA for enhanced security',
          action: () => {},
        },
        {
          label: 'Login Sessions',
          description: 'Manage active login sessions',
          action: () => {},
        },
      ]
    },
    {
      title: 'Privacy Settings',
      icon: <Security />,
      items: [
        {
          label: 'Data Export',
          description: 'Download your personal data',
          action: () => {},
        },
        {
          label: 'Account Deletion',
          description: 'Permanently delete your account',
          action: () => {},
        },
      ]
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <PageHeader 
        title="Settings"
        buttonText="Save Settings"
        buttonIcon={<Save />}
        onButtonClick={() => console.log('Settings saved')}
      />
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" component="h2">
                  Notification Preferences
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Email Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive updates via email
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">SMS Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive updates via text message
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Push Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive browser notifications
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.marketing}
                      onChange={() => handleNotificationChange('marketing')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">Marketing Communications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive promotional emails and updates
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Palette sx={{ color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" component="h2">
                  Application Preferences
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={preferences.theme}
                    label="Theme"
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={preferences.language}
                    label="Language"
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={preferences.timezone}
                    label="Timezone"
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  >
                    <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                    <MenuItem value="UTC-7">Mountain Time (UTC-7)</MenuItem>
                    <MenuItem value="UTC-6">Central Time (UTC-6)</MenuItem>
                    <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={preferences.currency}
                    label="Currency"
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  >
                    <MenuItem value="USD">US Dollar (USD)</MenuItem>
                    <MenuItem value="EUR">Euro (EUR)</MenuItem>
                    <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                    <MenuItem value="CAD">Canadian Dollar (CAD)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account & Security Settings */}
        {settingSections.map((section, sectionIndex) => (
          <Grid item xs={12} md={6} key={sectionIndex}>
            <Card className="fincore-card-shadow">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ color: 'primary.main', mr: 2 }}>
                    {section.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {section.title}
                  </Typography>
                </Box>
                
                <List sx={{ p: 0 }}>
                  {section.items.map((item, index) => (
                    <ListItem 
                      key={index}
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        borderBottom: index < section.items.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {item.label}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        }
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={item.action}
                      >
                        Manage
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* System Information */}
        <Grid item xs={12}>
          <Card className="fincore-card-shadow">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Storage sx={{ color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" component="h2">
                  System Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Application Version
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    FinCore v1.0.0
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    February 9, 2024
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Production
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Check for Updates
                </Button>
                <Button variant="outlined">
                  Export Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setPasswordDialogOpen(false)}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default Settings;