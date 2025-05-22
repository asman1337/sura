import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid,
  Button, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Breadcrumbs,
  Link
} from '@mui/material';
import { format } from 'date-fns';
import { useData } from '../../../core/data/data-context';
import { 
  DutyRoster, 
  DutyShift, 
  DutyAssignment, 
  Officer, 
  DutyAssignmentType
} from '../types';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';
import { DutyShiftRepository } from '../repositories/duty-shift-repository';
import { DutyAssignmentRepository } from '../repositories/duty-assignment-repository';
import { PageContainer } from './common';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Publish as PublishIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
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
      id={`roster-tabpanel-${index}`}
      aria-labelledby={`roster-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RosterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dataContext = useData();
  const theme = useTheme();
  
  const [roster, setRoster] = useState<DutyRoster | null>(null);
  const [shifts, setShifts] = useState<DutyShift[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<DutyShift | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');

  useEffect(() => {
    const fetchRosterDetails = async () => {
      try {
        setLoading(true);
        
        if (!id || !dataContext) {
          throw new Error('Required data is missing');
        }
        
        // Create repositories directly
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
        
        const assignmentRepository = new DutyAssignmentRepository(
          dataContext.api,
          dataContext.cache,
          dataContext.sync,
          dataContext.storage
        );
        
        // Fetch roster details
        const fetchedRoster = await rosterRepository.getById(id);
        setRoster(fetchedRoster);
        
        // Fetch shifts for this roster
        const fetchedShifts = await shiftRepository.getByRosterId(id);
        setShifts(fetchedShifts);
        
        // Fetch assignments for this roster
        const fetchedAssignments = await assignmentRepository.getByRosterId(id);
        setAssignments(fetchedAssignments);
        
        // TODO: Replace with actual officer data from user repository
        setOfficers([
          { id: '1', name: 'John Smith', rank: 'Sergeant', badgeNumber: '12345' },
          { id: '2', name: 'Sarah Jones', rank: 'Officer', badgeNumber: '23456' },
          { id: '3', name: 'Michael Brown', rank: 'Corporal', badgeNumber: '34567' },
          { id: '4', name: 'Emily Davis', rank: 'Officer', badgeNumber: '45678' },
          { id: '5', name: 'Robert Wilson', rank: 'Lieutenant', badgeNumber: '56789' }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching roster details:', err);
        setError(`Failed to load roster details: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    fetchRosterDetails();
  }, [id, dataContext]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleAssignShift = (shift: DutyShift) => {
    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };
  
  const handleSaveAssignment = async () => {
    if (!selectedShift || !selectedOfficer || !roster || !dataContext) return;
    
    try {
      // Create repository directly
      const assignmentRepository = new DutyAssignmentRepository(
        dataContext.api,
        dataContext.cache,
        dataContext.sync,
        dataContext.storage
      );
      
      // Cast to assignment DTO
      const newAssignment = {
        dutyRosterId: roster.id,
        shiftId: selectedShift.id,
        officerId: selectedOfficer,
        assignmentType: DutyAssignmentType.REGULAR,
        date: selectedShift.date,
        assignedAt: new Date().toISOString()
      };
      
      const savedAssignment = await assignmentRepository.create(newAssignment);
      
      // Update the assignments list
      setAssignments([...assignments, savedAssignment]);
      
      // Close dialog
      setAssignDialogOpen(false);
      setSelectedShift(null);
      setSelectedOfficer('');
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(`Failed to create assignment: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const isOfficerAssigned = (shiftId: string, officerId: string) => {
    return assignments.some(a => a.shiftId === shiftId && a.officerId === officerId);
  };
  
  const getAssignedOfficer = (shiftId: string) => {
    const assignment = assignments.find(a => a.shiftId === shiftId);
    if (!assignment) return null;
    
    return officers.find(o => o.id === assignment.officerId) || null;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Show loading state
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
  
  // Show error state
  if (error) {
    return (
      <PageContainer>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Box>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/duty-roster')}>
          Back to Dashboard
        </Button>
      </PageContainer>
    );
  }
  
  // Show not found state
  if (!roster) {
    return (
      <PageContainer>
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" gutterBottom>Roster not found</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The requested roster could not be found. It may have been deleted or you may not have permission to view it.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/duty-roster')}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/duty-roster" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/duty-roster/rosters" color="inherit" underline="hover">
          Rosters
        </Link>
        <Typography color="text.primary">{roster.name}</Typography>
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
            {roster.name}
            <Chip 
              label={roster.status}
              color={getStatusColor(roster.status)}
              size="small"
              sx={{ 
                ml: 2,
                fontWeight: 500,
                minWidth: 80,
                textAlign: 'center'
              }}
            />
          </Typography>
        </Box>
        
        <Box>
          {roster.status === 'DRAFT' && (
            <>
              <Button
                variant="outlined"
                startIcon={<PublishIcon />}
                sx={{ mr: 2 }}
              >
                Publish Roster
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                component={RouterLink}
                to={`/duty-roster/rosters/${id}/edit`}
                sx={{ mr: 2 }}
              >
                Edit Roster
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => console.log('Print roster')}
          >
            Print Roster
          </Button>
        </Box>
      </Box>
      
      {/* Roster details and stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Roster details card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader title="Duty Roster Details" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Date Range</Typography>
                  <Typography variant="body1">
                    {format(new Date(roster.startDate), 'MMM dd, yyyy')} - {format(new Date(roster.endDate), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                  <Typography variant="body1">
                    {format(new Date(roster.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">
                    {roster.createdBy 
                      ? (typeof roster.createdBy === 'string' 
                         ? roster.createdBy 
                         : `${(roster.createdBy as any).firstName || ''} ${(roster.createdBy as any).lastName || ''}`.trim() || 'Unknown')
                      : 'Unknown'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Typography variant="body1">
                    <Chip 
                      label={roster.status}
                      color={getStatusColor(roster.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Typography>
                </Grid>
                {roster.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">
                      {roster.notes || 'No description provided'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Roster statistics card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader title="Roster Statistics" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      mb: 1,
                      mx: 'auto',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ScheduleIcon />
                    </Box>
                    <Typography variant="h4" fontWeight="600">{shifts.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Shifts</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      mb: 1,
                      mx: 'auto',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AssignmentIcon />
                    </Box>
                    <Typography variant="h4" fontWeight="600">{assignments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Assignments</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      mb: 1,
                      mx: 'auto',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PersonIcon />
                    </Box>
                    <Typography variant="h4" fontWeight="600">
                      {new Set(assignments.map(a => a.officerId)).size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Officers</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      mb: 1,
                      mx: 'auto',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <EventIcon />
                    </Box>
                    <Typography variant="h4" fontWeight="600">
                      {Math.round((assignments.length / (shifts.length || 1)) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Coverage</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs content */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'visible'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="roster tabs"
            sx={{ px: 2 }}
          >
            <Tab 
              label="Shifts" 
              id="roster-tab-0" 
              aria-controls="roster-tabpanel-0"
              icon={<ScheduleIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab 
              label="Assignments" 
              id="roster-tab-1" 
              aria-controls="roster-tabpanel-1"
              icon={<AssignmentIcon fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              size="small"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/duty-roster/shifts/create?rosterId=${id}`)}
            >
              Add Shift
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Officer</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="subtitle1" color="text.secondary">No shifts found for this roster</Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddIcon />} 
                          sx={{ mt: 1 }}
                          onClick={() => navigate(`/duty-roster/shifts/create?rosterId=${id}`)}
                        >
                          Add First Shift
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map(shift => {
                    const assignedOfficer = getAssignedOfficer(shift.id);
                    
                    return (
                      <TableRow key={shift.id} hover>
                        <TableCell>{format(new Date(shift.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{`${shift.startTime} - ${shift.endTime}`}</TableCell>
                        <TableCell>
                          <Chip 
                            label={shift.type}
                            color="default"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>{shift.location}</TableCell>
                        <TableCell>
                          {assignedOfficer ? (
                            <Chip 
                              icon={<PersonIcon fontSize="small" />}
                              label={assignedOfficer.name}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Chip 
                              label="Not assigned"
                              color="default"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            {!assignedOfficer && (
                              <Tooltip title="Assign Officer">
                                <IconButton 
                                  color="primary"
                                  size="small"
                                  onClick={() => handleAssignShift(shift)}
                                >
                                  <PersonAddIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {assignedOfficer && (
                              <Tooltip title="Reassign Officer">
                                <IconButton 
                                  color="info"
                                  size="small"
                                  onClick={() => handleAssignShift(shift)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit Shift">
                              <IconButton 
                                color="secondary"
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Shift">
                              <IconButton 
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Officer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="subtitle1" color="text.secondary">No assignments found for this roster</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Assign officers to shifts to create assignments
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map(assignment => {
                    const shift = shifts.find(s => s.id === assignment.shiftId);
                    const officer = officers.find(o => o.id === assignment.officerId);
                    
                    if (!shift || !officer) return null;
                    
                    return (
                      <TableRow key={assignment.id} hover>
                        <TableCell>{format(new Date(shift.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Box>
                            {`${shift.startTime} - ${shift.endTime}`}
                            <Chip 
                              label={shift.type}
                              color="default"
                              size="small"
                              sx={{ ml: 1, fontWeight: 500 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<PersonIcon fontSize="small" />}
                            label={officer.name}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={assignment.assignmentType}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>{format(new Date(assignment.assignedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Edit Assignment">
                              <IconButton 
                                color="info"
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Assignment">
                              <IconButton 
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
      
      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Officer to Shift</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select an officer to assign to this shift:
            {selectedShift && (
              <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                <strong>Date:</strong> {format(new Date(selectedShift.date), 'MMM dd, yyyy')}<br />
                <strong>Time:</strong> {selectedShift.startTime} - {selectedShift.endTime}<br />
                <strong>Type:</strong> {selectedShift.type}<br />
                <strong>Location:</strong> {selectedShift.location}
              </Typography>
            )}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="officer-select-label">Officer</InputLabel>
            <Select
              labelId="officer-select-label"
              value={selectedOfficer}
              label="Officer"
              onChange={(e) => setSelectedOfficer(e.target.value)}
            >
              {officers.map(officer => (
                <MenuItem 
                  key={officer.id} 
                  value={officer.id}
                  disabled={selectedShift ? isOfficerAssigned(selectedShift.id, officer.id) : false}
                >
                  {officer.name} ({officer.rank}) - {officer.badgeNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveAssignment} 
            color="primary" 
            disabled={!selectedOfficer}
            variant="contained"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default RosterDetail; 