import React from 'react';
import { Box } from '@mui/material';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * A container component that provides consistent spacing and padding
 * for all Malkhana pages to ensure proper layout
 */
const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Box 
      sx={{ 
        mt: { xs: 4, sm: 3 },  // Top margin to prevent content from hiding behind browser UI
        width: '100%'
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer; 