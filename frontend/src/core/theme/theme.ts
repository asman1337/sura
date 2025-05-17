import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define brand colors
const colors = {
  primary: {
    main: '#2563eb', // Modern blue
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f59e0b', // Amber
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f97316',
    light: '#fb923c',
    dark: '#ea580c',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
    contrastText: '#ffffff',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  divider: '#e2e8f0',
};

// Define typography
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    '"Open Sans"',
    '"Helvetica Neue"',
    'sans-serif',
  ].join(','),
  h1: {
    fontWeight: 800,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.1rem',
    lineHeight: 1.5,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1.1rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none' as const, // Fix for TypeScript error
  },
};

// Define component overrides
const components: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '0.625rem 1.25rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
      },
      contained: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-1px)',
        },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': {
          borderWidth: 1.5,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiInputBase-root': {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          '&.Mui-focused': {
            boxShadow: '0px 0px 0px 2px rgba(37, 99, 235, 0.2)', // Primary color with opacity
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#e2e8f0',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        backgroundColor: '#f8fafc',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: '#e2e8f0',
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: '#f1f5f9',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};

// Create default shadows array with 25 elements
const defaultShadows = Array(25).fill('none') as unknown as [
  'none',
  string, string, string, string, string,
  string, string, string, string, string,
  string, string, string, string, string,
  string, string, string, string, string,
  string, string, string, string
];

// Set the custom shadow values - more modern and subtle shadows
defaultShadows[0] = 'none';
defaultShadows[1] = '0px 1px 2px rgba(0, 0, 0, 0.05)';
defaultShadows[2] = '0px 2px 4px rgba(0, 0, 0, 0.05)';
defaultShadows[3] = '0px 4px 6px rgba(0, 0, 0, 0.07)';
defaultShadows[4] = '0px 6px 8px rgba(0, 0, 0, 0.08)';
defaultShadows[8] = '0px 8px 16px rgba(0, 0, 0, 0.08)';
defaultShadows[12] = '0px 12px 24px rgba(0, 0, 0, 0.12)';
defaultShadows[16] = '0px 16px 32px rgba(0, 0, 0, 0.10)';
defaultShadows[24] = '0px 24px 48px rgba(0, 0, 0, 0.12)';

// Create the theme
const themeOptions: ThemeOptions = {
  palette: colors,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  shadows: defaultShadows,
};

// Create and export the theme
export const theme = createTheme(themeOptions);

// For TypeScript type checking
declare module '@mui/material/styles' {
  interface Theme {
    // You can extend the theme here if needed
  }
  
  interface ThemeOptions {
    // You can extend theme options here if needed
  }
} 