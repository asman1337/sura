import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  useTheme,
  CircularProgress
} from '@mui/material';

import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';
import { MalkhanaItem } from '../types';

// Disposal reasons
const disposalReasons = [
  'Case Closed',
  'Court Order',
  'Transferred to Another Department',
  'Released to Owner',
  'Destroyed',
  'Auctioned',
  'Other'
];

const DisposeItemForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  
  // Item state
  const [item, setItem] = useState<MalkhanaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    disposalReason: '',
    disposalApprovedBy: '',
    notes: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  // Load item data
  useEffect(() => {
    const loadItem = async () => {
      if (!id || !malkhanaApi.isReady) {
        return;
      }
      
      try {
        setLoading(true);
        const itemData = await malkhanaApi.getItemById(id);
        
        if (itemData) {
          setItem(itemData);
          
          // If item is already disposed, show error
          if (itemData.status !== 'ACTIVE') {
            setError(`This item has already been ${itemData.status.toLowerCase()}`);
          }
        } else {
          setError('Item not found');
        }
      } catch (err) {
        console.error('Error loading item:', err);
        setError('Failed to load item details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadItem();
  }, [id, malkhanaApi.isReady]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.disposalReason) {
      newErrors.disposalReason = 'Disposal reason is required';
    }
    
    if (!formData.disposalApprovedBy.trim()) {
      newErrors.disposalApprovedBy = 'Approver name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !item || !id) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!malkhanaApi.isReady) {
        throw new Error('API service is not initialized');
      }
      
      // Dispose item using real API
      const result = await malkhanaApi.disposeItem(id, {
        disposalDate: new Date(),
        disposalReason: formData.disposalReason,
        disposalApprovedBy: formData.disposalApprovedBy
      });
      
      if (result) {
        // Navigate back based on registry type
        const redirectPath = item.registryType === 'BLACK_INK' 
          ? '/malkhana/black-ink' 
          : '/malkhana/red-ink';
          
        navigate(redirectPath, { 
          state: { 
            success: true, 
            message: 'Item disposed successfully' 
          } 
        });
      } else {
        setError('Failed to dispose item. Please try again.');
      }
    } catch (err) {
      console.error('Error disposing item:', err);
      setError(`Error disposing item: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show initialization progress
  if (!api) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing API services...
        </Typography>
      </Box>
    );
  }
  
  // Show loading state while Malkhana API initializes
  if (!malkhanaApi.isReady) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing Malkhana module...
        </Typography>
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading item details...
        </Typography>
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
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          sx={{ mr: 2 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight="500">
          Dispose Malkhana Item
        </Typography>
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
          <Typography variant="h6" gutterBottom>
            Item Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Number
              </Typography>
              <Typography variant="body1">
                {item.registryNumber}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Case Number
              </Typography>
              <Typography variant="body1">
                {item.caseNumber}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {item.description}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1">
                {item.category}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Received From
              </Typography>
              <Typography variant="body1">
                {item.receivedFrom}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Date Received
              </Typography>
              <Typography variant="body1">
                {new Date(item.dateReceived).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Condition
              </Typography>
              <Typography variant="body1">
                {item.condition}
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom>
            Disposal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.disposalReason} required>
                  <InputLabel>Disposal Reason</InputLabel>
                  <Select
                    name="disposalReason"
                    value={formData.disposalReason}
                    onChange={handleSelectChange}
                    label="Disposal Reason"
                  >
                    {disposalReasons.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {reason}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.disposalReason && <FormHelperText>{errors.disposalReason}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Approved By"
                  name="disposalApprovedBy"
                  value={formData.disposalApprovedBy}
                  onChange={handleChange}
                  error={!!errors.disposalApprovedBy}
                  helperText={errors.disposalApprovedBy}
                  required
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="error"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Dispose Item'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Card>
      
      {item.registryType === 'RED_INK' && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(211, 47, 47, 0.1)', borderRadius: 2, border: '1px solid rgba(211, 47, 47, 0.3)' }}>
          <Typography variant="h6" color="error.main" gutterBottom>
            Important Note
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When an item is disposed from the Red Ink Registry, all subsequent items will be automatically renumbered.
            For example, if item #50 is disposed, item #51 will become #50, item #52 will become #51, and so on.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DisposeItemForm; 