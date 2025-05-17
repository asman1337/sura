import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export type ButtonColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  colorVariant?: ButtonColorVariant;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * Standard button component that follows the design system
 */
export const Button: React.FC<ButtonProps> = ({
  colorVariant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  startIcon,
  endIcon,
  variant = 'contained', // Default to contained
  ...props
}) => {
  // Map our color variants to MUI color props
  const getColorFromVariant = (): MuiButtonProps['color'] => {
    switch (colorVariant) {
      case 'primary': return 'primary';
      case 'secondary': return 'secondary';
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'default': return 'inherit';
      default: return 'primary';
    }
  };

  return (
    <MuiButton
      color={getColorFromVariant()}
      size={size}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      variant={variant}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

/**
 * Text button variant
 */
export const TextButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} variant="text" />;
};

/**
 * Outlined button variant
 */
export const OutlinedButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} variant="outlined" />;
};

export default Button; 