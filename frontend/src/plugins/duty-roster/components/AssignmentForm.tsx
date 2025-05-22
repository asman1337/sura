import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, MenuItem, 
  Grid, FormControl, InputLabel, Select, CircularProgress,
  FormHelperText, Divider, Alert, Card, CardHeader, CardContent,
  Breadcrumbs, Link, useTheme, IconButton, InputAdornment, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import { useData } from '../../../core/data/data-context';
import { DutyAssignmentRepository } from '../repositories/duty-assignment-repository';
import { DutyShiftRepository } from '../repositories/duty-shift-repository';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';
import { PageContainer } from './common';
import {
  DutyAssignmentType,
  DutyShift,
  DutyRoster
} from '../types';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface Officer {
  id: string;
  name: string;
  rank?: string;
  badgeNumber?: string;
}

interface FormErrors {
  officerId?: string;
  shiftId?: string;
  date?: string;
  assignmentType?: string;
  notes?: string;
  dutyRosterId?: string;
}

// Extended DTO with all fields for the form
interface AssignmentFormData {
  dutyRosterId: string;
  officerId: string;
  date: string;
  shiftId: string;
  assignmentType: DutyAssignmentType;
  notes?: string;
}

const AssignmentForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryRosterId = queryParams.get('rosterId');
  const queryDate = queryParams.get('date');
  const theme = useTheme();
  
  const isEditing = Boolean(id);
  const dataContext = useData();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setShifts] = useState<DutyShift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<DutyShift[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [roster, setRoster] = useState<DutyRoster | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state with all required fields
  const [formData, setFormData] = useState<AssignmentFormData>({
    officerId: '',
    shiftId: '',
    date: queryDate || format(new Date(), 'yyyy-MM-dd'),
    assignmentType: DutyAssignmentType.REGULAR,
    notes: '',
    dutyRosterId: queryRosterId || ''
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!dataContext) return;
      
      try {
        setLoading(true);
        const assignmentRepository = new DutyAssignmentRepository(
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

        const rosterRepository = new DutyRosterRepository(
          dataContext.api,
          dataContext.cache,
          dataContext.sync,
          dataContext.storage
        );
        
        // Load shifts
        const shiftsData = await shiftRepository.getAll();
        setShifts(shiftsData);
        
        // Mock officers data (in a real app, we'd fetch from an officer repository)
        setOfficers([
          { id: '1', name: 'John Doe', rank: 'Inspector', badgeNumber: 'B001' },
          { id: '2', name: 'Jane Smith', rank: 'Constable', badgeNumber: 'B002' },
          { id: '3', name: 'Robert Johnson', rank: 'Sub-Inspector', badgeNumber: 'B003' },
          { id: '4', name: 'Emily Wilson', rank: 'ASI', badgeNumber: 'B004' },
          { id: '5', name: 'Michael Brown', rank: 'Head Constable', badgeNumber: 'B005' }
        ]);

        // If rosterId is provided, load the roster
        if (queryRosterId) {
          const rosterData = await rosterRepository.getById(queryRosterId);
          setRoster(rosterData);
          setFormData(prev => ({ ...prev, dutyRosterId: queryRosterId }));
          
          // Filter shifts for this roster
          const rosterShifts = shiftsData.filter(
            shift => shift.rosterId === queryRosterId || shift.isDefault
          );
          setFilteredShifts(rosterShifts);
        } else {
          setFilteredShifts(shiftsData);
        }
        
        // If editing, load the assignment data
        if (isEditing && id) {
          const assignment = await assignmentRepository.getById(id);
          
          if (assignment) {
            setFormData({
              officerId: assignment.officerId,
              shiftId: assignment.shiftId,
              date: assignment.date,
              assignmentType: assignment.assignmentType,
              notes: assignment.notes || '',
              dutyRosterId: assignment.dutyRosterId
            });
            
            if (assignment.dutyRosterId && !queryRosterId) {
              const rosterData = await rosterRepository.getById(assignment.dutyRosterId);
              setRoster(rosterData);
              
              // Filter shifts for this roster
              const rosterShifts = shiftsData.filter(
                shift => shift.rosterId === assignment.dutyRosterId || shift.isDefault
              );
              setFilteredShifts(rosterShifts);
            }
          } else {
            setError('Assignment not found');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [dataContext, id, queryRosterId, queryDate, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.officerId) {
      newErrors.officerId = 'Officer is required';
    }
    
    if (!formData.shiftId) {
      newErrors.shiftId = 'Shift is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.assignmentType) {
      newErrors.assignmentType = 'Assignment type is required';
    }
    
    if (!formData.dutyRosterId) {
      newErrors.dutyRosterId = 'Duty roster is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataContext) return;
    
    if (validateForm()) {
      try {
        setSaving(true);
        setError(null);
        
        const assignmentRepository = new DutyAssignmentRepository(
          dataContext.api,
          dataContext.cache,
          dataContext.sync,
          dataContext.storage
        );
        
        if (isEditing && id) {
          // For update, we only need to send the updatable fields
          await assignmentRepository.update(id, {
            officerId: formData.officerId,
            shiftId: formData.shiftId,
            date: formData.date,
            assignmentType: formData.assignmentType,
            notes: formData.notes || undefined,
            dutyRosterId: formData.dutyRosterId
          });
          
          setSuccess('Assignment updated successfully');
        } else {
          // For create, we need all required fields
          await assignmentRepository.create({
            officerId: formData.officerId,
            shiftId: formData.shiftId,
            date: formData.date,
            assignmentType: formData.assignmentType,
            notes: formData.notes || undefined,
            dutyRosterId: formData.dutyRosterId,
            assignedAt: new Date().toISOString()
          });
          
          setSuccess('Assignment created successfully');
        }
        
        // Automatically navigate back after a short delay
        setTimeout(() => {
          navigate('/duty-roster/calendar');
        }, 1500);
        
        setSaving(false);
      } catch (err) {
        console.error('Error saving assignment:', err);
        setError('Failed to save assignment');
        setSaving(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the specific error when the field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the specific error when the field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData(prev => ({
        ...prev,
        date: formattedDate
      }));
      
      // Clear date error if it exists
      if (errors.date) {
        setErrors(prev => ({
          ...prev,
          date: undefined
        }));
      }
    }
  };

  if (!dataContext) {
    return <Typography>Data context not available</Typography>;
  }

  return (
    <PageContainer>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/duty-roster" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/duty-roster/calendar" color="inherit" underline="hover">
          Assignment Calendar
        </Link>
        <Typography color="text.primary">
          {isEditing ? 'Edit Assignment' : 'Create Assignment'}
        </Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            sx={{ mr: 2 }}
            onClick={() => navigate('/duty-roster/calendar')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="500">
            {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
            {roster && (
              <Chip 
                label={roster.name}
                color="primary"
                size="small"
                sx={{ ml: 2, fontWeight: 500 }}
              />
            )}
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
          title="Assignment Details" 
          subheader={
            formData.date ? `For date: ${format(new Date(formData.date), 'MMMM d, yyyy')}` : 
                           "Select assignment date"
          }
        />
        <Divider />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                {/* Date selection */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Assignment Date *"
                      value={formData.date ? new Date(formData.date) : null}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.date,
                          helperText: errors.date,
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
                
                {/* Assignment type */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={!!errors.assignmentType} required>
                    <InputLabel id="assignment-type-label">Assignment Type</InputLabel>
                    <Select
                      labelId="assignment-type-label"
                      name="assignmentType"
                      value={formData.assignmentType}
                      onChange={handleSelectChange}
                      label="Assignment Type"
                      startAdornment={
                        <InputAdornment position="start">
                          <AssignmentIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value={DutyAssignmentType.REGULAR}>Regular</MenuItem>
                      <MenuItem value={DutyAssignmentType.SPECIAL}>Special</MenuItem>
                    </Select>
                    {errors.assignmentType && <FormHelperText>{errors.assignmentType}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                {/* Officer selection */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={!!errors.officerId} required>
                    <InputLabel id="officer-label">Officer</InputLabel>
                    <Select
                      labelId="officer-label"
                      name="officerId"
                      value={formData.officerId}
                      onChange={handleSelectChange}
                      label="Officer"
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {officers.map(officer => (
                        <MenuItem key={officer.id} value={officer.id}>
                          {officer.name} ({officer.rank})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.officerId && <FormHelperText>{errors.officerId}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                {/* Shift selection */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={!!errors.shiftId} required>
                    <InputLabel id="shift-label">Shift</InputLabel>
                    <Select
                      labelId="shift-label"
                      name="shiftId"
                      value={formData.shiftId}
                      onChange={handleSelectChange}
                      label="Shift"
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {filteredShifts.map(shift => (
                        <MenuItem key={shift.id} value={shift.id}>
                          {shift.name || `${shift.startTime}-${shift.endTime}`} ({shift.type})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.shiftId && <FormHelperText>{errors.shiftId}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                {/* Notes */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Additional information about this assignment"
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
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/duty-roster/calendar')}
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
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Saving...' : (isEditing ? 'Update Assignment' : 'Create Assignment')}
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default AssignmentForm; 