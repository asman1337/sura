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
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRecords } from '../../hooks/useRecords';
import { UDCaseRecord, CreateUDCase } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PageContainer } from '../common';
import { useData } from '../../../../core/data';

const UDCaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading, error } = useRecords('ud_case');
  const { auth } = useData();
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
    
    // Assigned Officer Information (simple fields)
    assignedOfficerName: '',
    assignedOfficerBadgeNumber: '',
    assignedOfficerContact: '',
    assignedOfficerRank: '',
    assignedOfficerDepartment: '',
    
    postMortemDate: '',
    postMortemDoctor: '',
    postMortemHospital: '',
    photoUrls: [],
    investigationStatus: 'pending',
    description: '',
    // New fields for sample data compatibility
    serialNumber: '',
    policeStationCode: '',
    policeStationName: '',
    autopsyResults: {
      cause_of_death: '',
      manner_of_death: 'undetermined',
      findings: '',
      toxicology_results: '',
      time_of_death_estimate: '',
      injuries_description: ''
    },
    finalFormStatus: 'draft',
    finalFormSubmissionDate: '',
    finalFormReviewedBy: '',
    finalFormApprovedBy: '',
    deceasedAge: undefined,
    deceasedGender: 'unknown',
    deceasedOccupation: '',
    deceasedNationality: '',
    exactLocation: '',
    nearestLandmark: '',
    coordinates: {
      latitude: undefined,
      longitude: undefined
    }
  };
  
  const [formData, setFormData] = useState<CreateUDCase>(initialFormState);
  
  // Set unitId from current user
  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser?.primaryUnit?.id) {
      setFormData(prev => ({ ...prev, unitId: currentUser.primaryUnit!.id }));
    }
  }, [auth]);
  
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
  
  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
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
            
            {/* Assigned Officer Information Section */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assigned Officer Information (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Officer Name"
                name="assignedOfficerName"
                value={formData.assignedOfficerName || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter officer's full name"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Badge Number"
                name="assignedOfficerBadgeNumber"
                value={formData.assignedOfficerBadgeNumber || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter badge number"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Number"
                name="assignedOfficerContact"
                value={formData.assignedOfficerContact || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter contact number"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Rank"
                name="assignedOfficerRank"
                value={formData.assignedOfficerRank || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter officer rank"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Department"
                name="assignedOfficerDepartment"
                value={formData.assignedOfficerDepartment || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Enter department name"
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

            {/* Police Station Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Police Station Information (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="SL NO"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Police Station Code"
                name="policeStationCode"
                value={formData.policeStationCode || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., AUSGRAM PS"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Police Station Name"
                name="policeStationName"
                value={formData.policeStationName || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Enhanced Deceased Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Enhanced Deceased Information (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Age"
                name="deceasedAge"
                type="number"
                value={formData.deceasedAge || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="deceasedGender"
                  value={formData.deceasedGender || 'unknown'}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Occupation"
                name="deceasedOccupation"
                value={formData.deceasedOccupation || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nationality"
                name="deceasedNationality"
                value={formData.deceasedNationality || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Enhanced Location Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Enhanced Location Information (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Exact Location"
                name="exactLocation"
                value={formData.exactLocation || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={2}
                placeholder="More specific location details"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nearest Landmark"
                name="nearestLandmark"
                value={formData.nearestLandmark || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Latitude"
                name="coordinates.latitude"
                type="number"
                value={formData.coordinates?.latitude || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  setFormData(prev => ({
                    ...prev,
                    coordinates: { ...prev.coordinates, latitude: value }
                  }));
                }}
                disabled={isSubmitting}
                inputProps={{ step: "any" }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Longitude"
                name="coordinates.longitude"
                type="number"
                value={formData.coordinates?.longitude || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  setFormData(prev => ({
                    ...prev,
                    coordinates: { ...prev.coordinates, longitude: value }
                  }));
                }}
                disabled={isSubmitting}
                inputProps={{ step: "any" }}
              />
            </Grid>

            {/* Enhanced Autopsy Results */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Autopsy Results (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Cause of Death (Autopsy)"
                name="autopsyResults.cause_of_death"
                value={formData.autopsyResults?.cause_of_death || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    autopsyResults: { ...prev.autopsyResults, cause_of_death: e.target.value }
                  }));
                }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Manner of Death</InputLabel>
                <Select
                  name="autopsyResults.manner_of_death"
                  value={formData.autopsyResults?.manner_of_death || 'undetermined'}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      autopsyResults: { ...prev.autopsyResults, manner_of_death: e.target.value as any }
                    }));
                  }}
                  disabled={isSubmitting}
                  label="Manner of Death"
                >
                  <MenuItem value="natural">Natural</MenuItem>
                  <MenuItem value="accident">Accident</MenuItem>
                  <MenuItem value="suicide">Suicide</MenuItem>
                  <MenuItem value="homicide">Homicide</MenuItem>
                  <MenuItem value="undetermined">Undetermined</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Autopsy Findings"
                name="autopsyResults.findings"
                value={formData.autopsyResults?.findings || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    autopsyResults: { ...prev.autopsyResults, findings: e.target.value }
                  }));
                }}
                disabled={isSubmitting}
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Toxicology Results"
                name="autopsyResults.toxicology_results"
                value={formData.autopsyResults?.toxicology_results || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    autopsyResults: { ...prev.autopsyResults, toxicology_results: e.target.value }
                  }));
                }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Estimated Time of Death"
                name="autopsyResults.time_of_death_estimate"
                value={formData.autopsyResults?.time_of_death_estimate || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    autopsyResults: { ...prev.autopsyResults, time_of_death_estimate: e.target.value }
                  }));
                }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Injuries Description"
                name="autopsyResults.injuries_description"
                value={formData.autopsyResults?.injuries_description || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    autopsyResults: { ...prev.autopsyResults, injuries_description: e.target.value }
                  }));
                }}
                disabled={isSubmitting}
                multiline
                rows={3}
              />
            </Grid>

            {/* Final Form Status */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Final Form Status (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Final Form Status</InputLabel>
                <Select
                  name="finalFormStatus"
                  value={formData.finalFormStatus || 'draft'}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Final Form Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Submission Date"
                value={formData.finalFormSubmissionDate ? new Date(formData.finalFormSubmissionDate) : null}
                onChange={(date) => handleDateChange('finalFormSubmissionDate', date)}
                disabled={isSubmitting}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Reviewed By"
                name="finalFormReviewedBy"
                value={formData.finalFormReviewedBy || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Approved By"
                name="finalFormApprovedBy"
                value={formData.finalFormApprovedBy || ''}
                onChange={handleChange}
                disabled={isSubmitting}
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