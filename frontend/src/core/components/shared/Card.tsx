import React from 'react';
import { 
  Card as MuiCard, 
  CardContent,
  CardHeader,
  CardMedia,
  CardActions,
  Typography,
  Box,
  CardProps as MuiCardProps
} from '@mui/material';

// Define our custom props separate from MUI's props
export interface CustomCardProps {
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  image?: string;
  imageHeight?: number | string;
  imageAlt?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
  headerAction?: React.ReactNode;
}

// Combine both types with proper type safety
export type CardProps = Omit<MuiCardProps, 'title'> & CustomCardProps;

/**
 * Standard card component with consistent styling
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subheader,
  image,
  imageHeight = 200,
  imageAlt = '',
  actions,
  noPadding = false,
  raised = false,
  variant = 'elevation',
  headerAction,
  ...muiCardProps
}) => {
  const hasHeader = title || subheader;
  
  return (
    <MuiCard raised={raised} variant={variant} {...muiCardProps}>
      {hasHeader && (
        <CardHeader
          title={title}
          subheader={subheader}
          action={headerAction}
        />
      )}
      
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt}
        />
      )}
      
      <CardContent sx={{ padding: noPadding ? 0 : undefined }}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

/**
 * Statistic card component for displaying a value with a label
 */
export const StatCard: React.FC<{
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: number; 
    isPositive?: boolean;
  };
}> = ({
  value,
  label,
  icon,
  color,
  trend
}) => {
  return (
    <Card>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <Box>
          <Typography variant="h4" component="div" sx={{ 
            fontWeight: 700,
            color: color || 'text.primary' 
          }}>
            {value}
          </Typography>
          
          {trend && (
            <Typography 
              variant="body2" 
              color={trend.isPositive ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Typography>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {label}
          </Typography>
        </Box>
        
        {icon && (
          <Box sx={{ 
            color: color || 'primary.main',
            opacity: 0.8,
            fontSize: '2rem'
          }}>
            {icon}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default Card; 