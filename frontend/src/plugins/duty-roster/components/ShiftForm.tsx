import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Breadcrumbs,
  Link,
  useTheme,
  InputAdornment
} from '@mui/material';
import { useData } from '../../../core/data/data-context';
import { DutyShiftRepository } from '../repositories/duty-shift-repository';
import { PageContainer } from './common';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

type ShiftFormMode = 'create' | 'edit';

// DTOs that match backend requirements
interface CreateShiftDto {
  name: string;
  startTime: string;
  endTime: string;
  isDefault?: boolean;
}

interface UpdateShiftDto {
  name?: string;
  startTime?: string;
  endTime?: string;
  isDefault?: boolean;
}

// Simplified form values to match DTO requirements
interface FormValues {
  name: string;
  startTime: string;
  endTime: string;
  isDefault: boolean;
}

interface FormErrors {
  name?: string;
  startTime?: string;
  endTime?: string;
}

const ShiftForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dataContext = useData();
  const theme = useTheme();
  
  const [mode] = useState<ShiftFormMode>(id ? 'edit' : 'create');
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Simplified form values
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    startTime: '08:00',
    endTime: '16:00',
    isDefault: false
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Fetch data when component loads
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !dataContext) return;
      
      try {
        setLoading(true);
        
        const shiftRepository = new DutyShiftRepository(
          dataContext.api,
          dataContext.cache,
          dataContext.sync,
          dataContext.storage
        );
        
        // If editing existing shift, fetch shift data
        const fetchedShift = await shiftRepository.getById(id);
        
        if (fetchedShift) {
          setFormValues({
            name: fetchedShift.name || '',
            startTime: fetchedShift.startTime,
            endTime: fetchedShift.endTime,
            isDefault: fetchedShift.isDefault || false
          });
        } else {
          setError('Shift not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dataContext, id]);
  
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
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validate name field
    if (!formValues.name || formValues.name.trim() === '') {
      errors.name = 'Shift name is required';
    }
    
    // Validate start time
    if (!formValues.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    // Validate end time
    if (!formValues.endTime) {
      errors.endTime = 'End time is required';
    }
    
    // Validate time logic
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataContext) {
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
        // Update existing shift with exactly what backend expects
        const updateData: UpdateShiftDto = {
          name: formValues.name,
          startTime: formValues.startTime,
          endTime: formValues.endTime,
          isDefault: formValues.isDefault
        };
        
        await shiftRepository.updateShift(id, updateData);
        setSuccessMessage('Shift updated successfully');
      } else {
        // Create new shift with exactly what backend expects
        const createData: CreateShiftDto = {
          name: formValues.name,
          startTime: formValues.startTime,
          endTime: formValues.endTime,
          isDefault: formValues.isDefault
        };
        
        // Use the specialized method that accepts our DTO directly
        await shiftRepository.createShift(createData);
        setSuccessMessage('Shift created successfully');
      }
      
      setSaving(false);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/duty-roster/shifts');
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
        <Link component={RouterLink} to="/duty-roster/shifts" color="inherit" underline="hover">
          Shifts
        </Link>
        <Typography color="text.primary">
          {mode === 'create' ? 'Create New Shift' : 'Edit Shift'}
        </Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/duty-roster/shifts')}
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
          subheader="Define shift parameters"
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
                    required
                    label="Shift Name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Morning Shift, Evening Shift"
                    error={!!formErrors.name}
                    helperText={formErrors.name}
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
                  <TextField
                    fullWidth
                    label="Start Time"
                    name="startTime"
                    type="time"
                    value={formValues.startTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 min steps
                    error={!!formErrors.startTime}
                    helperText={formErrors.startTime}
                    required
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
                    label="End Time"
                    name="endTime"
                    type="time"
                    value={formValues.endTime}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 min steps
                    error={!!formErrors.endTime}
                    helperText={formErrors.endTime}
                    required
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
                  onClick={() => navigate('/duty-roster/shifts')}
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