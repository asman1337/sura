import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Grid, Select, MenuItem, FormControl, 
  InputLabel, Button, Divider, Card, CardContent, 
  CardHeader, Chip, useTheme, alpha, IconButton, 
  Tooltip, Link, Breadcrumbs
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useData } from '../../../core/data/data-context';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';
import { DutyAssignmentRepository } from '../repositories/duty-assignment-repository';
import { DutyRoster, DutyAssignment } from '../types';
import { PageContainer } from './common';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

interface DateAssignmentsMap {
  [dateString: string]: DutyAssignment[];
}

const AssignmentCalendar: React.FC = () => {
  const dataContext = useData();
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRosterId, setSelectedRosterId] = useState<string>('');
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [, setAssignments] = useState<DutyAssignment[]>([]);
  const [dateAssignmentsMap, setDateAssignmentsMap] = useState<DateAssignmentsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalDates: 0,
    assignedOfficers: 0
  });

  // Define fetchAssignments function before it's used
  const fetchAssignments = async () => {
    if (!dataContext || !selectedRosterId) return;
    
    try {
      setLoading(true);
      const assignmentRepository = new DutyAssignmentRepository(
        dataContext.api, 
        dataContext.cache, 
        dataContext.sync, 
        dataContext.storage
      );

      const rosterAssignments = await assignmentRepository.getByRosterId(selectedRosterId);
      setAssignments(rosterAssignments);
      
      // Group assignments by date for easier rendering on calendar
      const assignmentsByDate: DateAssignmentsMap = {};
      rosterAssignments.forEach(assignment => {
        const dateKey = assignment.date;
        if (!assignmentsByDate[dateKey]) {
          assignmentsByDate[dateKey] = [];
        }
        assignmentsByDate[dateKey].push(assignment);
      });
      
      // Calculate statistics
      const uniqueOfficers = new Set(rosterAssignments.map(a => a.officerId)).size;
      const uniqueDates = Object.keys(assignmentsByDate).length;
      
      setStats({
        totalAssignments: rosterAssignments.length,
        totalDates: uniqueDates,
        assignedOfficers: uniqueOfficers
      });
      
      setDateAssignmentsMap(assignmentsByDate);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
      setLoading(false);
    }
  };

  // Fetch all active rosters
  useEffect(() => {
    fetchRosters();
  }, [dataContext]);

  const fetchRosters = async () => {
    if (!dataContext) return;
    
    try {
      setLoading(true);
      const rosterRepository = new DutyRosterRepository(
        dataContext.api, 
        dataContext.cache, 
        dataContext.sync, 
        dataContext.storage
      );

      const allRosters = await rosterRepository.getAll();
      setRosters(allRosters);
      
      // Auto-select the first roster if one exists
      if (allRosters.length > 0 && !selectedRosterId) {
        setSelectedRosterId(allRosters[0].id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rosters:', err);
      setError('Failed to load rosters');
      setLoading(false);
    }
  };

  // Fetch assignments when roster selection changes
  useEffect(() => {
    if (selectedRosterId) {
      fetchAssignments();
    }
  }, [selectedRosterId, dataContext]);

  const handleRosterChange = (event: any) => {
    setSelectedRosterId(event.target.value as string);
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };
  
  const handleRefresh = () => {
    if (selectedRosterId) {
      fetchAssignments();
    } else {
      fetchRosters();
    }
  };

  const selectedDateAssignments = dateAssignmentsMap[format(selectedDate, 'yyyy-MM-dd')] || [];
  
  // Get the selected roster name
  const selectedRoster = rosters.find(r => r.id === selectedRosterId);

  // Function to navigate to create assignment
  const handleAddAssignment = () => {
    if (!selectedRosterId) return;
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/duty-roster/assignments/create?rosterId=${selectedRosterId}&date=${formattedDate}`);
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
        <Typography color="text.primary">Assignment Calendar</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Duty Assignment Calendar
          {selectedRoster && (
            <Chip 
              label={selectedRoster.name}
              color="primary"
              size="small"
              sx={{ ml: 2, fontWeight: 500 }}
            />
          )}
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!selectedRosterId}
            onClick={handleAddAssignment}
          >
            Add Assignment
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Box>
      )}
      
      {/* Overlay for loading state */}
      {loading && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Roster selection card */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="roster-select-label">Select Roster</InputLabel>
                <Select
                  labelId="roster-select-label"
                  value={selectedRosterId}
                  label="Select Roster"
                  onChange={handleRosterChange}
                  startAdornment={
                    <Box sx={{ mr: 1, color: 'text.secondary' }}>
                      <EventIcon fontSize="small" />
                    </Box>
                  }
                >
                  {rosters.map(roster => (
                    <MenuItem key={roster.id} value={roster.id}>
                      {roster.name} ({format(new Date(roster.startDate), 'MMM dd, yyyy')} to {format(new Date(roster.endDate), 'MMM dd, yyyy')})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AssignmentIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.totalAssignments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assignments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.totalDates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days Scheduled
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.assignedOfficers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Officers Assigned
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendar and assignments */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title="Duty Calendar" 
              subheader={selectedRoster ? `${selectedRoster.name}` : "Select a roster"}
            />
            <Divider />
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar 
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 5 }}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title={`Assignments for ${format(selectedDate, 'MMMM d, yyyy')}`}
              subheader={`${selectedDateAssignments.length} assignments`}
              action={
                <Tooltip title="Add Assignment">
                  <IconButton 
                    disabled={!selectedRosterId}
                    onClick={handleAddAssignment}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
              {selectedDateAssignments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No assignments for this date
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    disabled={!selectedRosterId}
                    onClick={handleAddAssignment}
                    sx={{ mt: 1 }}
                  >
                    Add Assignment
                  </Button>
                </Box>
              ) : (
                selectedDateAssignments.map(assignment => (
                  <Card
                    key={assignment.id}
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                      }
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="subtitle1" fontWeight="500">
                              {(assignment.officer as any)?.name || 'Unknown Officer'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {(assignment.shift as any)?.startTime} - {(assignment.shift as any)?.endTime}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CategoryIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Chip
                              label={assignment.assignmentType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AssignmentCalendar; 