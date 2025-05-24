import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

/**
 * Container component for pages with consistent padding
 */
export const PageContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  );
};

/**
 * Card component for displaying statistics
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          {icon && (
            <Box sx={{ color: color || 'primary.main' }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 