import React, { ReactNode } from 'react';
import { Box, Container, Paper, useTheme } from '@mui/material';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disablePadding?: boolean;
  disablePaper?: boolean;
  sx?: Record<string, any>;
}

/**
 * Consistent container for all duty roster pages
 * Provides standardized layout and styling
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = false,
  disablePadding = false,
  disablePaper = true,
  sx = {}
}) => {
  const theme = useTheme();
  
  const content = (
    <Box
      sx={{
        p: disablePadding ? 0 : 3,
        ...sx
      }}
    >
      {children}
    </Box>
  );
  
  return (
    <Container 
      maxWidth={maxWidth} 
      disableGutters
      sx={{ py: 2 }}
    >
      {disablePaper ? content : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            height: '100%'
          }}
        >
          {content}
        </Paper>
      )}
    </Container>
  );
};

export default PageContainer; 