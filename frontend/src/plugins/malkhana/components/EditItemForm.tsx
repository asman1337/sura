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
import { DateTimePicker } from '@mui/x-date-pickers';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

import { MalkhanaItem, UpdateMalkhanaItemDto, ShelfInfo } from '../types';
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

// Property nature options
const PROPERTY_NATURE_OPTIONS = [
  { value: 'STOLEN_PROPERTY', label: 'Stolen Property' },
  { value: 'INTESTATE_PROPERTY', label: 'Intestate Property' },
  { value: 'UNCLAIMED_PROPERTY', label: 'Unclaimed Property' },
  { value: 'SUSPICIOUS_PROPERTY', label: 'Suspicious Property' },
  { value: 'EXHIBITS_AND_OTHER_PROPERTY', label: 'Exhibits and Other Property' },
  { value: 'SAFE_CUSTODY_PROPERTY', label: 'Safe Custody Property' },
  { value: 'OTHERS', label: 'Others' }
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
    notes: '',    shelfId: '',
    gdeNumber: '',
    propertyNature: undefined,
    receivedFromAddress: '',
    investigatingOfficerName: '',
    investigatingOfficerRank: '',
    investigatingOfficerPhone: '',
    investigatingOfficerUnit: ''
  });
  
  // Available shelves
  const [shelves, setShelves] = useState<ShelfInfo[]>([]);
  const [loadingShelves, setLoadingShelves] = useState(false);
  
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
  
  // Load shelves
  useEffect(() => {
    const loadShelves = async () => {
      if (!malkhanaApi.isReady) return;
      
      try {
        setLoadingShelves(true);
        const availableShelves = await malkhanaApi.getAllShelves();
        setShelves(availableShelves);
      } catch (err) {
        console.error('Error loading shelves:', err);
        // Non-critical error - just log it
      } finally {
        setLoadingShelves(false);
      }
    };
    
    loadShelves();
  }, [malkhanaApi.isReady]);
  
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
        notes: formData.notes,        shelfId: formData.shelfId === '' ? undefined : formData.shelfId,
        gdeNumber: formData.gdeNumber || undefined,
        propertyNature: formData.propertyNature,
        receivedFromAddress: formData.receivedFromAddress || undefined,
        investigatingOfficerName: formData.investigatingOfficerName || undefined,
        investigatingOfficerRank: formData.investigatingOfficerRank || undefined,
        investigatingOfficerPhone: formData.investigatingOfficerPhone || undefined,
        investigatingOfficerUnit: formData.investigatingOfficerUnit || undefined
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
              Case Information
            </Typography>
            
            <Grid container spacing={3}>              <Grid size={{ xs: 12, md: 6 }}>
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
                <TextField
                  fullWidth
                  label="GDE Number"
                  name="gdeNumber"
                  value={formData.gdeNumber || ''}
                  onChange={handleInputChange}
                  disabled={submitting}
                  helperText="General Diary Entry Number"
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

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
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="property-nature-label">Property Nature</InputLabel>
                  <Select
                    labelId="property-nature-label"
                    name="propertyNature"
                    value={formData.propertyNature || ''}
                    onChange={handleSelectChange}
                    disabled={submitting}
                    label="Property Nature"
                  >
                    <MenuItem value="">
                      <em>Select property nature</em>
                    </MenuItem>
                    {PROPERTY_NATURE_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Classification of the property being stored</FormHelperText>
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
              
              <Grid size={{ xs: 12, md: 6 }}>
                <DateTimePicker
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
            </Grid>
          </Box>
        </Card>

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
              Received From Information
            </Typography>
            
            <Grid container spacing={3}>
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
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Received From Address"
                  name="receivedFromAddress"
                  value={formData.receivedFromAddress || ''}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  disabled={submitting}
                  helperText="Complete address from where the item was received"
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

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
              Investigating Officer Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Officer Name"
                  name="investigatingOfficerName"
                  value={formData.investigatingOfficerName || ''}
                  onChange={handleInputChange}
                  disabled={submitting}
                  helperText="Name of the investigating officer"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Officer Rank"
                  name="investigatingOfficerRank"
                  value={formData.investigatingOfficerRank || ''}
                  onChange={handleInputChange}
                  disabled={submitting}
                  helperText="Rank of the investigating officer"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Officer Phone"
                  name="investigatingOfficerPhone"
                  value={formData.investigatingOfficerPhone || ''}
                  onChange={handleInputChange}
                  disabled={submitting}
                  helperText="Contact number of the investigating officer"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Officer Unit"
                  name="investigatingOfficerUnit"
                  value={formData.investigatingOfficerUnit || ''}
                  onChange={handleInputChange}
                  disabled={submitting}
                  helperText="Unit/department of the investigating officer"
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

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
              Storage & Additional Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="shelf-label">Assign to Shelf</InputLabel>
                  <Select
                    labelId="shelf-label"
                    name="shelfId"
                    value={formData.shelfId || ''}
                    onChange={handleSelectChange}
                    disabled={submitting || loadingShelves}
                    label="Assign to Shelf"
                  >
                    <MenuItem value="">
                      <em>None (No shelf assigned)</em>
                    </MenuItem>
                    {shelves.map(shelf => (
                      <MenuItem key={shelf.id} value={shelf.id}>
                        {shelf.name} - {shelf.location} {shelf.category ? `(${shelf.category})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {loadingShelves ? 'Loading shelves...' : 
                    'Select a shelf to store this item or leave empty for no shelf assignment'}
                  </FormHelperText>
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