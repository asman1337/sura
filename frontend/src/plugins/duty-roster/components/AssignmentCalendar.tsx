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
  ChevronRight as ChevronRightIcon,
  Print as PrintIcon
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

  // Handle printing of duty chart
  const handlePrintDutyChart = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to print the duty chart');
      return;
    }
    
    // Get the formatted date
    let formattedDate = '';
    try {
      formattedDate = format(selectedDate, 'MMMM d, yyyy');
    } catch (err) {
      formattedDate = 'Selected date';
    }
    
    // Get roster info
    const rosterName = selectedRoster?.name || 'Duty Roster';
    const unitName = selectedRoster?.unit?.name || '';

    // Generate the HTML content for the print window
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Duty Chart - ${formattedDate}</title>
        <style>
          :root {
            --primary-color: #1976d2;
            --secondary-color: #c2185b;
            --light-gray: #f5f5f5;
            --border-color: #e0e0e0;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Roboto, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            color: #333;
            line-height: 1.5;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .document {
            border: 1px solid var(--border-color);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
            background-color: white;
          }
          
          .header {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
            color: white;
            padding: 25px;
            text-align: center;
            position: relative;
          }
          
          .header-decoration {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 10px;
            background: repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.1),
              rgba(255,255,255,0.1) 10px,
              transparent 10px,
              transparent 20px
            );
          }
          
          .title {
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          
          .subtitle {
            font-size: 18px;
            margin: 5px 0 0;
            opacity: 0.9;
            font-weight: 500;
          }
          
          .details-row {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 15px;
            gap: 20px;
          }
          
          .detail-item {
            padding: 5px 15px;
            border-radius: 20px;
            background-color: rgba(255,255,255,0.2);
            font-size: 14px;
            font-weight: 500;
          }
          
          .body-container {
            padding: 20px;
          }
          
          .info-section {
            background-color: var(--light-gray);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .info-item {
            background-color: white;
            border-radius: 6px;
            padding: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .info-title {
            font-size: 12px;
            color: #666;
            margin: 0 0 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-size: 16px;
            font-weight: 500;
            margin: 0;
            color: #333;
          }
          
          .assignments-container {
            margin-top: 20px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--primary-color);
            color: var(--primary-color);
          }
          
          .assignments {
            width: 100%;
            border-collapse: collapse;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 5px rgba(0,0,0,0.1);
            border: 1px solid var(--border-color);
          }
          
          .assignments th {
            background-color: var(--light-gray);
            color: #555;
            font-weight: 600;
            padding: 12px 15px;
            text-align: left;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .assignments td {
            padding: 12px 15px;
            border-top: 1px solid var(--border-color);
            font-size: 14px;
          }
          
          .assignments tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .assignments tr:hover {
            background-color: #f0f7ff;
          }
          
          .shift-type {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          
          .regular {
            background-color: #e3f2fd;
            color: var(--primary-color);
          }
          
          .special {
            background-color: #fce4ec;
            color: var(--secondary-color);
          }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 5px;
            margin-bottom: 5px;
          }
          
          .notes {
            font-style: italic;
            color: #666;
          }
          
          .no-data {
            text-align: center;
            padding: 40px;
            font-style: italic;
            color: #777;
            background-color: var(--light-gray);
            border-radius: 6px;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            color: #777;
            font-size: 12px;
          }
          
          .button-container {
            margin-top: 30px;
            display: flex;
            justify-content: center;
            gap: 15px;
          }
          
          .button {
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .print-button {
            background-color: var(--primary-color);
            color: white;
            box-shadow: 0 2px 5px rgba(25, 118, 210, 0.3);
          }
          
          .print-button:hover {
            background-color: #1565c0;
            box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
          }
          
          .close-button {
            background-color: #f5f5f5;
            color: #333;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          
          .close-button:hover {
            background-color: #e0e0e0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            
            .container {
              padding: 0;
              max-width: none;
            }
            
            .document {
              border: none;
              box-shadow: none;
              border-radius: 0;
            }
            
            .header {
              background: white !important;
              color: #333;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-decoration,
            .button-container,
            .no-print {
              display: none !important;
            }
            
            .footer {
              margin-top: 20px;
            }
            
            .assignments {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="document">
            <div class="header">
              <div class="header-decoration"></div>
              <h1 class="title">Daily Duty Chart</h1>
              <h2 class="subtitle">${rosterName}</h2>
              <div class="details-row">
                <div class="detail-item">${formattedDate}</div>
                ${unitName ? `<div class="detail-item">${unitName}</div>` : ''}
              </div>
            </div>
            
            <div class="body-container">
              <div class="info-section">
                <div class="info-grid">
                  <div class="info-item">
                    <h4 class="info-title">Total Assignments</h4>
                    <p class="info-value">${selectedDateAssignments.length}</p>
                  </div>
                  <div class="info-item">
                    <h4 class="info-title">Roster Period</h4>
                    <p class="info-value">${selectedRoster ? `${format(new Date(selectedRoster.startDate), 'MMM dd')} - ${format(new Date(selectedRoster.endDate), 'MMM dd, yyyy')}` : 'N/A'}</p>
                  </div>
                  <div class="info-item">
                    <h4 class="info-title">Generated On</h4>
                    <p class="info-value">${format(new Date(), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                </div>
              </div>
              
              <div class="assignments-container">
                <h3 class="section-title">Assignments for ${formattedDate}</h3>
                
                ${selectedDateAssignments.length > 0 ? `
                  <table class="assignments">
                    <thead>
                      <tr>
                        <th>Officer</th>
                        <th>Rank</th>
                        <th>Shift Time</th>
                        <th>Assignment Type</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${selectedDateAssignments.map(assignment => `
                        <tr>
                          <td>${assignment.officer ? `${assignment.officer.firstName} ${assignment.officer.lastName}` : 'Unknown Officer'}</td>
                          <td>${assignment.officer?.rank ? assignment.officer.rank.name : ''}</td>
                          <td>${assignment.shift ? `${assignment.shift.startTime.substring(0, 5)} - ${assignment.shift.endTime.substring(0, 5)}` : 'No time specified'} ${assignment.shift?.name ? `<div class="badge">${assignment.shift.name}</div>` : ''}</td>
                          <td><div class="shift-type ${assignment.assignmentType.toLowerCase()}">${assignment.assignmentType}</div></td>
                          <td class="notes">${assignment.notes || ''}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : `
                  <div class="no-data">No assignments found for this date</div>
                `}
              </div>
            </div>
            
            <div class="footer">
              <div>Generated from Duty Roster Management System</div>
              <div>Page 1 of 1</div>
            </div>
          </div>
          
          <div class="button-container no-print">
            <button class="button close-button" onclick="window.close();">Close</button>
            <button class="button print-button" onclick="window.print();">Print Chart</button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give the browser a moment to load the content before showing print dialog
    printWindow.onload = function() {
      // Uncomment below to automatically trigger the print dialog
      // printWindow.print();
    };
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
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintDutyChart}
            disabled={!selectedRosterId || selectedDateAssignments.length === 0}
            sx={{ mr: 2 }}
          >
            Print Chart
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
                <Box>
                  <Tooltip title="Print Duty Chart">
                    <IconButton 
                      onClick={handlePrintDutyChart}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add Assignment">
                    <IconButton 
                      disabled={!selectedRosterId}
                      onClick={handleAddAssignment}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
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