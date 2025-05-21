import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
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
import { DatePicker } from '@mui/x-date-pickers';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

import { MalkhanaItem, UpdateMalkhanaItemDto } from '../types';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

// Item categories
const ITEM_CATEGORIES = [
  'Weapon',
  'Narcotic',
  'Currency',
  'Vehicle',
  'Document',
  'Electronic',
  'Clothing',
  'Other'
];

// Item conditions
const ITEM_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Damaged'
];

const EditItemForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  
  // Form state
  const [formData, setFormData] = useState<Partial<MalkhanaItem>>({
    caseNumber: '',
    description: '',
    category: '',
    receivedFrom: '',
    dateReceived: new Date().toISOString(),
    condition: '',
    notes: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  
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
        const item = await malkhanaApi.getItemById(id);
        
        if (item && item.status === 'ACTIVE') {
          setFormData(item);
          setError(null);
        } else if (item && item.status !== 'ACTIVE') {
          setError('Only active items can be edited');
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
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, dateReceived: date.toISOString() }));
      
      // Clear validation error when field is changed
      if (validationErrors.dateReceived) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateReceived;
          return newErrors;
        });
      }
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.caseNumber?.trim()) {
      errors.caseNumber = 'Case number is required';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!formData.receivedFrom?.trim()) {
      errors.receivedFrom = 'Received from is required';
    }
    
    if (!formData.dateReceived) {
      errors.dateReceived = 'Date received is required';
    }
    
    if (!formData.condition?.trim()) {
      errors.condition = 'Condition is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      if (!id) {
        throw new Error('Item ID is missing');
      }
      
      if (!malkhanaApi.isReady) {
        throw new Error('API service is not initialized');
      }
      
      // Update the item
      const updateData: UpdateMalkhanaItemDto = {
        caseNumber: formData.caseNumber,
        description: formData.description,
        category: formData.category,
        receivedFrom: formData.receivedFrom,
        condition: formData.condition,
        notes: formData.notes,
      };
      
      // Convert string date to Date object if it exists
      if (formData.dateReceived) {
        updateData.dateReceived = new Date(formData.dateReceived);
      }
      
      const result = await malkhanaApi.updateItem(id, updateData);
      
      if (result) {
        setSuccess(true);
        // After short delay, redirect back to item detail
        setTimeout(() => {
          navigate(`/malkhana/item/${id}`);
        }, 1500);
      } else {
        setError('Failed to update item. Please try again.');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError(`Error updating item: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
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
  
  // Show loading spinner while loading item
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
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight="500">
          Edit Item
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Item updated successfully! Redirecting...
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card
          elevation={0}
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            mb: 3
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Item Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Case Number"
                  name="caseNumber"
                  value={formData.caseNumber || ''}
                  onChange={handleInputChange}
                  error={!!validationErrors.caseNumber}
                  helperText={validationErrors.caseNumber}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!validationErrors.category}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleSelectChange}
                    disabled={submitting}
                    required
                  >
                    {ITEM_CATEGORIES.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.category && (
                    <FormHelperText>{validationErrors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  multiline
                  rows={3}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Received From"
                  name="receivedFrom"
                  value={formData.receivedFrom || ''}
                  onChange={handleInputChange}
                  error={!!validationErrors.receivedFrom}
                  helperText={validationErrors.receivedFrom}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Date Received"
                  value={formData.dateReceived ? new Date(formData.dateReceived) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!validationErrors.dateReceived,
                      helperText: validationErrors.dateReceived,
                      disabled: submitting,
                      required: true
                    }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!validationErrors.condition}>
                  <InputLabel id="condition-label">Condition</InputLabel>
                  <Select
                    labelId="condition-label"
                    name="condition"
                    value={formData.condition || ''}
                    onChange={handleSelectChange}
                    disabled={submitting}
                    required
                  >
                    {ITEM_CONDITIONS.map(condition => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.condition && (
                    <FormHelperText>{validationErrors.condition}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Item'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditItemForm; 