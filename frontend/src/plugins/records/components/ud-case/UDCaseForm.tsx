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
  Paper} from '@mui/material';
import { useRecords } from '../../hooks/useRecords';
import { UDCaseRecord, CreateUDCase } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PageContainer } from '../common';

const UDCaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading, error } = useRecords('ud_case');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
          }
        } catch (err) {
          console.error('Error loading UD case:', err);
          setFormError('Failed to load UD case data');
        }
      }
    };
    
    loadRecord();
  }, [id, getRecord]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!formData.caseNumber) {
        throw new Error('Case number is required');
      }
      if (!formData.dateOfOccurrence) {
        throw new Error('Date of occurrence is required');
      }
      if (!formData.informantName) {
        throw new Error('Informant name is required');
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
        setTimeout(() => navigate(`/records/ud-case/${id}`), 1500);
      } else {
        // Create new record
        const result = await createRecord(formData);
        setFormSuccess('UD case created successfully');
        setTimeout(() => navigate(`/records/ud-case/${result.id}`), 1500);
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
            <TextField
              required
              fullWidth
              label="Date of Occurrence"
              name="dateOfOccurrence"
              type="date"
              value={formData.dateOfOccurrence}
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
            <TextField
              required
              fullWidth
              label="Assigned Officer ID"
              name="assignedOfficerId"
              value={formData.assignedOfficerId}
              onChange={handleChange}
              disabled={isSubmitting}
            />
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
              Post Mortem Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Post Mortem Date"
              name="postMortemDate"
              type="date"
              value={formData.postMortemDate}
              onChange={handleChange}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
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
              Additional Information
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
  );
};

export default UDCaseForm; 