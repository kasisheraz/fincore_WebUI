import { createTheme, ThemeProvider } from '@mui/material/styles';

// FinCore Dark Green theme inspired by modern design patterns
export const finCoreTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003D2A', // WCAG Compliant Dark Green (4.5:1 with white)
      light: '#2E8B67',
      dark: '#002418',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1F7A5C', // WCAG Compliant Action Green (4.5:1 on white)
      light: '#4CAF50',
      dark: '#0D5940',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F7FA', // Light grey background
      paper: '#ffffff',
    },
    text: {
      primary: '#2D3748', // Dark grey
      secondary: '#718096', // Medium grey
    },
    success: {
      main: '#2D8A6A',
      light: '#4CAF50',
      dark: '#00704F',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6', // Blue accent
      light: '#60A5FA',
      dark: '#2563EB',
    },
    grey: {
      50: '#F8F9FA',
      100: '#E8F5E8',
      200: '#C8E6C9',
      300: '#A5D6A7',
      400: '#81C784',
      500: '#66BB6A',
      600: '#4CAF50',
      700: '#43A047',
      800: '#388E3C',
      900: '#2E7D32',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#2D3748',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#2D3748',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2D3748',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2D3748',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#2D3748',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6,
      color: '#2D3748',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2D3748',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#718096',
    },
    caption: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#718096',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          backgroundColor: '#1F7A5C',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0D5940',
            boxShadow: '0 4px 12px rgba(45, 138, 106, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#2D8A6A',
          color: '#2D8A6A',
          borderWidth: '1.5px',
          '&:hover': {
            borderColor: '#002A1A',
            backgroundColor: 'rgba(0, 42, 26, 0.04)',
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 42, 26, 0.08)',
          border: '1px solid rgba(0, 42, 26, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 42, 26, 0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          boxShadow: '0 2px 8px rgba(27, 94, 32, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(27, 94, 32, 0.12)',
          boxShadow: '2px 0 8px rgba(27, 94, 32, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(27, 94, 32, 0.08)',
            color: '#1B5E20',
            '&:hover': {
              backgroundColor: 'rgba(27, 94, 32, 0.12)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: '60%',
              backgroundColor: '#1B5E20',
              borderRadius: '0 2px 2px 0',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(27, 94, 32, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: 'rgba(27, 94, 32, 0.23)',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#2E7D32',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1B5E20',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#2E7D32',
            '&.Mui-focused': {
              color: '#1B5E20',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#1B5E20',
            color: '#ffffff',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: '#2E7D32',
            color: '#ffffff',
          },
        },
        outlined: {
          '&.MuiChip-colorPrimary': {
            borderColor: '#1B5E20',
            color: '#1B5E20',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(27, 94, 32, 0.04)',
            color: '#1B5E20',
            fontWeight: 600,
            borderBottom: '2px solid rgba(27, 94, 32, 0.12)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(27, 94, 32, 0.1)',
        },
        bar: {
          background: 'linear-gradient(90deg, #1B5E20 0%, #2E7D32 100%)',
          borderRadius: 4,
        },
      },
    },
  },
});

export default finCoreTheme;