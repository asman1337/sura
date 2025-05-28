import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

import { useData } from '../../../core/data';
import { useMalkhanaApi } from '../hooks';
import { setGlobalApiInstance } from '../services';
import { ShelfInfo, PropertyNature } from '../types';

// Item categories
const itemCategories = [
  'Weapon',
  'Drug/Narcotic',
  'Currency',
  'Document',
  'Electronic Device',
  'Clothing',
  'Vehicle',
  'Jewelry',
  'Other'
];

// Property nature options
const propertyNatureOptions = [
  { value: 'STOLEN_PROPERTY', label: 'Stolen Property' },
  { value: 'INTESTATE_PROPERTY', label: 'Intestate Property' },
  { value: 'UNCLAIMED_PROPERTY', label: 'Unclaimed Property' },
  { value: 'SUSPICIOUS_PROPERTY', label: 'Suspicious Property' },
  { value: 'EXHIBITS_AND_OTHER_PROPERTY', label: 'Exhibits and Other Property' },
  { value: 'SAFE_CUSTODY_PROPERTY', label: 'Safe Custody Property' },
  { value: 'OTHERS', label: 'Others' }
];

// Item conditions
const itemConditions = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Damaged',
  'Unknown'
];

const AddItemForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  
  // Form state
  const [formData, setFormData] = useState({
    caseNumber: '',
    prNumber: '',
    gdeNumber: '',
    description: '',
    category: '',
    propertyNature: '' as PropertyNature | '',
    receivedFrom: '',
    receivedFromAddress: '',
    dateReceived: new Date(),
    investigatingOfficerName: '',
    investigatingOfficerRank: '',
    investigatingOfficerPhone: '',
    investigatingOfficerUnit: '',
    condition: '',
    notes: '',
    shelfId: ''
  });
  
  // Available shelves
  const [shelves, setShelves] = useState<ShelfInfo[]>([]);
  const [loadingShelves, setLoadingShelves] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  // Load available shelves
  useEffect(() => {
    const loadShelves = async () => {
      if (!malkhanaApi.isReady) return;
      
      try {
        setLoadingShelves(true);
        const availableShelves = await malkhanaApi.getAllShelves();
        setShelves(availableShelves);
      } catch (err) {
        console.error('Error loading shelves:', err);
        setError('Failed to load available shelves. You can still create the item without assigning a shelf.');
      } finally {
        setLoadingShelves(false);
      }
    };
    
    loadShelves();
  }, [malkhanaApi.isReady]);
  
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
  
  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, dateReceived: date }));
      
      // Clear error when field is edited
      if (errors.dateReceived) {
        setErrors(prev => ({ ...prev, dateReceived: '' }));
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.caseNumber.trim()) {
      newErrors.caseNumber = 'Case number is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.receivedFrom.trim()) {
      newErrors.receivedFrom = 'Received from is required';
    }
    
    if (!formData.dateReceived) {
      newErrors.dateReceived = 'Date received is required';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if malkhanaApi is ready
      if (!malkhanaApi.isReady) {
        throw new Error('API service is not initialized');
      }
      
      // Add item using the real API
      const result = await malkhanaApi.createItem({
        caseNumber: formData.caseNumber,
        prNumber: formData.prNumber,
        gdeNumber: formData.gdeNumber,
        description: formData.description,
        category: formData.category,
        propertyNature: formData.propertyNature || undefined,
        receivedFrom: formData.receivedFrom,
        receivedFromAddress: formData.receivedFromAddress,
        dateReceived: formData.dateReceived,
        investigatingOfficerName: formData.investigatingOfficerName,
        investigatingOfficerRank: formData.investigatingOfficerRank,
        investigatingOfficerPhone: formData.investigatingOfficerPhone,
        investigatingOfficerUnit: formData.investigatingOfficerUnit,
        condition: formData.condition,
        notes: formData.notes,
        shelfId: formData.shelfId || undefined
      });
      
      if (result) {
        // Navigate to Black Ink registry
        navigate('/malkhana/black-ink', { state: { success: true, message: 'Item added successfully' } });
      } else {
        setError('Failed to add item. Please try again.');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError(`Error adding item: ${(err as Error).message}`);
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
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="500">
          Add New Malkhana Item
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add a new item to the Black Ink Registry for the current year.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
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
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Case Number"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  error={!!errors.caseNumber}
                  helperText={errors.caseNumber}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="PR Number"
                  name="prNumber"
                  value={formData.prNumber}
                  onChange={handleChange}
                  helperText="Police Report Number (optional)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="GDE Number"
                  name="gdeNumber"
                  value={formData.gdeNumber}
                  onChange={handleChange}
                  helperText="General Diary Entry Number (optional)"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <DateTimePicker
                  label="Date & Time Received *"
                  value={formData.dateReceived}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dateReceived,
                      helperText: errors.dateReceived,
                      required: true
                    }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleSelectChange}
                    label="Category"
                  >
                    {itemCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Nature of Property</InputLabel>
                  <Select
                    name="propertyNature"
                    value={formData.propertyNature}
                    onChange={handleSelectChange}
                    label="Nature of Property"
                  >
                    <MenuItem value="">
                      <em>Select Property Nature</em>
                    </MenuItem>
                    {propertyNatureOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.condition} required>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleSelectChange}
                    label="Condition"
                  >
                    {itemConditions.map((condition) => (
                      <MenuItem key={condition} value={condition}>
                        {condition}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.condition && <FormHelperText>{errors.condition}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Received From (Name) *"
                  name="receivedFrom"
                  value={formData.receivedFrom}
                  onChange={handleChange}
                  error={!!errors.receivedFrom}
                  helperText={errors.receivedFrom}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address of Person from whom Seized"
                  name="receivedFromAddress"
                  value={formData.receivedFromAddress}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  helperText="Complete address (optional)"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'primary.main' }}>
                  Investigating Officer Details
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="IO Name"
                  name="investigatingOfficerName"
                  value={formData.investigatingOfficerName}
                  onChange={handleChange}
                  helperText="Investigating Officer Name (optional)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="IO Rank"
                  name="investigatingOfficerRank"
                  value={formData.investigatingOfficerRank}
                  onChange={handleChange}
                  helperText="Investigating Officer Rank (optional)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="IO Phone Number"
                  name="investigatingOfficerPhone"
                  value={formData.investigatingOfficerPhone}
                  onChange={handleChange}
                  helperText="Investigating Officer Phone (optional)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="IO Unit"
                  name="investigatingOfficerUnit"
                  value={formData.investigatingOfficerUnit}
                  onChange={handleChange}
                  helperText="Investigating Officer Unit (optional)"
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Assign to Shelf (Optional)</InputLabel>
                  <Select
                    name="shelfId"
                    value={formData.shelfId}
                    onChange={handleSelectChange}
                    label="Assign to Shelf (Optional)"
                    disabled={loadingShelves || shelves.length === 0}
                  >
                    <MenuItem value="">
                      <em>None (Assign Later)</em>
                    </MenuItem>
                    {shelves.map((shelf) => (
                      <MenuItem key={shelf.id} value={shelf.id}>
                        {shelf.name} - {shelf.location} {shelf.category ? `(${shelf.category})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {loadingShelves ? 'Loading shelves...' : 
                     shelves.length === 0 ? 'No shelves available. Create shelves in Shelf Management.' : 
                     'Select a shelf to store this item or leave empty to assign later.'}
                  </FormHelperText>
                </FormControl>
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
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    sx={{ mr: 2 }}
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Item'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Card>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.3)' }}>
        <Typography variant="h6" color="primary.main" gutterBottom>
          About Black Ink Registry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          New items are always added to the Black Ink Registry for the current year.
          When a new year begins, all active items will be automatically transferred to the Red Ink Registry.
        </Typography>
      </Box>
    </Box>
  );
};

export default AddItemForm; 