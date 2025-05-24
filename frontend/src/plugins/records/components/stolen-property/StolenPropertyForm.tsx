import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import { useRecords } from '../../hooks/useRecords';
import { StolenPropertyRecord, CreateStolenProperty } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PageContainer } from '../common';

const StolenPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading, error } = useRecords('stolen_property');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState: CreateStolenProperty = {
    type: 'stolen_property',
    unitId: '',
    propertyId: '',
    propertySource: 'stolen',
    propertyType: '',
    description: '',
    estimatedValue: 0,
    foundBy: '',
    dateOfTheft: new Date().toISOString().split('T')[0],
    location: '',
    ownerName: '',
    ownerContact: '',
    linkedCaseNumber: '',
    dateOfReceipt: new Date().toISOString().split('T')[0],
    receivedBy: '',
    recoveryStatus: 'reported',
    recoveryDate: '',
    photoUrls: []
  };
  
  const [formData, setFormData] = useState<CreateStolenProperty>(initialFormState);
  
  // Load data if editing existing record
  useEffect(() => {
    const loadRecord = async () => {
      if (id) {
        try {
          const record = await getRecord(id);
          if (record && record.type === 'stolen_property') {
            const property = record as StolenPropertyRecord;
            setFormData({
              ...initialFormState,
              ...property,
              dateOfTheft: property.dateOfTheft ? formatDate(property.dateOfTheft) : '',
              dateOfReceipt: property.dateOfReceipt ? formatDate(property.dateOfReceipt) : '',
              recoveryDate: property.recoveryDate ? formatDate(property.recoveryDate) : '',
              dateOfRemittance: property.dateOfRemittance ? formatDate(property.dateOfRemittance) : ''
            });
          }
        } catch (err) {
          console.error('Error loading stolen property:', err);
          setFormError('Failed to load stolen property data');
        }
      }
    };
    
    loadRecord();
  }, [id, getRecord]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'estimatedValue' || name === 'soldPrice') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.propertyId) {
        throw new Error('Property ID is required');
      }
      if (!formData.propertyType) {
        throw new Error('Property type is required');
      }
      if (!formData.description) {
        throw new Error('Description is required');
      }
      if (!formData.foundBy) {
        throw new Error('Found by is required');
      }
      if (!formData.dateOfTheft) {
        throw new Error('Date of theft/finding is required');
      }
      if (!formData.location) {
        throw new Error('Location is required');
      }
      if (!formData.dateOfReceipt) {
        throw new Error('Date of receipt is required');
      }
      
      // Submit form data
      if (id) {
        // Update existing record
        await updateRecord(id, formData);
        setFormSuccess('Stolen property record updated successfully');
        setTimeout(() => navigate(`/records/stolen-property/${id}`), 1500);
      } else {
        // Create new record
        const result = await createRecord(formData);
        setFormSuccess('Stolen property record created successfully');
        setTimeout(() => navigate(`/records/stolen-property/${result.id}`), 1500);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save stolen property record');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading && !formData.propertyId) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Box mb={3}>
        <Typography variant="h4">
          {id ? 'Edit Stolen Property Record' : 'Create New Stolen Property Record'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {id ? `Editing property ${formData.propertyId}` : 'Enter details for the new stolen property record'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}
      
      {formSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {formSuccess}
        </Alert>
      )}
      
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Property Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Property Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              label="Property ID"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Property Source</InputLabel>
              <Select
                name="propertySource"
                value={formData.propertySource}
                onChange={handleSelectChange}
                disabled={isSubmitting}
                label="Property Source"
              >
                <MenuItem value="stolen">Stolen</MenuItem>
                <MenuItem value="intestate">Intestate</MenuItem>
                <MenuItem value="unclaimed">Unclaimed</MenuItem>
                <MenuItem value="suspicious">Suspicious</MenuItem>
                <MenuItem value="exhibits">Exhibits</MenuItem>
                <MenuItem value="others">Others</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              label="Property Type"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              label="Estimated Value"
              name="estimatedValue"
              type="number"
              value={formData.estimatedValue}
              onChange={handleChange}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              multiline
              rows={3}
            />
          </Grid>
          
          {/* Incident Information */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Incident Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              label="Found By"
              name="foundBy"
              value={formData.foundBy}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              label="Date of Theft/Finding"
              name="dateOfTheft"
              type="date"
              value={formData.dateOfTheft}
              onChange={handleChange}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              required
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Linked Case Number"
              name="linkedCaseNumber"
              value={formData.linkedCaseNumber || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          {/* Owner Information */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Owner Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Owner Name"
              name="ownerName"
              value={formData.ownerName || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Owner Contact"
              name="ownerContact"
              value={formData.ownerContact || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          {/* Receipt Information */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Receipt Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              label="Date of Receipt"
              name="dateOfReceipt"
              type="date"
              value={formData.dateOfReceipt}
              onChange={handleChange}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Received By"
              name="receivedBy"
              value={formData.receivedBy || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          
          {/* Recovery Information */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recovery Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Recovery Status</InputLabel>
              <Select
                name="recoveryStatus"
                value={formData.recoveryStatus}
                onChange={handleSelectChange}
                disabled={isSubmitting}
                label="Recovery Status"
              >
                <MenuItem value="reported">Reported</MenuItem>
                <MenuItem value="investigation">Under Investigation</MenuItem>
                <MenuItem value="recovered">Recovered</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Recovery Date"
              name="recoveryDate"
              type="date"
              value={formData.recoveryDate || ''}
              onChange={handleChange}
              disabled={isSubmitting || formData.recoveryStatus !== 'recovered'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* Additional Information */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Remarks"
              name="remarks"
              value={formData.remarks || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              multiline
              rows={2}
            />
          </Grid>
          
          {/* Form Actions */}
          <Grid size={{ xs: 12 }} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Saving...' : id ? 'Update Property Record' : 'Create Property Record'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </PageContainer>
  );
};

export default StolenPropertyForm; 