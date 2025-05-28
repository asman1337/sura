import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Alert,
  InputAdornment
} from '@mui/material';
import { useData } from '../../data';
import { TextField, Button } from '../shared';
import { Loader } from '../shared/Loader';

// Simple icon components for the password visibility toggle
const VisibilityIcon = () => <span>👁️</span>;
const VisibilityOffIcon = () => <span>🔒</span>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error) => void;
  redirectPath?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess, 
  onLoginError,
  redirectPath = '/dashboard'
}) => {
  const { auth } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const success = await auth.login(username, password);
      
      if (success) {
        // Clear form
        setUsername('');
        setPassword('');
        
        // Call success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Redirect if path provided and no explicit callback
        if (redirectPath && !onLoginSuccess) {
          window.location.href = redirectPath;
        }
      } else {
        setError('Invalid username or password');
        if (onLoginError) {
          onLoginError(new Error('Login failed'));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      
      if (onLoginError && err instanceof Error) {
        onLoginError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordEndAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handlePasswordVisibility}
        edge="end"
      >
        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
    </InputAdornment>
  );
  
  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      
      <TextField
        id="username"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
        required
        autoFocus
      />
      
      <TextField
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        required
        InputProps={{
          endAdornment: passwordEndAdornment
        }}
      />
      
      <Button
        type="submit"
        variant="contained"
        colorVariant="primary"
        size="large"
        fullWidth
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? <Loader size={20} /> : 'Login'}
      </Button>
    </Box>
  );
};

export default LoginForm; 