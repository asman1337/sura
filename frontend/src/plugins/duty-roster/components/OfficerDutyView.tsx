import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Grid, Tabs, Tab, Card, CardContent,
  Divider, Chip, FormControl, InputLabel,
  Select, MenuItem, Button, Avatar,
  CardHeader, useTheme, alpha, Badge,
  Breadcrumbs, Link
} from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, addDays, startOfMonth, endOfMonth, isWithinInterval, isToday } from 'date-fns';
import { useData } from '../../../core/data/data-context';
import { DutyAssignmentRepository } from '../repositories/duty-assignment-repository';
import { DutyAssignment } from '../types';
import { PageContainer } from './common';
import {
  CalendarMonth as CalendarIcon,
  List as ListIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Notes as NotesIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`officer-tabpanel-${index}`}
      aria-labelledby={`officer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const OfficerDutyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dataContext = useData();
  const theme = useTheme();
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<DutyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<string>('current-month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [officerDetails, setOfficerDetails] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    uniqueRosters: 0,
    upcomingAssignments: 0
  });

  // Fetch officer assignments
  useEffect(() => {
    fetchOfficerAssignments();
  }, [id, dataContext]);

  const fetchOfficerAssignments = async () => {
    if (!dataContext || !id) return;
    
    try {
      setLoading(true);
      const assignmentRepository = new DutyAssignmentRepository(
        dataContext.api,
        dataContext.cache,
        dataContext.sync,
        dataContext.storage
      );

      // Fetch officer details (mocked for now)
      setOfficerDetails({
        id,
        name: 'Officer ' + id,
        rank: 'Police Officer',
        badgeNumber: 'B-' + id,
        photo: null
      });

      // Fetch assignments for this officer
      const officerAssignments = await assignmentRepository.getByOfficerId(id);
      setAssignments(officerAssignments);
      
      // Calculate statistics
      const uniqueRosterIds = new Set(officerAssignments.map(a => a.dutyRosterId)).size;
      const now = new Date();
      const upcomingCount = officerAssignments.filter(a => {
        const assignmentDate = new Date(a.date);
        return assignmentDate >= now;
      }).length;
      
      setStats({
        totalAssignments: officerAssignments.length,
        uniqueRosters: uniqueRosterIds,
        upcomingAssignments: upcomingCount
      });
      
      filterAssignmentsByTimeRange(officerAssignments, timeRange);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching officer assignments:', err);
      setError('Failed to load officer assignments');
      setLoading(false);
    }
  };

  const filterAssignmentsByTimeRange = (assignmentsToFilter: DutyAssignment[], range: string) => {
    const now = new Date();
    
    let startDate: Date;
    let endDate: Date;
    
    switch(range) {
      case 'current-month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'next-month':
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        startDate = startOfMonth(nextMonth);
        endDate = endOfMonth(nextMonth);
        break;
      case 'next-7-days':
        startDate = now;
        endDate = addDays(now, 7);
        break;
      case 'next-30-days':
        startDate = now;
        endDate = addDays(now, 30);
        break;
      default:
        startDate = now;
        endDate = addDays(now, 30);
    }
    
    const filtered = assignmentsToFilter.filter(assignment => {
      const assignmentDate = new Date(assignment.date);
      return isWithinInterval(assignmentDate, { start: startDate, end: endDate });
    });
    
    setFilteredAssignments(filtered);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    const range = event.target.value;
    setTimeRange(range);
    filterAssignmentsByTimeRange(assignments, range);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleRefresh = () => {
    fetchOfficerAssignments();
  };

  const getDutyStatusColor = (type: string) => {
    switch(type) {
      case 'REGULAR':
        return 'primary';
      case 'SPECIAL':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredAssignments.filter(a => a.date === dateStr);
  };

  const todaysAssignments = getAssignmentsForDate(selectedDate);

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
        <Link component={RouterLink} to="/duty-roster/officers" color="inherit" underline="hover">
          Officers
        </Link>
        <Typography color="text.primary">Officer Details</Typography>
      </Breadcrumbs>
      
      {/* Header with actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Officer Duty Schedule
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
        </Box>
      </Box>

      {/* Loading overlay */}
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
      
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Box>
      )}
      
      {/* Officer profile card */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2rem'
                  }}
                >
                  {officerDetails?.name?.charAt(0) || 'O'}
                </Avatar>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" fontWeight="500">
                {officerDetails?.name || 'Officer Details'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <BadgeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="body1" color="text.secondary">
                  {officerDetails?.rank} • Badge #{officerDetails?.badgeNumber}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                  startAdornment={
                    <Box sx={{ mr: 1, color: 'text.secondary' }}>
                      <CalendarIcon fontSize="small" />
                    </Box>
                  }
                >
                  <MenuItem value="current-month">Current Month</MenuItem>
                  <MenuItem value="next-month">Next Month</MenuItem>
                  <MenuItem value="next-7-days">Next 7 Days</MenuItem>
                  <MenuItem value="next-30-days">Next 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics cards */}
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
                    {stats.uniqueRosters}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Rosters
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
                  <EventIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.upcomingAssignments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Duties
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tab navigation */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="officer duty views"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                py: 1
              }
            }}
          >
            <Tab 
              label="Calendar View" 
              id="officer-tab-0" 
              icon={<CalendarIcon />}
              iconPosition="start"
            />
            <Tab 
              label="List View" 
              id="officer-tab-1" 
              icon={<ListIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
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
                  subheader={`Showing assignments for ${format(new Date(), 'MMMM yyyy')}`}
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
                  subheader={`${todaysAssignments.length} assignments`}
                  avatar={
                    isToday(selectedDate) ? (
                      <Badge color="primary" variant="dot">
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <EventIcon />
                        </Avatar>
                      </Badge>
                    ) : (
                      <Avatar sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.1), color: theme.palette.text.secondary }}>
                        <EventIcon />
                      </Avatar>
                    )
                  }
                />
                <Divider />
                <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {todaysAssignments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary" gutterBottom>
                        No assignments for this date
                      </Typography>
                    </Box>
                  ) : (
                    todaysAssignments.map(assignment => (
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={assignment.assignmentType} 
                              color={getDutyStatusColor(assignment.assignmentType)} 
                              size="small" 
                            />
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <ScheduleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {(assignment.shift as any)?.startTime || '00:00'} - {(assignment.shift as any)?.endTime || '00:00'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {(assignment.shift as any)?.location || 'Not specified'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {(assignment.dutyRoster as any)?.name || 'Unknown'}
                            </Typography>
                          </Box>
                          {assignment.notes && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                              <NotesIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: theme.palette.text.secondary }} />
                              <Typography variant="body2">
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
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title="All Assignments" 
              subheader={`${filteredAssignments.length} assignments in selected time range`}
            />
            <Divider />
            <CardContent>
              {filteredAssignments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No assignments found for the selected time range
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredAssignments.map(assignment => (
                    <Grid size={{ xs: 12, md: 6 }} key={assignment.id}>
                      <Card 
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
                        <CardHeader
                          title={format(new Date(assignment.date), 'EEE, MMM d, yyyy')}
                          subheader={(assignment.shift as any)?.name || 'Unnamed Shift'}
                          action={
                            <Chip 
                              label={assignment.assignmentType} 
                              color={getDutyStatusColor(assignment.assignmentType)} 
                              size="small" 
                            />
                          }
                        />
                        <Divider />
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <ScheduleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {(assignment.shift as any)?.startTime || '00:00'} - {(assignment.shift as any)?.endTime || '00:00'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {(assignment.shift as any)?.location || 'Not specified'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {(assignment.dutyRoster as any)?.name || 'Unknown'}
                            </Typography>
                          </Box>
                          {assignment.notes && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                              <NotesIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: theme.palette.text.secondary }} />
                              <Typography variant="body2">
                                {assignment.notes}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Card>
    </PageContainer>
  );
};

export default OfficerDutyView; 