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
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useRecords } from '../../hooks/useRecords';
import { PaperDispatchRecord, CreatePaperDispatch } from '../../types';
import { PageContainer } from '../common';
import { useData } from '../../../../core/data';

const PaperDispatchForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, createRecord, updateRecord, loading } = useRecords('paper_dispatch');
  const { auth } = useData();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState: CreatePaperDispatch = {
    type: 'paper_dispatch',
    unitId: '',
    dateOfReceive: new Date().toISOString().split('T')[0],
    fromWhom: '',
    memoNumber: '',
    purpose: '',
    toWhom: '',
    caseReference: '',
    dateFixed: '',
    remarks: '',
    closedStatus: 'open',
    attachmentUrls: [],
    noExpectingReport: false,
    formType: 'part1',
    registryType: 'BLACK_INK',
    endorsedOfficerName: '',
    endorsedOfficerBadgeNumber: '',
    courtDetails: {
      courtName: '',
      caseNumber: '',
      hearingDate: ''
    },
    seniorOfficeDetails: {
      officeName: '',
      caseNumber: '',
      officerName: ''
    },
    publicPetitionDetails: {
      petitionerName: '',
      petitionNumber: '',
      subject: ''
    }
  };

  const [formData, setFormData] = useState<CreatePaperDispatch>(initialFormState);
  const [dateOfReceive, setDateOfReceive] = useState<Date | null>(new Date());
  const [dateFixed, setDateFixed] = useState<Date | null>(null);
  const [hearingDate, setHearingDate] = useState<Date | null>(null);

  // Load existing record if editing
  useEffect(() => {
    const loadRecord = async () => {
      if (id) {
        try {
          const record = await getRecord(id) as PaperDispatchRecord;
          if (record) {
            setFormData({
              ...record,
              type: 'paper_dispatch'
            });
            setDateOfReceive(new Date(record.dateOfReceive));
            if (record.dateFixed) {
              setDateFixed(new Date(record.dateFixed));
            }
            if (record.courtDetails?.hearingDate) {
              setHearingDate(new Date(record.courtDetails.hearingDate));
            }
          }
        } catch (error) {
          setFormError('Failed to load paper dispatch record');
        }
      }
    };

    loadRecord();
  }, [id, getRecord]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => {
      const parent = prev[parentField as keyof CreatePaperDispatch] as any;
      return {
        ...prev,
        [parentField]: {
          ...parent,
          [childField]: value
        }
      };
    });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    handleInputChange(name, value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // Prepare form data with dates
      const submitData: CreatePaperDispatch = {
        ...formData,
        dateOfReceive: dateOfReceive ? dateOfReceive.toISOString().split('T')[0] : '',
        dateFixed: dateFixed ? dateFixed.toISOString().split('T')[0] : undefined,
        unitId: formData.unitId || auth.getCurrentUser()?.primaryUnit?.id || '',
        courtDetails: formData.formType === 'part1' ? {
          ...formData.courtDetails,
          hearingDate: hearingDate ? hearingDate.toISOString().split('T')[0] : undefined
        } : undefined,
        seniorOfficeDetails: formData.formType === 'part2' ? formData.seniorOfficeDetails : undefined,
        publicPetitionDetails: formData.formType === 'part4' ? formData.publicPetitionDetails : undefined
      };

      if (id) {
        await updateRecord(id, submitData);
        setFormSuccess('Paper dispatch record updated successfully');
      } else {
        await createRecord(submitData);
        setFormSuccess('Paper dispatch record created successfully');
        // Reset form after successful creation
        setFormData(initialFormState);
        setDateOfReceive(new Date());
        setDateFixed(null);
        setHearingDate(null);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save paper dispatch record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormTypeSpecificFields = () => {
    switch (formData.formType) {
      case 'part1':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Court Details (Part 1)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Court Name"
                    value={formData.courtDetails?.courtName || ''}
                    onChange={(e) => handleNestedChange('courtDetails', 'courtName', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Case Number"
                    value={formData.courtDetails?.caseNumber || ''}
                    onChange={(e) => handleNestedChange('courtDetails', 'caseNumber', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Hearing Date"
                      value={hearingDate}
                      onChange={(newValue) => setHearingDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );

      case 'part2':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Senior Office Details (Part 2)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Office Name"
                    value={formData.seniorOfficeDetails?.officeName || ''}
                    onChange={(e) => handleNestedChange('seniorOfficeDetails', 'officeName', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Case Number"
                    value={formData.seniorOfficeDetails?.caseNumber || ''}
                    onChange={(e) => handleNestedChange('seniorOfficeDetails', 'caseNumber', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Officer Name"
                    value={formData.seniorOfficeDetails?.officerName || ''}
                    onChange={(e) => handleNestedChange('seniorOfficeDetails', 'officerName', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );

      case 'part4':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Public Petition Details (Part 4)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Petitioner Name"
                    value={formData.publicPetitionDetails?.petitionerName || ''}
                    onChange={(e) => handleNestedChange('publicPetitionDetails', 'petitionerName', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Petition Number"
                    value={formData.publicPetitionDetails?.petitionNumber || ''}
                    onChange={(e) => handleNestedChange('publicPetitionDetails', 'petitionNumber', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Subject"
                    multiline
                    rows={3}
                    value={formData.publicPetitionDetails?.subject || ''}
                    onChange={(e) => handleNestedChange('publicPetitionDetails', 'subject', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Paper sx={{ p: 3 }}>
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

        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Receive *"
                  value={dateOfReceive}
                  onChange={(newValue) => setDateOfReceive(newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Form Type</InputLabel>
                <Select
                  name="formType"
                  value={formData.formType}
                  label="Form Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="part1">Part 1 - Court</MenuItem>
                  <MenuItem value="part2">Part 2 - Senior Office</MenuItem>
                  <MenuItem value="part4">Part 4 - Public Petition</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="From Whom"
                value={formData.fromWhom}
                onChange={(e) => handleInputChange('fromWhom', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Memo No. / ORG and DR No, GD, Case no etc"
                value={formData.memoNumber || ''}
                onChange={(e) => handleInputChange('memoNumber', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Purpose"
                multiline
                rows={3}
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="To Whom (Endorsed)"
                value={formData.toWhom || ''}
                onChange={(e) => handleInputChange('toWhom', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Case Reference"
                value={formData.caseReference || ''}
                onChange={(e) => handleInputChange('caseReference', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date Fix (Court Expected Date)"
                  value={dateFixed}
                  onChange={(newValue) => setDateFixed(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Closed Status</InputLabel>
                <Select
                  name="closedStatus"
                  value={formData.closedStatus || 'open'}
                  label="Closed Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.noExpectingReport || false}
                    onChange={(e) => handleInputChange('noExpectingReport', e.target.checked)}
                  />
                }
                label="No Expecting Report (Won't move to Red Ink)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={4}
                value={formData.remarks || ''}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Endorsed Officer Information */}
          <Typography variant="h6" gutterBottom>
            Endorsed Officer Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Endorsed Officer Name"
                value={formData.endorsedOfficerName || ''}
                onChange={(e) => handleInputChange('endorsedOfficerName', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Endorsed Officer Badge Number"
                value={formData.endorsedOfficerBadgeNumber || ''}
                onChange={(e) => handleInputChange('endorsedOfficerBadgeNumber', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Form Type Specific Fields */}
          {renderFormTypeSpecificFields()}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || loading}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Saving...' : id ? 'Update Record' : 'Create Record'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/records')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </PageContainer>
  );
};

export default PaperDispatchForm;
