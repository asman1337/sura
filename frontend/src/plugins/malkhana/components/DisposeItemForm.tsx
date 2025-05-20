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
  useTheme
} from '@mui/material';

import { malkhanaService } from '../services/MalkhanaService';
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
          
          // If item is already disposed, show error
          if (foundItem.status !== 'ACTIVE') {
            setError(`This item has already been ${foundItem.status.toLowerCase()}`);
          }
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
    
    try {
      // Dispose item
      await malkhanaService.disposeItem(id, {
        disposalDate: new Date().toISOString(),
        disposalReason: formData.disposalReason,
        disposalApprovedBy: formData.disposalApprovedBy
      });
      
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
    } catch (error) {
      console.error('Error disposing item:', error);
      setError('Failed to dispose item');
    } finally {
      setIsSubmitting(false);
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
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="500">
          Dispose Malkhana Item
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Mark this item as disposed in the {item.registryType === 'BLACK_INK' ? 'Black' : 'Red'} Ink Registry.
          {item.registryType === 'RED_INK' && ' This will renumber subsequent items in the Red Ink Registry.'}
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