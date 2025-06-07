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
  const { getRecord, createRecord, updateRecord, loading } = useRecords('ud_case');
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

    // New fields
    ageCategory: 'unknown',
    deceasedReligion: '',
    deceasedCaste: '',
    identifiedByName: '',
    identifiedByAddress: '',
    identifiedByMobile: '',
    identifiedByRelation: '',

    // Other fields for compatibility
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
  const cleanFormData = (data: CreateUDCase) => {
    const cleaned = { ...data };

    // Clean date fields - convert empty strings to undefined
    if (!cleaned.postMortemDate || cleaned.postMortemDate.trim() === '') {
      delete cleaned.postMortemDate;
    }
    if (!cleaned.finalFormSubmissionDate || cleaned.finalFormSubmissionDate.trim() === '') {
      delete cleaned.finalFormSubmissionDate;
    }
    // Clean optional string fields - convert empty strings to undefined
    const optionalStringFields = [
      'deceasedReligion', 'deceasedCaste', 'identifiedByName', 'identifiedByAddress',
      'identifiedByMobile', 'identifiedByRelation', 'serialNumber', 'policeStationCode',
      'policeStationName', 'assignedOfficerName', 'assignedOfficerBadgeNumber',
      'assignedOfficerContact', 'assignedOfficerRank', 'assignedOfficerDepartment',
      'postMortemDoctor', 'postMortemHospital', 'finalFormReviewedBy', 'finalFormApprovedBy',
      'deceasedOccupation', 'deceasedNationality', 'exactLocation', 'nearestLandmark', 'description'
    ];

    optionalStringFields.forEach(field => {
      if (cleaned[field as keyof CreateUDCase] === '') {
        delete cleaned[field as keyof CreateUDCase];
      }
    });// Clean optional number fields
    if (cleaned.deceasedAge === undefined || cleaned.deceasedAge === null || cleaned.deceasedAge === 0) {
      delete cleaned.deceasedAge;
    }

    // Clean coordinates if empty
    if (cleaned.coordinates) {
      if (cleaned.coordinates.latitude === undefined || cleaned.coordinates.latitude === null) {
        delete cleaned.coordinates.latitude;
      }
      if (cleaned.coordinates.longitude === undefined || cleaned.coordinates.longitude === null) {
        delete cleaned.coordinates.longitude;
      }
      // If both coordinates are empty, remove the coordinates object
      if (!cleaned.coordinates.latitude && !cleaned.coordinates.longitude) {
        delete cleaned.coordinates;
      }
    }
    // Clean autopsy results if all fields are empty
    if (cleaned.autopsyResults) {
      const autopsyFields = Object.values(cleaned.autopsyResults);
      const hasContent = autopsyFields.some(value => value && value.trim() !== '');
      if (!hasContent) {
        delete cleaned.autopsyResults;
      } else {
        // Clean individual autopsy fields
        Object.keys(cleaned.autopsyResults).forEach(key => {
          const value = cleaned.autopsyResults![key as keyof typeof cleaned.autopsyResults];
          if (typeof value === 'string' && value.trim() === '') {
            delete cleaned.autopsyResults![key as keyof typeof cleaned.autopsyResults];
          }
        });
      }
    }

    // Clean photoUrls if empty
    if (cleaned.photoUrls && cleaned.photoUrls.length === 0) {
      delete cleaned.photoUrls;
    }

    return cleaned;
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

      // Clean form data before submission
      const cleanedData = cleanFormData(formData);
      // Submit form data
      if (id) {
        // Update existing record
        await updateRecord(id, cleanedData);
        setFormSuccess('UD case updated successfully');
        setTimeout(() => navigate(`/records/ud-case/${id}`), 1000);
      } else {
        // Create new record
        const result = await createRecord(cleanedData);
        setFormSuccess('UD case created successfully');
        if (result && result?.id) {
          setTimeout(() => navigate(`/records/ud-case/${result.id}`), 1000);
        } else {
          setTimeout(() => navigate(`/records/type/ud_case`), 1000);
        }
      }
    } catch (err: any) {
      // Extract the actual error message from the backend response
      let errorMessage = 'Failed to save UD case';

      if (err?.response?.data?.message) {
        // Backend returned a specific error message
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        // Backend returned an error field
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        // Standard Error object
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        // String error
        errorMessage = err;
      }
      setFormError(errorMessage);
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
      <PageContainer>        <Box mb={3}>
        <Typography variant="h4">
          {id ? 'Edit UD Case' : 'Create New UD Case'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {id ? `Editing case ${formData.caseNumber}` : 'Enter details for the new UD case'}
        </Typography>
      </Box>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Grid container spacing={3}>

            {/* Section 1: Basic Case Information */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  📋 Basic Case Information
                </Typography>
              </Paper>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="Case/GD Number"
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
              <FormControl fullWidth>
                <InputLabel>Investigation Status</InputLabel>
                <Select
                  name="investigationStatus"
                  value={formData.investigationStatus}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Investigation Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Section 2: Deceased Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  👤 Deceased Information
                </Typography>
              </Paper>
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
                <InputLabel>Age Category</InputLabel>
                <Select
                  name="ageCategory"
                  value={formData.ageCategory || 'unknown'}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                  label="Age Category"
                >
                  <MenuItem value="adult">Adult</MenuItem>
                  <MenuItem value="child">Child</MenuItem>
                  <MenuItem value="unknown">Unknown</MenuItem>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Religion"
                name="deceasedReligion"
                value={formData.deceasedReligion || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Caste"
                name="deceasedCaste"
                value={formData.deceasedCaste || ''}
                onChange={handleChange}
                disabled={isSubmitting}
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
                  <MenuItem value="partially_identified">Partially Identified</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Section 3: Informant Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  📞 Informant Information
                </Typography>
              </Paper>
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

            <Grid size={{ xs: 12 }}>
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

            {/* Section 4: Identified By Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Identified By Information
                </Typography>
              </Paper>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Identified By Name"
                name="identifiedByName"
                value={formData.identifiedByName || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Person who identified the deceased"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Identifier Mobile"
                name="identifiedByMobile"
                value={formData.identifiedByMobile || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Mobile number of identifier"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Identifier Address"
                name="identifiedByAddress"
                value={formData.identifiedByAddress || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                multiline
                rows={2}
                placeholder="Address of person who identified"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Identifier Relation"
                name="identifiedByRelation"
                value={formData.identifiedByRelation || ''}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Relation to deceased"
              />
            </Grid>

            {/* Section 5: Location Details */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  📍 Location Details
                </Typography>
              </Paper>
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

            {/* Section 6: Police Station Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.600', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  🏢 Police Station Information
                </Typography>
              </Paper>
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

            {/* Section 7: Assigned Officer Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'warning.dark', color: 'warning.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  👮 Assigned Officer Information
                </Typography>
              </Paper>
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

            {/* Section 8: Post Mortem Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.500', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  🏥 Post Mortem Information
                </Typography>
              </Paper>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Post Mortem Date"
                value={formData.postMortemDate ? new Date(formData.postMortemDate) : null}
                onChange={(date) => handleDateChange('postMortemDate', date)}
                disabled={isSubmitting}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  }
                }}
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

            {/* Section 9: Autopsy Results */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'purple', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  🔬 Autopsy Results
                </Typography>
              </Paper>
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

            {/* Section 10: Additional Information */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'success.dark', color: 'success.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  📝 Additional Information
                </Typography>
              </Paper>
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

            {/* Section 11: Final Form Status */}
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  ✅ Final Form Status
                </Typography>
              </Paper>
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
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Submission Date"
                value={formData.finalFormSubmissionDate ? new Date(formData.finalFormSubmissionDate) : null}
                onChange={(date) => handleDateChange('finalFormSubmissionDate', date)}
                disabled={isSubmitting}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  }
                }}
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
            {/* Submit Button */}
            <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
              {/* Error and Success Messages */}
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

              <Box display="flex" justifyContent="space-between" alignItems="center">
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
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : id ? (
                    'Update UD Case'
                  ) : (
                    'Create UD Case'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </PageContainer>
    </LocalizationProvider>
  );
};

export default UDCaseForm;