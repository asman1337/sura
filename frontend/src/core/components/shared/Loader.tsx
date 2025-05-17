import React from 'react';
import { CircularProgress, Box, Typography, CircularProgressProps, BoxProps } from '@mui/material';

export interface LoaderProps {
  size?: number | string;
  thickness?: number;
  text?: string;
  color?: CircularProgressProps['color'];
  containerProps?: BoxProps;
}

/**
 * Standardized loader component
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 40,
  thickness = 3.6,
  text,
  color = 'primary',
  containerProps
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      {...containerProps}
    >
      <CircularProgress
        size={size}
        thickness={thickness}
        color={color}
      />
      {text && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            {text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/**
 * Full page loader variant
 */
export const PageLoader: React.FC<Omit<LoaderProps, 'containerProps'>> = (props) => {
  return (
    <Loader
      {...props}
      containerProps={{
        minHeight: '80vh',
        width: '100%',
      }}
      text={props.text || 'Loading...'}
    />
  );
};

/**
 * Small inline loader variant
 */
export const InlineLoader: React.FC<Omit<LoaderProps, 'size' | 'thickness'>> = (props) => {
  return (
    <Loader
      size={24}
      thickness={2.5}
      {...props}
    />
  );
};

export default Loader; 