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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRecords } from '../../hooks/useRecords';
import { ArrestRecord, CreateArrestRecord } from '../../types';
import { PageContainer } from '../common';
import { useData } from '../../../../core/data';

const ArrestRecordForm: React.FC = () => {  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading } = useRecords('arrest_record');
  const { auth } = useData();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState: CreateArrestRecord = {
    type: 'arrest_record',
    unitId: '',
    partType: 'part1',
    accusedName: '',
    accusedAddress: '',
    accusedPhone: '',
    accusedPCN: '',
    dateOfArrest: new Date().toISOString().split('T')[0],
    arrestingOfficerName: '',
    dateForwardedToCourt: '',
    courtName: '',
    courtAddress: '',
    judgeNameOrCourtNumber: '',
    caseReference: '',
    trialResult: '',
    age: undefined,
    identifyingMarks: '',
    height: undefined,
    weight: undefined,
    eyeColor: '',
    hairColor: '',
    complexion: '',
    otherPhysicalFeatures: '',
    photoUrls: [],
    arrestCircumstances: '',
    arrestLocation: '',
    recordDate: new Date().toISOString().split('T')[0],
    isIdentificationRequired: true,
    remarks: '',
    notes: '',
  };
  const [formData, setFormData] = useState<CreateArrestRecord>(initialFormState);
  const [photoUrl, setPhotoUrl] = useState('');

  // Set unitId from current user
  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser?.primaryUnit?.id) {
      setFormData(prev => ({ ...prev, unitId: currentUser.primaryUnit!.id }));
    }
  }, [auth]);

  // Load existing record if editing
  useEffect(() => {
    if (id) {
      loadRecord();
    }
  }, [id]);

  const loadRecord = async () => {
    try {
      const record = await getRecord(id!) as ArrestRecord;
      if (record) {
        setFormData({
          type: 'arrest_record',
          unitId: record.unitId,
          partType: record.partType,
          accusedName: record.accusedName,
          accusedAddress: record.accusedAddress,
          accusedPhone: record.accusedPhone || '',
          accusedPCN: record.accusedPCN || '',
          dateOfArrest: record.dateOfArrest.split('T')[0],
          arrestingOfficerName: record.arrestingOfficerName,
          dateForwardedToCourt: record.dateForwardedToCourt?.split('T')[0] || '',
          courtName: record.courtName || '',
          courtAddress: record.courtAddress || '',
          judgeNameOrCourtNumber: record.judgeNameOrCourtNumber || '',
          caseReference: record.caseReference || '',
          trialResult: record.trialResult || '',
          age: record.age,
          identifyingMarks: record.identifyingMarks || '',
          height: record.height,
          weight: record.weight,
          eyeColor: record.eyeColor || '',
          hairColor: record.hairColor || '',
          complexion: record.complexion || '',
          otherPhysicalFeatures: record.otherPhysicalFeatures || '',
          photoUrls: record.photoUrls || [],
          arrestCircumstances: record.arrestCircumstances || '',
          arrestLocation: record.arrestLocation || '',
          recordDate: record.recordDate.split('T')[0],
          isIdentificationRequired: record.isIdentificationRequired,
          remarks: record.remarks || '',
          notes: record.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading arrest record:', error);
      setFormError('Failed to load arrest record');
    }
  };

  const handleInputChange = (field: keyof CreateArrestRecord) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof CreateArrestRecord) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value === '' ? undefined : parseFloat(event.target.value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: keyof CreateArrestRecord) => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date.toISOString().split('T')[0] }));
    }
  };

  const handlePartTypeChange = (event: SelectChangeEvent<string>) => {
    const partType = event.target.value as 'part1' | 'part2';
    setFormData(prev => ({
      ...prev,
      partType,
      isIdentificationRequired: partType === 'part1'
    }));
  };

  const addPhotoUrl = () => {
    if (photoUrl.trim() && formData.photoUrls!.length < 4) {
      setFormData(prev => ({
        ...prev,
        photoUrls: [...(prev.photoUrls || []), photoUrl.trim()]
      }));
      setPhotoUrl('');
    }
  };

  const removePhotoUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);    try {
      // Validate required fields
      if (!formData.unitId || !formData.unitId.trim()) {
        throw new Error('Unit ID is required. Please ensure you are logged in and have a valid unit assigned.');
      }
      if (!formData.accusedName.trim()) {
        throw new Error('Accused name is required');
      }
      if (!formData.accusedAddress.trim()) {
        throw new Error('Accused address is required');
      }
      if (!formData.arrestingOfficerName.trim()) {
        throw new Error('Arresting officer name is required');
      }

      const payload = { ...formData };
      
      if (id) {
        await updateRecord(id, payload);
        setFormSuccess('Arrest record updated successfully');
      } else {
        await createRecord(payload);
        setFormSuccess('Arrest record created successfully');
        setTimeout(() => {
          navigate('/records');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error submitting arrest record:', error);
      setFormError(error.message || 'Failed to save arrest record');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading && id) {
    return (
      <PageContainer>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading Arrest Record...
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Arrest Record' : 'Create Arrest Record'}
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        
        {formSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {formSuccess}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Record Type Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Record Type
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Part Type</InputLabel>
                <Select
                  value={formData.partType}
                  label="Part Type"
                  onChange={handlePartTypeChange}
                >
                  <MenuItem value="part1">Part 1 (Full Details with Identification)</MenuItem>
                  <MenuItem value="part2">Part 2 (Simplified Record)</MenuItem>
                </Select>
              </FormControl>
              
              {formData.partType === 'part1' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Part 1 records require criminal identification details (physical description, photos, etc.)
                </Alert>
              )}
              
              {formData.partType === 'part2' && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Part 2 records have optional identification fields
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Accused Person Details */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Accused Person Details</Typography>
            </AccordionSummary>
            <AccordionDetails>              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Accused Name"
                    value={formData.accusedName}
                    onChange={handleInputChange('accusedName')}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.accusedPhone}
                    onChange={handleInputChange('accusedPhone')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.accusedAddress}
                    onChange={handleInputChange('accusedAddress')}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="P.C.N (Personal Complaint Number)"
                    value={formData.accusedPCN}
                    onChange={handleInputChange('accusedPCN')}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Arrest Details */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Arrest Details</Typography>
            </AccordionSummary>
            <AccordionDetails>              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Arrest"
                      value={new Date(formData.dateOfArrest)}
                      onChange={handleDateChange('dateOfArrest')}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Arresting Officer Name"
                    value={formData.arrestingOfficerName}
                    onChange={handleInputChange('arrestingOfficerName')}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Arrest Location"
                    value={formData.arrestLocation}
                    onChange={handleInputChange('arrestLocation')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Arrest Circumstances"
                    value={formData.arrestCircumstances}
                    onChange={handleInputChange('arrestCircumstances')}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Court Details */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <GavelIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Court & Case Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date Forwarded to Court"
                      value={formData.dateForwardedToCourt ? new Date(formData.dateForwardedToCourt) : null}
                      onChange={handleDateChange('dateForwardedToCourt')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Court Name"
                    value={formData.courtName}
                    onChange={handleInputChange('courtName')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Court Address"
                    value={formData.courtAddress}
                    onChange={handleInputChange('courtAddress')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Judge Name / Court Number"
                    value={formData.judgeNameOrCourtNumber}
                    onChange={handleInputChange('judgeNameOrCourtNumber')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Case Reference"
                    value={formData.caseReference}
                    onChange={handleInputChange('caseReference')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Trial Result"
                    value={formData.trialResult}
                    onChange={handleInputChange('trialResult')}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Criminal Identification (Required for Part 1, Optional for Part 2) */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Criminal Identification
                {formData.partType === 'part1' && <Chip label="Required" color="error" size="small" sx={{ ml: 1 }} />}
                {formData.partType === 'part2' && <Chip label="Optional" color="info" size="small" sx={{ ml: 1 }} />}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={formData.age || ''}
                    onChange={handleNumberChange('age')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Height (cm)"
                    type="number"
                    value={formData.height || ''}
                    onChange={handleNumberChange('height')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight || ''}
                    onChange={handleNumberChange('weight')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Eye Color"
                    value={formData.eyeColor}
                    onChange={handleInputChange('eyeColor')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Hair Color"
                    value={formData.hairColor}
                    onChange={handleInputChange('hairColor')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Complexion"
                    value={formData.complexion}
                    onChange={handleInputChange('complexion')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Identifying Marks"
                    value={formData.identifyingMarks}
                    onChange={handleInputChange('identifyingMarks')}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Other Physical Features"
                    value={formData.otherPhysicalFeatures}
                    onChange={handleInputChange('otherPhysicalFeatures')}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Photo Attachments */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <PhotoCameraIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Photo Attachments (Max 4)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 10 }}>
                    <TextField
                      fullWidth
                      label="Photo URL"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      disabled={formData.photoUrls!.length >= 4}
                    />
                  </Grid>
                  <Grid size={{ xs: 2 }}>
                    <Button
                      variant="contained"
                      onClick={addPhotoUrl}
                      disabled={!photoUrl.trim() || formData.photoUrls!.length >= 4}
                      fullWidth
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              {formData.photoUrls!.map((url, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {index + 1}. {url}
                  </Typography>
                  <IconButton onClick={() => removePhotoUrl(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Additional Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Additional Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Record Date"
                      value={new Date(formData.recordDate)}
                      onChange={handleDateChange('recordDate')}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={formData.remarks}
                    onChange={handleInputChange('remarks')}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 3 }} />

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/records')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? 'Saving...' : id ? 'Update Record' : 'Create Record'}
            </Button>
          </Box>
        </form>
      </Paper>
    </PageContainer>
  );
};

export default ArrestRecordForm;
