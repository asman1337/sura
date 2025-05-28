import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card,
  Grid,
  Chip,
  alpha,
  Button,
  Divider,
  useTheme,
  Typography, 
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  Assignment as AssignmentIcon,
  Print as PrintIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { PageContainer } from './common';
import { DutyAssignment } from '../types';
import { useData } from '../../../core/data';
import { OfficerRepository } from '../repositories';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { DutyAssignmentRepository } from '../repositories/duty-assignment-repository';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';

/**
 * Officer Group View Component
 * Shows all officers in the unit with monthly calendar view and basic filters
 */
const OfficerGroupView: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { api, cache, sync, storage, auth } = useData();
  
  // State
  const [officers, setOfficers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [filterShiftType, setFilterShiftType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState({
    totalOfficers: 0,
    totalAssignments: 0,
    averageAssignments: 0,
    coverageRate: 0
  });
  
  // Get month boundaries
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    loadData();
  }, [api, cache, sync, storage, selectedMonth, filterShiftType]);

  const loadData = async () => {
    if (!api) return;

    try {
      setLoading(true);
      setError(null);

      // Initialize repositories
      const assignmentRepository = new DutyAssignmentRepository(api, cache, sync, storage);
      const officerRepository = new OfficerRepository(api, cache, sync, storage);

      // Load officers and assignments in parallel
      const [allOfficers, allAssignments] = await Promise.all([
        officerRepository.getByUnitId(auth.getCurrentUser()?.primaryUnit?.id || ''),
        assignmentRepository.getByUnit() // This will get assignments filtered by user's unit
      ]);

      // Filter assignments for selected month
      const monthAssignments = allAssignments.filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate >= monthStart && assignmentDate <= monthEnd;
      });

      // Calculate statistics
      const totalOfficers = allOfficers.length;
      const totalAssignments = monthAssignments.length;
      const averageAssignments = totalOfficers > 0 ? Math.round(totalAssignments / totalOfficers) : 0;
      const totalPossibleAssignments = totalOfficers * monthDays.length;
      const coverageRate = totalPossibleAssignments > 0 ? Math.round((totalAssignments / totalPossibleAssignments) * 100) : 0;

      setOfficers(allOfficers);
      setAssignments(monthAssignments);
      setStats({
        totalOfficers,
        totalAssignments,
        averageAssignments,
        coverageRate
      });

    } catch (err) {
      console.error('Error loading officer group data:', err);
      setError('Failed to load officer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get assignments for a specific officer and date
  const getOfficerAssignmentForDate = (officerId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const assignment = assignments.find(assignment => 
      assignment.officerId === officerId && 
      assignment.date === dateString
    );
    
    // Apply shift type filter if not "all"
    if (assignment && filterShiftType !== 'all') {
      const shiftName = assignment.shift?.name?.toLowerCase() || '';
      if (!shiftName.includes(filterShiftType.toLowerCase())) {
        return undefined;
      }
    }
    
    return assignment;
  };

  // Filter officers based on search query
  const filteredOfficers = officers.filter(officer => {
    const fullName = `${officer.firstName || ''} ${officer.lastName || ''}`.toLowerCase();
    const rank = officer.rank?.name?.toLowerCase() || '';
    const search = searchQuery.toLowerCase();
    
    return fullName.includes(search) || rank.includes(search);
  });

  // Handle month navigation
  const handlePreviousMonth = () => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setSelectedMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSelectedMonth(nextMonth);
  };

  const handleBack = () => {
    navigate('/duty-roster');
  };

  // Show initialization progress
  if (!api) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing API services...
        </Typography>
      </Box>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading officer duties...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="500">
            Officer Duties - {format(selectedMonth, 'MMMM yyyy')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => console.log('Export functionality')}
          >
            Export
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Box>
      )}

      {/* Filters and Controls */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardHeader 
          title="Filters & Controls"
          avatar={<FilterIcon />}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Month"
                  value={selectedMonth}
                  onChange={(newValue) => newValue && setSelectedMonth(newValue)}
                  views={['year', 'month']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Search Officers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="small"
                placeholder="Search by name or rank..."
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift Type</InputLabel>
                <Select
                  value={filterShiftType}
                  label="Shift Type"
                  onChange={(e) => setFilterShiftType(e.target.value)}
                >
                  <MenuItem value="all">All Shifts</MenuItem>
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="night">Night</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
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
                  <PersonIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.totalOfficers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Officers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
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
                  <AssignmentIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.totalAssignments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
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
                  <ScheduleIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.averageAssignments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg per Officer
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ViewModuleIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.coverageRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coverage Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Calendar Grid */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardHeader 
          title={`Officer Duties - ${format(selectedMonth, 'MMMM yyyy')}`}
          subheader={`${filteredOfficers.length} officers • ${stats.totalAssignments} assignments`}
          avatar={<CalendarIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={handlePreviousMonth}>Previous</Button>
              <Button size="small" onClick={handleNextMonth}>Next</Button>
            </Box>
          }
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          {filteredOfficers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary" gutterBottom>
                No officers found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search filters
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), minWidth: 200 }}>
                      <strong>Officer</strong>
                    </TableCell>
                    {monthDays.map(day => (
                      <TableCell 
                        key={day.toISOString()} 
                        align="center"
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          minWidth: 80,
                          borderLeft: isToday(day) ? `2px solid ${theme.palette.primary.main}` : undefined
                        }}
                      >
                        <Typography variant="caption" display="block">
                          {format(day, 'EEE')}
                        </Typography>
                        <Typography variant="body2" fontWeight={isToday(day) ? 600 : 400}>
                          {format(day, 'd')}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOfficers.map(officer => (
                    <TableRow key={officer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                            {(officer.firstName?.[0] || '') + (officer.lastName?.[0] || '')}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="500">
                              {officer.firstName} {officer.lastName}
                            </Typography>
                            {officer.rank && (
                              <Typography variant="caption" color="text.secondary">
                                {officer.rank.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {monthDays.map(day => {
                        const assignment = getOfficerAssignmentForDate(officer.id, day);
                        return (
                          <TableCell 
                            key={day.toISOString()} 
                            align="center"
                            sx={{ 
                              borderLeft: isToday(day) ? `2px solid ${theme.palette.primary.main}` : undefined,
                              bgcolor: isToday(day) ? alpha(theme.palette.primary.main, 0.02) : undefined
                            }}
                          >
                            {assignment ? (
                              <Tooltip 
                                title={`${assignment.shift?.name || 'Duty'} - ${assignment.assignmentType}`}
                                arrow
                              >
                                <Chip
                                  size="small"
                                  label={assignment.shift?.name?.substring(0, 3) || 'D'}
                                  color={assignment.assignmentType === 'REGULAR' ? 'primary' : 'secondary'}
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 20,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => navigate(`/duty-roster/officer/${officer.id}`)}
                                />
                              </Tooltip>
                            ) : (
                              <Box sx={{ height: 20 }} />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default OfficerGroupView;
