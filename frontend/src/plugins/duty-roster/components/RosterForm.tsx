import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Divider,
  Alert,
  Card,
  CardHeader,
  CardContent,
  useTheme,
  IconButton,
  Breadcrumbs,
  Link,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { usePlugins } from '../../../core/plugins';
import { useData } from '../../../core/data/data-context';
import { DutyRosterStatus, CreateDutyRosterDto } from '../types';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';
import { PageContainer } from './common';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

type RosterFormMode = 'create' | 'edit';

interface FormValues {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  status: DutyRosterStatus;
}

const RosterForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plugin = usePlugins().getPlugin('sura-duty-roster-plugin');
  const dataContext = useData();
  const theme = useTheme();
  
  const [mode] = useState<RosterFormMode>(id ? 'edit' : 'create');
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    startDate: null,
    endDate: null,
    description: '',
    status: 'DRAFT' as DutyRosterStatus
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setLoading(true);
        
        if (!plugin) {
          throw new Error('Plugin not found');
        }
        
        const rosterRepositoryExt = plugin.getExtensionPoints('duty-roster:rosterRepository');
        if (!rosterRepositoryExt || rosterRepositoryExt.length === 0) {
          throw new Error('Roster repository not found');
        }
        
        const rosterRepository = rosterRepositoryExt[0] as unknown as DutyRosterRepository;
        
        if (id) {
          const fetchedRoster = await rosterRepository.getById(id);
          
          if (fetchedRoster) {
            setFormValues({
              name: fetchedRoster.name,
              startDate: new Date(fetchedRoster.startDate),
              endDate: new Date(fetchedRoster.endDate),
              description: fetchedRoster.notes || '',
              status: fetchedRoster.status
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching roster:', err);
        setError(`Failed to load roster: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRoster();
    }
  }, [id, plugin]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleStartDateChange = (newDate: Date | null) => {
    setFormValues(prev => ({
      ...prev,
      startDate: newDate
    }));
    
    if (formErrors.startDate) {
      setFormErrors(prev => ({
        ...prev,
        startDate: ''
      }));
    }
    
    // If end date is set and is now before start date, clear the validation error
    if (newDate && formValues.endDate && formErrors.endDate && newDate <= formValues.endDate) {
      setFormErrors(prev => ({
        ...prev,
        endDate: ''
      }));
    }
  };
  
  const handleEndDateChange = (newDate: Date | null) => {
    setFormValues(prev => ({
      ...prev,
      endDate: newDate
    }));
    
    if (formErrors.endDate) {
      setFormErrors(prev => ({
        ...prev,
        endDate: ''
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.name.trim()) {
      errors.name = 'Roster name is required';
    }
    
    if (!formValues.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formValues.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (formValues.startDate && formValues.endDate && formValues.startDate > formValues.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (!formValues.status) {
      errors.status = 'Status is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      if (!dataContext) {
        throw new Error('Data context not available');
      }
      
      // Create repository directly instead of using extension points
      const rosterRepository = new DutyRosterRepository(
        dataContext.api,
        dataContext.cache,
        dataContext.sync,
        dataContext.storage
      );
      
      const rosterData: CreateDutyRosterDto = {
        name: formValues.name,
        startDate: formValues.startDate!.toISOString(),
        endDate: formValues.endDate!.toISOString(),
        notes: formValues.description,
        status: formValues.status
      };
      
      if (mode === 'edit' && id) {
        // Update roster
        await rosterRepository.update(id, rosterData);
        setSuccessMessage('Roster updated successfully');
      } else {
        // Create roster
        const newRoster = await rosterRepository.create(rosterData);
        setSuccessMessage('Roster created successfully');
        
        // Redirect to the new roster after a short delay
        setTimeout(() => {
          navigate(`/duty-roster/rosters/${newRoster.id}`);
        }, 1500);
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error saving roster:', err);
      setError(`Failed to save roster: ${err instanceof Error ? err.message : String(err)}`);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading roster details...
          </Typography>
        </Box>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/duty-roster" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/duty-roster/rosters" color="inherit" underline="hover">
          Rosters
        </Link>
        <Typography color="text.primary">
          {mode === 'create' ? 'Create New Roster' : 'Edit Roster'}
        </Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            sx={{ mr: 2 }}
            onClick={() => navigate('/duty-roster/rosters')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="500">
            {mode === 'create' ? 'Create New Duty Roster' : 'Edit Duty Roster'}
          </Typography>
        </Box>
      </Box>
      
      {/* Error and success messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      {/* Form Card */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardHeader title="Roster Information" />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Roster Name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  variant="outlined"
                  placeholder="Enter a descriptive name for this roster"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formValues.startDate}
                    onChange={handleStartDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.startDate,
                        helperText: formErrors.startDate,
                        required: true,
                        variant: "outlined",
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={formValues.endDate}
                    onChange={handleEndDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.endDate,
                        helperText: formErrors.endDate,
                        required: true,
                        variant: "outlined",
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth error={!!formErrors.status} required variant="outlined">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formValues.status}
                    onChange={handleSelectChange}
                    label="Status"
                    startAdornment={
                      <InputAdornment position="start">
                        <TimeIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="PUBLISHED">Published</MenuItem>
                  </Select>
                  {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Enter additional details about this roster (optional)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/duty-roster/rosters')}
            disabled={saving}
            startIcon={<CancelIcon />}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {saving ? 'Saving...' : (mode === 'create' ? 'Create Roster' : 'Update Roster')}
          </Button>
        </Box>
      </Card>
    </PageContainer>
  );
};

export default RosterForm; 