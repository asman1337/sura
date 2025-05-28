import React from 'react';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { theme } from './theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon */}
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}; 