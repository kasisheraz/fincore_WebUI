import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { useThemeContext } from '../../context/ThemeContext';
import { ThemeMode } from '../../theme/themeConfig';

const ThemeSwitcher: React.FC = () => {
  const { themeMode, setThemeMode } = useThemeContext();

  const handleThemeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTheme: ThemeMode | null
  ) => {
    if (newTheme !== null) {
      setThemeMode(newTheme);
    }
  };

  return (
    <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.5px',
          display: 'block',
          mb: 1.5,
        }}
      >
        Theme
      </Typography>
      <ToggleButtonGroup
        value={themeMode}
        exclusive
        onChange={handleThemeChange}
        aria-label="theme selector"
        fullWidth
        sx={{
          display: 'flex',
          gap: 0.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px !important',
            mx: 0,
            color: '#ffffff',
            textTransform: 'capitalize',
            fontSize: '0.75rem',
            fontWeight: 500,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 600,
              border: '2px solid rgba(255, 255, 255, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            },
          },
        }}
      >
        <ToggleButton value="green" aria-label="green theme">
          Green
        </ToggleButton>
        <ToggleButton value="burgundy" aria-label="burgundy theme">
          Burgundy
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ThemeSwitcher;
