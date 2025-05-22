import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  Breadcrumbs,
  Link,
  useTheme,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useData } from '../../../core/data/data-context';
import { CreateDutyShiftDto, UpdateDutyShiftDto, DutyRoster } from '../types';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';
import { DutyShiftRepository } from '../repositories/duty-shift-repository';
import { PageContainer } from './common';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

type ShiftFormMode = 'create' | 'edit';

interface FormValues {
  name: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  type: string;
  location: string;
  notes: string;
  isDefault: boolean;
}

interface FormErrors {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  location?: string;
}

const shiftTypes = [
  { value: 'patrol', label: 'Patrol' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'special', label: 'Special Event' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'training', label: 'Training' },
  { value: 'court', label: 'Court' }
];

const ShiftForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rosterId = queryParams.get('rosterId') || undefined;
  const dataContext = useData();
  const theme = useTheme();
  
  const [mode] = useState<ShiftFormMode>(id ? 'edit' : 'create');
  const [roster, setRoster] = useState<DutyRoster | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    date: new Date(),
    startTime: '08:00',
    endTime: '16:00',
    type: 'patrol',
    location: '',
    notes: '',
    isDefault: false
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Fetch data when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!dataContext) {
          throw new Error('Data context not available');
        }
        
        // Create repositories
        const rosterRepository = new DutyRosterRepository(
          dataContext.api,
          dataContext.cache,
          dataContext.sync,
          dataContext.storage
        );
        
        const shiftRepository = new DutyShiftRepository(
          dataContext.api,
          dataContext.cache,
          dataContext.sync,
          dataContext.storage
        );
        
        // Fetch roster details if rosterId is provided
        if (rosterId) {
          const fetchedRoster = await rosterRepository.getById(rosterId);
          setRoster(fetchedRoster);
          
          // Pre-populate date based on roster start date
          if (fetchedRoster && fetchedRoster.startDate) {
            setFormValues(prev => ({
              ...prev,
              date: new Date(fetchedRoster.startDate)
            }));
          }
        }
        
        // If editing existing shift, fetch shift data
        if (mode === 'edit' && id) {
          const fetchedShift = await shiftRepository.getById(id);
          
          if (fetchedShift) {
            setFormValues({
              name: fetchedShift.name || '',
              date: new Date(fetchedShift.date),
              startTime: fetchedShift.startTime,
              endTime: fetchedShift.endTime,
              type: fetchedShift.type,
              location: fetchedShift.location,
              notes: fetchedShift.notes || '',
              isDefault: fetchedShift.isDefault || false
            });
            
            // If shift has roster ID but no roster was explicitly provided in URL
            if (fetchedShift.rosterId && !rosterId) {
              const shiftRoster = await rosterRepository.getById(fetchedShift.rosterId);
              setRoster(shiftRoster);
            }
          } else {
            setError('Shift not found');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dataContext, id, rosterId, mode]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
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
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleDateChange = (date: Date | null) => {
    setFormValues(prev => ({
      ...prev,
      date
    }));
    
    // Clear error when field is edited
    if (formErrors.date) {
      setFormErrors(prev => ({
        ...prev,
        date: undefined
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formValues.date) {
      errors.date = 'Date is required';
    } else if (roster) {
      const shiftDate = new Date(formValues.date);
      const rosterStartDate = new Date(roster.startDate);
      const rosterEndDate = new Date(roster.endDate);
      
      // Reset time parts for date comparison
      shiftDate.setHours(0, 0, 0, 0);
      rosterStartDate.setHours(0, 0, 0, 0);
      rosterEndDate.setHours(0, 0, 0, 0);
      
      if (shiftDate < rosterStartDate || shiftDate > rosterEndDate) {
        errors.date = `Date must be within roster period (${format(rosterStartDate, 'MMM d, yyyy')} - ${format(rosterEndDate, 'MMM d, yyyy')})`;
      }
    }
    
    if (!formValues.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formValues.endTime) {
      errors.endTime = 'End time is required';
    }
    
    // Validate time format and logic
    if (formValues.startTime && formValues.endTime) {
      const startParts = formValues.startTime.split(':').map(Number);
      const endParts = formValues.endTime.split(':').map(Number);
      
      if (startParts.length === 2 && endParts.length === 2) {
        const [startHour, startMinute] = startParts;
        const [endHour, endMinute] = endParts;
        
        // Convert to minutes for easy comparison
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (endMinutes <= startMinutes) {
          errors.endTime = 'End time must be after start time';
        }
      }
    }
    
    if (!formValues.type) {
      errors.type = 'Shift type is required';
    }
    
    if (!formValues.location) {
      errors.location = 'Location is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataContext || !formValues.date) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const shiftRepository = new DutyShiftRepository(
        dataContext.api,
        dataContext.cache,
        dataContext.sync,
        dataContext.storage
      );
      
      if (mode === 'edit' && id) {
        // Update existing shift
        const updateData: UpdateDutyShiftDto = {
          date: format(formValues.date, 'yyyy-MM-dd'),
          startTime: formValues.startTime,
          endTime: formValues.endTime,
          type: formValues.type,
          location: formValues.location,
          notes: formValues.notes || undefined,
          // Include isDefault only if it's allowed in the UpdateDutyShiftDto
          ...(formValues.isDefault !== undefined && { isDefault: formValues.isDefault })
        };
        
        await shiftRepository.updateShift(id, updateData);
        setSuccessMessage('Shift updated successfully');
      } else {
        // Check if rosterId is available for creating a shift
        if (!rosterId && !formValues.isDefault) {
          setError('A roster ID is required for non-default shifts');
          setSaving(false);
          return;
        }
        
        // Create new shift
        // For default shift templates, rosterId is optional
        if (formValues.isDefault) {
          const createData = {
            date: format(formValues.date, 'yyyy-MM-dd'),
            startTime: formValues.startTime,
            endTime: formValues.endTime,
            type: formValues.type,
            location: formValues.location,
            notes: formValues.notes || undefined,
            isDefault: true,
            ...(rosterId && { rosterId }) // Optional rosterId for default shifts
          };
          
          await shiftRepository.createShift(createData as CreateDutyShiftDto);
        } else {
          // Regular shift requires rosterId
          const createData: CreateDutyShiftDto = {
            rosterId: rosterId!,
            date: format(formValues.date, 'yyyy-MM-dd'),
            startTime: formValues.startTime,
            endTime: formValues.endTime,
            type: formValues.type,
            location: formValues.location,
            notes: formValues.notes || undefined,
            ...(formValues.isDefault !== undefined && { isDefault: formValues.isDefault })
          };
          
          await shiftRepository.createShift(createData);
        }
        
        setSuccessMessage('Shift created successfully');
      }
      
      setSaving(false);
      
      // Navigate back after a short delay
      setTimeout(() => {
        if (rosterId) {
          navigate(`/duty-roster/rosters/${rosterId}`);
        } else {
          navigate('/duty-roster/shifts');
        }
      }, 1500);
    } catch (err) {
      console.error('Error saving shift:', err);
      setError(`Failed to save shift: ${err instanceof Error ? err.message : String(err)}`);
      setSaving(false);
    }
  };
  
  if (!dataContext) {
    return (
      <PageContainer>
        <Typography>Data context not available</Typography>
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
        {rosterId ? (
          <>
            <Link component={RouterLink} to="/duty-roster/rosters" color="inherit" underline="hover">
              Rosters
            </Link>
            <Link component={RouterLink} to={`/duty-roster/rosters/${rosterId}`} color="inherit" underline="hover">
              Roster Details
            </Link>
          </>
        ) : (
          <Link component={RouterLink} to="/duty-roster/shifts" color="inherit" underline="hover">
            Shifts
          </Link>
        )}
        <Typography color="text.primary">
          {mode === 'create' ? 'Create New Shift' : 'Edit Shift'}
        </Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              if (rosterId) {
                navigate(`/duty-roster/rosters/${rosterId}`);
              } else {
                navigate('/duty-roster/shifts');
              }
            }}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="500">
            {mode === 'create' ? 'Create New Shift' : 'Edit Shift'}
          </Typography>
        </Box>
      </Box>

      {/* Form Card */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardHeader 
          title="Shift Information" 
          subheader={roster ? `For Roster: ${roster.name}` : "Standalone Shift Template"}
        />
        <Divider />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {successMessage}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Shift Name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Morning Patrol, Traffic Control"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Shift Date *"
                      value={formValues.date}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.date,
                          helperText: formErrors.date,
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
                  <FormControl fullWidth error={!!formErrors.type}>
                    <InputLabel id="shift-type-label">Shift Type *</InputLabel>
                    <Select
                      labelId="shift-type-label"
                      name="type"
                      value={formValues.type}
                      onChange={handleSelectChange}
                      label="Shift Type *"
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {shiftTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                    {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Start Time *"
                    name="startTime"
                    type="time"
                    value={formValues.startTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 min steps
                    error={!!formErrors.startTime}
                    helperText={formErrors.startTime}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="End Time *"
                    name="endTime"
                    type="time"
                    value={formValues.endTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 min steps
                    error={!!formErrors.endTime}
                    helperText={formErrors.endTime}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Location *"
                    name="location"
                    value={formValues.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Street, North District"
                    error={!!formErrors.location}
                    helperText={formErrors.location}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formValues.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="Additional information about this shift"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.isDefault}
                        onChange={handleCheckboxChange}
                        name="isDefault"
                      />
                    }
                    label="Default shift template (can be reused for multiple rosters)"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    if (rosterId) {
                      navigate(`/duty-roster/rosters/${rosterId}`);
                    } else {
                      navigate('/duty-roster/shifts');
                    }
                  }}
                  disabled={saving}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit" 
                  variant="contained"
                  color="primary"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (mode === 'create' ? 'Create Shift' : 'Update Shift')}
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ShiftForm;