import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: string | number;
  padding?: string | number;
}

/**
 * Container for pages with consistent padding and max width
 */
export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  maxWidth = '1280px', 
  padding = '24px' 
}) => {
  return (
    <Box 
      sx={{ 
        maxWidth,
        mx: 'auto', 
        p: padding,
        width: '100%' 
      }}
    >
      {children}
    </Box>
  );
}; 