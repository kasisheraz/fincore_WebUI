import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { ThemeMode } from '../theme/themeConfig';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('green');

  // Create dynamic theme based on selected mode
  const getThemeConfig = (mode: ThemeMode) => {
    const colors = {
      green: {
        sidebar: '#003D2A',
        primary: '#1F7A5C',
        primaryLight: '#2D8A6A',
        primaryDark: '#0D5940',
        accent: '#E6F7F1',
        accentBg: '#F0FDF4',
        warning: '#D97706',
      },
      burgundy: {
        sidebar: '#5C0E20',
        primary: '#9B2150',
        primaryLight: '#B92D61',
        primaryDark: '#7A1A3E',
        accent: '#FDF2F8',
        accentBg: '#FDF4F8',
        warning: '#D97706',
      },
    };

    const themeColors = colors[mode];

    return createTheme({
      palette: {
        primary: {
          main: themeColors.primary,
          light: themeColors.primaryLight,
          dark: themeColors.primaryDark,
        },
        secondary: {
          main: themeColors.primary,
          light: themeColors.primaryLight,
          dark: themeColors.primaryDark,
        },
        warning: {
          main: themeColors.warning,
        },
        error: {
          main: '#DC2626',
        },
        info: {
          main: '#2563EB',
        },
        success: {
          main: themeColors.primary,
        },
        background: {
          default: '#F8F9FA',
          paper: '#FFFFFF',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 700,
        },
        h5: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 600,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
            contained: {
              backgroundColor: themeColors.primary,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: themeColors.primaryDark,
              },
            },
            outlined: {
              borderColor: themeColors.primary,
              color: themeColors.primary,
              '&:hover': {
                backgroundColor: themeColors.accent,
                borderColor: themeColors.primaryDark,
              },
            },
          },
        },
      },
    });
  };

  const theme = getThemeConfig(themeMode);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
