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
  InputAdornment,
  FormHelperText,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRecords } from '../../hooks/useRecords';
import { StolenPropertyRecord, CreateStolenProperty } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PageContainer } from '../common';
import { useData } from '../../../../core/data';

const StolenPropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading, error } = useRecords('stolen_property');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useData();
  
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
    photoUrls: [],
    isSold: false,
    soldPrice: 0,
    dateOfRemittance: '',
    disposalMethod: ''
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
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: date.toISOString().split('T')[0]
      }));
    }
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
      
      // Clean up the data before submission
      const cleanedData = { ...formData };
      
      // Remove recovery date if status is not 'recovered' or it's empty
      if (cleanedData.recoveryStatus !== 'recovered' || !cleanedData.recoveryDate) {
        delete cleanedData.recoveryDate;
      }
      
      // Handle disposal-related fields
      if (!cleanedData.isSold) {
        delete cleanedData.soldPrice;
        delete cleanedData.dateOfRemittance;
        delete cleanedData.disposalMethod;
      } else {
        // If it's sold but some fields are empty, provide default values
        if (cleanedData.soldPrice === 0) {
          cleanedData.soldPrice = 0;
        }
        
        // Remove empty string fields for dates
        if (!cleanedData.dateOfRemittance) {
          delete cleanedData.dateOfRemittance;
        }
        
        if (!cleanedData.disposalMethod) {
          delete cleanedData.disposalMethod;
        }
      }
      
      // Remove other empty string fields
      if (!cleanedData.ownerName) delete cleanedData.ownerName;
      if (!cleanedData.ownerContact) delete cleanedData.ownerContact;
      if (!cleanedData.linkedCaseNumber) delete cleanedData.linkedCaseNumber;
      if (!cleanedData.receivedBy) delete cleanedData.receivedBy;
      if (!cleanedData.remarks) delete cleanedData.remarks;
      if (!cleanedData.notes) delete cleanedData.notes;
      
      // Remove empty arrays
      if (cleanedData.photoUrls && cleanedData.photoUrls.length === 0) {
        delete cleanedData.photoUrls;
      }

      const unitId = auth.getCurrentUser()?.primaryUnit?.id;
      if (unitId) {
        cleanedData.unitId = unitId;
      }
      
      // Submit form data
      if (id) {
        // Update existing record
        await updateRecord(id, cleanedData);
        setFormSuccess('Stolen property record updated successfully');
        if (id) {
          setTimeout(() => navigate(`/records/stolen-property/${id}`), 1000);
        } else {
          setTimeout(() => navigate(`/records/stolen-property`), 1000);
        }
      } else {
        // Create new record
        const result = await createRecord(cleanedData);
        setFormSuccess('Stolen property record created successfully');
        if (result && result?.id) {
          setTimeout(() => navigate(`/records/stolen-property/${result.id}`), 1000);
        } else {
          setTimeout(() => navigate(`/records/type/stolen-property`), 1000);
        }
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
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                helperText="Unique identifier for this property"
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
                <FormHelperText>Source of the property as per PBR Form 17</FormHelperText>
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
                helperText="Type/category of the property (e.g., Jewelry, Electronics)"
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
                helperText="Approximate market value of the property"
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
                helperText="Detailed description of the property including make, model, serial number, etc."
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
                helperText="Name of person who found/reported the property"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Date of Theft/Finding"
                value={formData.dateOfTheft ? new Date(formData.dateOfTheft) : null}
                onChange={(date) => handleDateChange('dateOfTheft', date)}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    disabled: isSubmitting,
                    helperText: "Date when property was stolen or found"
                  }
                }}
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
                helperText="Location where property was stolen/found"
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
                helperText="Related FIR/UD Case number if applicable"
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
                helperText="Name of the property owner if known"
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
                helperText="Contact number of the property owner"
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
              <DatePicker
                label="Date of Receipt"
                value={formData.dateOfReceipt ? new Date(formData.dateOfReceipt) : null}
                onChange={(date) => handleDateChange('dateOfReceipt', date)}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    disabled: isSubmitting,
                    helperText: "Date when property was received at police station"
                  }
                }}
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
                helperText="Officer who received the property"
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
                  value={formData.recoveryStatus || 'reported'}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Recovery Status"
                >
                  <MenuItem value="reported">Reported</MenuItem>
                  <MenuItem value="investigation">Under Investigation</MenuItem>
                  <MenuItem value="recovered">Recovered</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
                <FormHelperText>Current status of property recovery</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Recovery Date"
                value={formData.recoveryDate ? new Date(formData.recoveryDate) : null}
                onChange={(date) => handleDateChange('recoveryDate', date)}
                disabled={formData.recoveryStatus !== 'recovered'}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: isSubmitting || formData.recoveryStatus !== 'recovered',
                    helperText: "Date when property was recovered (if applicable)"
                  }
                }}
              />
            </Grid>
            
            {/* Disposal Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Disposal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isSold || false}
                    onChange={handleCheckboxChange}
                    name="isSold"
                    disabled={isSubmitting}
                  />
                }
                label="Property Sold/Disposed"
              />
              <FormHelperText>Mark if property has been sold or disposed</FormHelperText>
            </Grid>
            
            {formData.isSold && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Sold Price"
                    name="soldPrice"
                    type="number"
                    value={formData.soldPrice || 0}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Amount received from sale"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Date of Remittance"
                    value={formData.dateOfRemittance ? new Date(formData.dateOfRemittance) : null}
                    onChange={(date) => handleDateChange('dateOfRemittance', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        disabled: isSubmitting,
                        helperText: "Date when sale amount was remitted"
                      }
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Disposal Method"
                    name="disposalMethod"
                    value={formData.disposalMethod || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    helperText="Method used for disposal (e.g., Auction, Court Order)"
                  />
                </Grid>
              </>
            )}
            
            {/* Additional Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={2}
                helperText="Official remarks about this property record"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={2}
                helperText="Additional notes or comments"
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
      </LocalizationProvider>
    </PageContainer>
  );
};

export default StolenPropertyForm; 