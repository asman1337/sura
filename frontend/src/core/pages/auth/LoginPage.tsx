import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/auth';
import { 
  Box, 
  Paper, 
  Typography, 
  Link, 
  Container,
  useTheme
} from '@mui/material';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or use default
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  
  const handleLoginSuccess = () => {
    // Navigate to the page the user was trying to access before being redirected to login
    navigate(from, { replace: true });
  };
  
  const handleLoginError = (error: Error) => {
    console.error('Login error:', error);
    // Error handling is already managed in the LoginForm component
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        bgcolor: 'background.default',
        py: 6,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: '450px',
            mx: 'auto'
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="700" color="text.primary" gutterBottom>
            Welcome Back
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Login to your account
          </Typography>
          
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
            redirectPath={from}
          />
          
          <Box
            sx={{
              mt: 3,
              pt: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Link href="/forgot-password" underline="hover" color="primary.main">
              Forgot Password?
            </Link>
            
            <Typography sx={{ mx: 1 }} color="text.secondary">•</Typography>
            
            <Link href="/register" underline="hover" color="primary.main">
              Create Account
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 