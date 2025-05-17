import React from 'react';
import { 
  TextField as MuiTextField, 
  TextFieldProps as MuiTextFieldProps, 
  InputAdornment 
} from '@mui/material';

// Define our custom props
export interface CustomTextFieldProps {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// Combine MUI's props with our custom props
export type TextFieldProps = MuiTextFieldProps & CustomTextFieldProps;

/**
 * Standardized text field component with optional icons
 */
export const TextField: React.FC<TextFieldProps> = ({
  startIcon,
  endIcon,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  InputProps,
  ...props
}) => {
  // Merge our icon props with any existing InputProps
  const mergedInputProps = {
    ...InputProps,
    startAdornment: startIcon ? (
      <InputAdornment position="start">{startIcon}</InputAdornment>
    ) : InputProps?.startAdornment,
    endAdornment: endIcon ? (
      <InputAdornment position="end">{endIcon}</InputAdornment>
    ) : InputProps?.endAdornment,
  };

  return (
    <MuiTextField
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      InputProps={mergedInputProps}
      {...props}
    />
  );
};

/**
 * Password field with standard configuration
 */
export const PasswordField: React.FC<TextFieldProps> = (props) => {
  return (
    <TextField
      type="password"
      autoComplete="current-password"
      {...props}
    />
  );
};

export default TextField; 