import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
} from '@mui/material';
import { useThemeContext } from '../../context/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import {
  Dashboard,
  Person,
  Description,
  Assessment,
  Settings,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Clients', icon: <Person />, path: '/applications' },
  { text: 'Onboarding', icon: <Description />, path: '/profile' },
  { text: 'Analytics', icon: <Assessment />, path: '/reports' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode } = useThemeContext();

  const sidebarColors = {
    green: '#003D2A',
    burgundy: '#5C0E20',
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: 220,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 220,
          boxSizing: 'border-box',
          backgroundColor: sidebarColors[themeMode],
          color: '#ffffff',
          borderRight: 'none',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        background: sidebarColors[themeMode]
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#ffffff',
            letterSpacing: '-1px',
            fontSize: '1.75rem',
          }}
        >
          F
          <Box component="span" sx={{ position: 'relative', display: 'inline-block', mx: -0.3 }}>
            <Box component="span" sx={{ 
              color: '#DC2626', 
              fontWeight: 'bold', 
              display: 'inline-block',
              transform: 'scaleX(0.5)',
            }}>$</Box>
            <Box 
              component="span" 
              sx={{ 
                position: 'absolute', 
                top: '-4px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                color: '#ffffff',
                fontSize: '0.4em',
                fontWeight: 'bold',
              }}
            >
              •
            </Box>
          </Box>
          nCore
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5, fontSize: '0.85rem' }}>
          Financial Management
        </Typography>
      </Box>
      <Box sx={{ overflow: 'auto', pt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 0,
                  mx: 0,
                  px: 3,
                  py: 1.5,
                  mb: 0.5,
                  color: '#ffffff',
                  position: 'relative',
                  '&.Mui-selected': {
                    backgroundColor: '#ffffff',
                    color: sidebarColors[themeMode],
                    fontWeight: 600,
                    '&::before': {
                      content: '\"\"',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 4,
                      height: '100%',
                      backgroundColor: '#F59E0B',
                      borderRadius: 0,
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                    '& .MuiListItemIcon-root': {
                      color: sidebarColors[themeMode],
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem',
                    color: 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ mt: 'auto' }}>
        <ThemeSwitcher />
      </Box>
    </Drawer>
  );
};

export default Sidebar;