import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { menuItems } from './Sidebar';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user || !user.firstName || !user.lastName) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 220,
        right: 0,
        zIndex: 1200,
        background: '#003D2A',
        color: '#ffffff',
        p: 0,
        m: 0,
        borderRadius: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: 'calc(100% - 220px)',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: 2,
        px: 2,
        py: 0.5,
        minHeight: '64px',
      }}>
        {/* Left side - Horizontal Navigation Menu */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          flexGrow: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
          },
        }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              startIcon={item.icon}
              sx={{
                color: '#ffffff',
                textTransform: 'none',
                px: 2,
                py: 1,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 1,
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                borderBottom: location.pathname === item.path ? '2px solid #F59E0B' : '2px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Badge 
              badgeContent={4} 
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#FF9800',
                  color: '#ffffff',
                }
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton 
            color="inherit"
            onClick={handleMenuOpen}
            aria-label="User menu"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: { width: 220, mt: 1.5 },
            }}
          >
            {user && (
              <>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;