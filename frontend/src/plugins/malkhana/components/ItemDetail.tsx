import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Typography,
  Alert,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem } from '../types';

const ItemDetail: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Item state
  const [item, setItem] = useState<MalkhanaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load item data
  useEffect(() => {
    const loadItem = async () => {
      if (!id) {
        setError('Item ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        // First check Black Ink
        const blackInk = await malkhanaService.getBlackInkRegistry();
        let foundItem = blackInk.items.find(item => item.id === id);
        
        // If not in Black Ink, check Red Ink
        if (!foundItem) {
          const redInk = await malkhanaService.getRedInkRegistry();
          foundItem = redInk.items.find(item => item.id === id);
        }
        
        if (foundItem) {
          setItem(foundItem);
        } else {
          setError('Item not found');
        }
      } catch (err) {
        setError('Failed to load item');
        console.error('Error loading item:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadItem();
  }, [id]);
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.palette.success.main;
      case 'DISPOSED':
        return theme.palette.error.main;
      case 'TRANSFERRED':
        return theme.palette.warning.main;
      case 'RELEASED':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading item details...</Typography>
      </Box>
    );
  }
  
  if (error || !item) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Item not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Malkhana Item Details
        </Typography>
        
        <Box>
          {item.status === 'ACTIVE' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              component={RouterLink}
              to={`/malkhana/dispose/${item.id}`}
              sx={{ mr: 2 }}
            >
              Dispose
            </Button>
          )}
          
          {item.status === 'ACTIVE' && item.registryType === 'BLACK_INK' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/malkhana/edit/${item.id}`}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
      
      <Card
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Registry Information
            </Typography>
            <Chip 
              label={item.status} 
              size="small"
              sx={{ 
                backgroundColor: `${getStatusColor(item.status)}20`,
                color: getStatusColor(item.status),
                fontWeight: 500
              }}
            />
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Type
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.registryType === 'BLACK_INK' ? 'Black Ink' : 'Red Ink'}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Number
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.registryNumber}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Year
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.registryYear}
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Item Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Case Number
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.caseNumber}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.category}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.description}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Received From
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.receivedFrom}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Date Received
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(item.dateReceived).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Condition
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.condition}
              </Typography>
            </Grid>
            
            {item.notes && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {item.notes}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          {item.status === 'DISPOSED' && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Disposal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Disposal Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {item.disposalDate ? new Date(item.disposalDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Disposal Reason
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {item.disposalReason || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Approved By
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {item.disposalApprovedBy || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Card>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        
        <Button
          variant="outlined"
          component={RouterLink}
          to={item.registryType === 'BLACK_INK' ? '/malkhana/black-ink' : '/malkhana/red-ink'}
        >
          View {item.registryType === 'BLACK_INK' ? 'Black' : 'Red'} Ink Registry
        </Button>
      </Box>
    </Box>
  );
};

export default ItemDetail; 