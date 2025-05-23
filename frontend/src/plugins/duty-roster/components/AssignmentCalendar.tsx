import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Grid, Select, MenuItem, FormControl, 
  InputLabel, Button, Divider, Card, CardContent, 
  CardHeader, Chip, useTheme, alpha, IconButton, 
  Tooltip, Link, Breadcrumbs, Avatar, Paper, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, addMonths, subMonths } from 'date-fns';
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
  Today as TodayIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewMonthIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

interface DateAssignmentsMap {
  [dateString: string]: DutyAssignment[];
}

type ViewMode = 'day' | 'week' | 'month';

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
  const [, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalDates: 0,
    assignedOfficers: 0
  });
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

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

      // Use the specialized getByRosterId method
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

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(today);
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCalendarMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Get formatted date for assignments, with error handling
  const getFormattedSelectedDate = () => {
    try {
      return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    } catch (err) {
      console.error('Error formatting selectedDate:', err);
      return '';
    }
  };

  const selectedDateAssignments = dateAssignmentsMap[getFormattedSelectedDate()] || [];
  
  // Get the selected roster name
  const selectedRoster = rosters.find(r => r.id === selectedRosterId);

  // Function to navigate to create assignment
  const handleAddAssignment = () => {
    if (!selectedRosterId) return;
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/duty-roster/assignments/create?rosterId=${selectedRosterId}&date=${formattedDate}`);
  };

  // Get initials for officer avatar
  const getOfficerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Get avatar color based on officer name
  const getAvatarColor = (officerId: string) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main
    ];
    
    // Simple hash function to get consistent color for the same officer
    const hash = officerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Format date for display with error handling

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
            onClick={handleAddAssignment}
            disabled={!selectedRosterId}
          >
            Add Assignment
          </Button>
        </Box>
      </Box>
      
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  aria-label="view mode"
                  size="small"
                >
                  <ToggleButton value="day" aria-label="day view">
                    <ViewDayIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="week" aria-label="week view">
                    <ViewWeekIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="month" aria-label="month view">
                    <ViewMonthIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
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
              subheader={selectedRoster ? `${selectedRoster.name} - ${format(calendarMonth, 'MMMM yyyy')}` : "Select a roster"}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<TodayIcon />}
                    onClick={handleTodayClick}
                    sx={{ mr: 1 }}
                  >
                    Today
                  </Button>
                  <IconButton size="small" onClick={handlePrevMonth}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleNextMonth}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar 
                  key={`calendar-${selectedRosterId || 'default'}`}
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
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardHeader 
              title={(() => {
                try {
                  return `Assignments for ${format(selectedDate, 'MMMM d, yyyy')}`;
                } catch (err) {
                  console.error('Error formatting date in title:', err);
                  return 'Assignments for selected date';
                }
              })()}
              subheader={`${selectedDateAssignments.length} assignments`}
              action={
                <Tooltip title="Add Assignment">
                  <IconButton 
                    disabled={!selectedRosterId}
                    onClick={handleAddAssignment}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
              {selectedDateAssignments.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <CalendarIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: alpha(theme.palette.text.secondary, 0.2),
                      mb: 2
                    }} 
                  />
                  <Typography color="text.secondary" gutterBottom>
                    No assignments for this date
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    disabled={!selectedRosterId}
                    onClick={handleAddAssignment}
                    sx={{ mt: 2 }}
                  >
                    Add Assignment
                  </Button>
                </Box>
              ) : (
                selectedDateAssignments.map(assignment => (
                  <Card
                    key={assignment.id}
                    component={Paper}
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 4px 8px rgba(0,0,0,0.1)`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        {assignment.officer ? (
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(assignment.officer.id),
                              width: 40,
                              height: 40,
                              mr: 2,
                              fontSize: '1rem'
                            }}
                          >
                            {getOfficerInitials(assignment.officer.firstName, assignment.officer.lastName)}
                          </Avatar>
                        ) : (
                          <Avatar sx={{ mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle1" fontWeight="500" sx={{ lineHeight: 1.2 }}>
                            {assignment.officer ? 
                              `${assignment.officer.firstName} ${assignment.officer.lastName}` : 
                              'Unknown Officer'}
                          </Typography>
                          {assignment.officer?.rank && (
                            <Typography variant="caption" color="text.secondary">
                              {assignment.officer.rank.name}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                          <Chip
                            label={assignment.assignmentType}
                            size="small"
                            color={assignment.assignmentType === 'REGULAR' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                              {assignment.shift ? 
                                `${assignment.shift.startTime.substring(0, 5)} - ${assignment.shift.endTime.substring(0, 5)}` : 
                                'No time specified'}
                            </Typography>
                            {assignment.shift?.name && (
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({assignment.shift.name})
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {assignment.notes && (
                        <Box sx={{ mt: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), p: 1, borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {assignment.notes}
                          </Typography>
                        </Box>
                      )}
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