import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Card,
  Grid,
  List,
  Paper,
  alpha,
  Button,
  Divider,
  useTheme,
  ListItem,
  IconButton,
  Typography, 
  CardHeader,
  CardContent,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Today as CalendarIcon,
  DateRange as DateRangeIcon,
  NightsStay as NightsStayIcon,
  PeopleAlt as PeopleAltIcon,
  ViewList as ViewListIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { DutyRoster } from '../types';
import { PageContainer } from './common';
import { useData } from '../../../core/data';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';
import { DutyAssignmentRepository } from '../repositories/duty-assignment-repository';

/**
 * Dashboard component for the Duty Roster plugin
 * Shows statistics and quick access cards
 */
const DutyRosterDashboard: React.FC = () => {
  const theme = useTheme();
  const { api, cache, sync, storage } = useData();
  
  // State
  const [stats, setStats] = useState({
    totalRosters: 0,
    activeRosters: 0,
    totalAssignments: 0,
    staffingRate: 0
  });
  const [recentRosters, setRecentRosters] = useState<DutyRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!api) return;
      
      try {
        setLoading(true);
        
        // Initialize repositories
        const rosterRepository = new DutyRosterRepository(api, cache, sync, storage);
        const assignmentRepository = new DutyAssignmentRepository(api, cache, sync, storage);
        
        // Load data in parallel for better performance
        const [rosters, assignments] = await Promise.all([
          rosterRepository.getAll(),
          assignmentRepository.getAll()
        ]);
        
        // Calculate statistics
        const activeRosters = rosters.filter(roster => 
          roster.status === 'PUBLISHED' && 
          new Date(roster.endDate) >= new Date()
        );
        
        const totalAssignments = assignments.length;
        
        // Sort and get recent rosters
        const sortedRosters = [...rosters]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        // Update state
        setStats({
          totalRosters: rosters.length,
          activeRosters: activeRosters.length,
          totalAssignments,
          staffingRate: Math.round((totalAssignments / (activeRosters.length * 21)) * 100) // Approximate
        });
        
        setRecentRosters(sortedRosters);
        setError(null);
      } catch (err) {
        console.error('Error loading Duty Roster data:', err);
        setError('Failed to load Duty Roster data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [api, cache, sync, storage]);
  
  const handleRefresh = async () => {
    if (!api) return;
    
    await loadData();
  };
  
  const loadData = async () => {
    if (!api) return;
    
    try {
      setLoading(true);
      
      // Initialize repositories
      const rosterRepository = new DutyRosterRepository(api, cache, sync, storage);
      const assignmentRepository = new DutyAssignmentRepository(api, cache, sync, storage);
      
      // Load data in parallel for better performance
      const [rosters, assignments] = await Promise.all([
        rosterRepository.getAll(),
        assignmentRepository.getAll()
      ]);
      
      // Calculate statistics
      const activeRosters = rosters.filter(roster => 
        roster.status === 'PUBLISHED' && 
        new Date(roster.endDate) >= new Date()
      );
      
      const totalAssignments = assignments.length;
      
      // Sort and get recent rosters
      const sortedRosters = [...rosters]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      // Update state
      setStats({
        totalRosters: rosters.length,
        activeRosters: activeRosters.length,
        totalAssignments,
        staffingRate: Math.round((totalAssignments / (activeRosters.length * 21)) * 100) // Approximate
      });
      
      setRecentRosters(sortedRosters);
      setError(null);
    } catch (err) {
      console.error('Error loading Duty Roster data:', err);
      setError('Failed to load Duty Roster data. Please try again.');
    } finally {
      setLoading(false);
    }
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
  
  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Duty Roster Management
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
            component={RouterLink}
            to="/duty-roster/rosters/create"
          >
            Create New Roster
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
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            component={RouterLink}
            to="/duty-roster/rosters"
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderColor: theme.palette.primary.main,
              },
              textDecoration: 'none',
              color: 'text.primary'
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
                  <DateRangeIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.totalRosters}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rosters
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Grid>
          
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            component={RouterLink}
            to="/duty-roster/rosters"
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderColor: theme.palette.success.main,
              },
              textDecoration: 'none',
              color: 'text.primary'
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
                  <ViewListIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.activeRosters}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Rosters
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Grid>
          
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            component={RouterLink}
            to="/duty-roster/calendar"
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderColor: theme.palette.warning.main,
              },
              textDecoration: 'none',
              color: 'text.primary'
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
          
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderColor: theme.palette.info.main,
              },
              textDecoration: 'none',
              color: 'text.primary'
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
                  <PeopleAltIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.staffingRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Staffing Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main content area */}
      <Grid container spacing={3}>
        {/* Recent rosters */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title="Recent Rosters" 
              action={
                <IconButton aria-label="settings">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              <List>
                {recentRosters.length > 0 ? (
                  recentRosters.map((roster) => (
                    <React.Fragment key={roster.id}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ px: 0 }}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            component={RouterLink}
                            to={`/duty-roster/rosters/${roster.id}`}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={roster.name}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block', fontWeight: 500 }}
                              >
                                {new Date(roster.startDate).toLocaleDateString()} - {new Date(roster.endDate).toLocaleDateString()}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                Status: {roster.status}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No rosters found"
                      secondary="Create a new roster to get started"
                    />
                  </ListItem>
                )}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                  component={RouterLink}
                  to="/duty-roster/rosters"
                >
                  View All Rosters
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader title="Duty Roster Actions" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    component={RouterLink}
                    to="/duty-roster/rosters/create"
                  >
                    <Box sx={{
                      mb: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AddIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Create Roster
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    component={RouterLink}
                    to="/duty-roster/rosters"
                  >
                    <Box sx={{
                      mb: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ViewListIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      View Rosters
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    component={RouterLink}
                    to="/duty-roster/calendar"
                  >
                    <Box sx={{
                      mb: 1,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Calendar View
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    component={RouterLink}
                    to="/duty-roster/shifts"
                  >
                    <Box sx={{
                      mb: 1,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <NightsStayIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Manage Shifts
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    component={RouterLink}
                    to="/duty-roster/officer"
                  >
                    <Box sx={{
                      mb: 1,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PersonIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Officer Duties
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid size={{ xs: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 120,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      opacity: 0.6,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{
                      mb: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PeopleAltIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Staff Reports
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default DutyRosterDashboard; 