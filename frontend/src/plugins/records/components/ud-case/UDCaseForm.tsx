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
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRecords } from '../../hooks/useRecords';
import { UDCaseRecord, CreateUDCase, Officer } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PageContainer } from '../common';
import { useData } from '../../../../core/data';

const UDCaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading, error } = useRecords('ud_case');
  const { api, auth } = useData();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  
  const initialFormState: CreateUDCase = {
    type: 'ud_case',
    unitId: '',
    caseNumber: '',
    dateOfOccurrence: new Date().toISOString().split('T')[0],
    deceasedName: '',
    deceasedAddress: '',
    identificationStatus: 'unidentified',
    informantName: '',
    informantAddress: '',
    informantContact: '',
    informantRelation: '',
    apparentCauseOfDeath: '',
    location: '',
    assignedOfficerId: '',
    postMortemDate: '',
    postMortemDoctor: '',
    postMortemHospital: '',
    photoUrls: [],
    investigationStatus: 'pending',
    description: ''
  };
  
  const [formData, setFormData] = useState<CreateUDCase>(initialFormState);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  
  // Load officers on component mount
  useEffect(() => {
    const fetchOfficers = async () => {
      if (!api) return;
      
      const currentUser = auth.getCurrentUser();
      if (!currentUser?.primaryUnit?.id) {
        return;
      }
      
      const unitId = currentUser.primaryUnit.id;
      setFormData(prev => ({ ...prev, unitId }));
      setLoadingOfficers(true);
      
      try {
        // Try with primaryUnitId parameter which might be the correct parameter name
        const response = await api.get(`/officers?unitId=${unitId}`) as Officer[] | { data: Officer[] };
        
        // Direct access to the response (it appears to be an array directly)
        if (response && Array.isArray(response)) {
          setOfficers(response);
        }
        // Check if response.data exists and is an array
        else if (response && 'data' in response && Array.isArray(response.data)) {
          setOfficers(response.data);
        } else {
          // Try a fallback to get all officers if the filtered query fails
          try {
            const allResponse = await api.get('/officers') as Officer[] | { data: Officer[] };
            
            // Handle direct array response
            if (allResponse && Array.isArray(allResponse)) {
              // Filter officers by unit ID on the client side
              const filteredOfficers = allResponse.filter(
                (officer: Officer) => officer.primaryUnit?.id === unitId
              );
              setOfficers(filteredOfficers);
            }
            // Handle response.data array
            else if (allResponse && 'data' in allResponse && Array.isArray(allResponse.data)) {
              // Filter officers by unit ID on the client side
              const filteredOfficers = allResponse.data.filter(
                (officer: Officer) => officer.primaryUnit?.id === unitId
              );
              setOfficers(filteredOfficers);
            }
          } catch (fallbackErr) {
            console.error('Fallback fetch also failed:', fallbackErr);
          }
        }
      } catch (err) {
        console.error('Error fetching unit officers:', err);
        
        // Try a fallback to get all officers if the filtered query fails
        try {
          const allResponse = await api.get('/officers') as Officer[] | { data: Officer[] };
          
          // Handle direct array response
          if (allResponse && Array.isArray(allResponse)) {
            // Filter officers by unit ID on the client side
            const filteredOfficers = allResponse.filter(
              (officer: Officer) => officer.primaryUnit?.id === unitId
            );
            setOfficers(filteredOfficers);
          }
          // Handle response.data array
          else if (allResponse && 'data' in allResponse && Array.isArray(allResponse.data)) {
            // Filter officers by unit ID on the client side
            const filteredOfficers = allResponse.data.filter(
              (officer: Officer) => officer.primaryUnit?.id === unitId
            );
            setOfficers(filteredOfficers);
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
        }
      } finally {
        setLoadingOfficers(false);
      }
    };
    
    fetchOfficers();
  }, [api, auth]);
  
  // Load data if editing existing record
  useEffect(() => {
    const loadRecord = async () => {
      if (id) {
        try {
          const record = await getRecord(id);
          if (record && record.type === 'ud_case') {
            const udCase = record as UDCaseRecord;
            setFormData({
              ...initialFormState,
              ...udCase,
              dateOfOccurrence: udCase.dateOfOccurrence ? formatDate(udCase.dateOfOccurrence) : '',
              postMortemDate: udCase.postMortemDate ? formatDate(udCase.postMortemDate) : ''
            });
            
            // Find assigned officer if available
            if (udCase.assignedOfficerId && officers.length > 0) {
              const officer = officers.find(o => o.id === udCase.assignedOfficerId) || null;
              setSelectedOfficer(officer);
            }
          }
        } catch (err) {
          console.error('Error loading UD case:', err);
          setFormError('Failed to load UD case data');
        }
      }
    };
    
    loadRecord();
  }, [id, getRecord, officers]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };
  
  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    }
  };
  
  const handleOfficerChange = (_event: React.SyntheticEvent, officer: Officer | null) => {
    setSelectedOfficer(officer);
    if (officer) {
      setFormData(prev => ({ ...prev, assignedOfficerId: officer.id }));
    } else {
      setFormData(prev => ({ ...prev, assignedOfficerId: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.caseNumber) {
        throw new Error('Case number is required');
      }
      if (!formData.dateOfOccurrence) {
        throw new Error('Date of occurrence is required');
      }
      if (!formData.informantName) {
        throw new Error('Informant name is required');
      }
      if (!formData.informantAddress) {
        throw new Error('Informant address is required');
      }
      if (!formData.apparentCauseOfDeath) {
        throw new Error('Apparent cause of death is required');
      }
      if (!formData.location) {
        throw new Error('Location is required');
      }
      if (!formData.assignedOfficerId) {
        throw new Error('Assigned officer is required');
      }
      
      // Submit form data
      if (id) {
        // Update existing record
        await updateRecord(id, formData);
        setFormSuccess('UD case updated successfully');
        setTimeout(() => navigate(`/records/ud-case/${id}`), 1000);
      } else {
        // Create new record
        const result = await createRecord(formData);
        console.log('UD case created:', result);
        setFormSuccess('UD case created successfully');
        if (result && result?.id) {
          setTimeout(() => navigate(`/records/ud-case/${result.id}`), 1000);
        } else {
          setTimeout(() => navigate(`/records/type/ud_case`), 1000);
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save UD case');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading && !formData.caseNumber) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <PageContainer>
        <Box mb={3}>
          <Typography variant="h4">
            {id ? 'Edit UD Case' : 'Create New UD Case'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {id ? `Editing case ${formData.caseNumber}` : 'Enter details for the new UD case'}
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
            {/* Case Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Case Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="Case Number"
                name="caseNumber"
                value={formData.caseNumber}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Date of Occurrence*"
                value={formData.dateOfOccurrence ? new Date(formData.dateOfOccurrence) : null}
                onChange={(date) => handleDateChange('dateOfOccurrence', date)}
                disabled={isSubmitting}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
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
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Investigation Status</InputLabel>
                <Select
                  name="investigationStatus"
                  value={formData.investigationStatus}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Investigation Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="investigation">Under Investigation</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={officers}
                loading={loadingOfficers}
                value={selectedOfficer}
                onChange={handleOfficerChange}
                getOptionLabel={(option) => {
                  const rankDisplay = option.rank ? option.rank.abbreviation || option.rank.name : '';
                  const label = `${rankDisplay ? rankDisplay + ' ' : ''}${option.firstName} ${option.lastName} (${option.badgeNumber})`;
                  console.log('Officer option label:', label, option);
                  return label;
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.rank?.abbreviation || ''} {option.firstName} {option.lastName} ({option.badgeNumber})
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned Officer"
                    required
                    fullWidth
                    error={!formData.assignedOfficerId}
                    helperText={!formData.assignedOfficerId ? 'Assigned officer is required' : ''}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOfficers ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disabled={isSubmitting}
              />
              {/* Debug information */}
              <Box sx={{ mt: 1, fontSize: '12px', color: 'text.secondary' }}>
                {officers.length > 0 ? 
                  `${officers.length} officers available` : 
                  'No officers loaded'
                }
              </Box>
            </Grid>
            
            {/* Deceased Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Deceased Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Deceased Name"
                name="deceasedName"
                value={formData.deceasedName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Identification Status</InputLabel>
                <Select
                  name="identificationStatus"
                  value={formData.identificationStatus}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Identification Status"
                >
                  <MenuItem value="identified">Identified</MenuItem>
                  <MenuItem value="unidentified">Unidentified</MenuItem>
                  <MenuItem value="partial">Partially Identified</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Deceased Address"
                name="deceasedAddress"
                value={formData.deceasedAddress}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                label="Apparent Cause of Death"
                name="apparentCauseOfDeath"
                value={formData.apparentCauseOfDeath}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            {/* Informant Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informant Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="Informant Name"
                name="informantName"
                value={formData.informantName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Informant Contact"
                name="informantContact"
                value={formData.informantContact}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="Informant Address"
                name="informantAddress"
                value={formData.informantAddress}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Relation to Deceased"
                name="informantRelation"
                value={formData.informantRelation}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            {/* Post Mortem Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Post Mortem Information (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Post Mortem Date"
                value={formData.postMortemDate ? new Date(formData.postMortemDate) : null}
                onChange={(date) => handleDateChange('postMortemDate', date)}
                disabled={isSubmitting}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Post Mortem Doctor"
                name="postMortemDoctor"
                value={formData.postMortemDoctor}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Post Mortem Hospital"
                name="postMortemHospital"
                value={formData.postMortemHospital}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
            
            {/* Additional Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={4}
              />
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
                {isSubmitting ? 'Saving...' : id ? 'Update UD Case' : 'Create UD Case'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </PageContainer>
    </LocalizationProvider>
  );
};

export default UDCaseForm; 