import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
  Fade,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import { 
  Search as SearchIcon, 
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useData } from '../../data';
import { useOfficerRepository, Officer, OfficerFilters } from '../../data';

const OfficersPage: React.FC = () => {
  const theme = useTheme();
  const { auth } = useData();
  const officerRepo = useOfficerRepository();
  const { error: repoError } = officerRepo;
  
  // State
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<OfficerFilters>({
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Officer>>({});
  const [saving, setSaving] = useState(false);
  
  // Get current user and unit
  const userProfile = auth.getCurrentUser();
  const userUnitId = userProfile?.primaryUnit?.id;
  
  // Track data loading to prevent infinite loops
  const loadingRef = React.useRef(false);
  
  // Load officers from current unit when component mounts
  useEffect(() => {
    // Skip if we don't have a unit ID or are already loading
    if (!userUnitId || loadingRef.current) return;
    
    const loadUnitOfficers = async () => {
      try {
        // Set both loading states to prevent concurrent calls
        loadingRef.current = true;
        setLoading(true);
        setErrorMessage(null);
        
        // Get by unit ID
        const officersData = await officerRepo.getByUnitId(userUnitId);
        setOfficers(officersData || []);
        
      } catch (err) {
        console.error('Error loading officers:', err);
        setErrorMessage('Failed to load officers from your unit');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    
    loadUnitOfficers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUnitId]); // Only depend on userUnitId
  
  // Filter and search officers
  const filteredOfficers = useMemo(() => {
    if (!officers || officers.length === 0) return [];
    
    // Start with isActive filter
    let result = officers.filter(officer => 
      filters.isActive === undefined || officer.isActive === filters.isActive
    );
    
    // Apply search term if any
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(officer => {
        const fullName = `${officer.firstName} ${officer.lastName}`.toLowerCase();
        return (
          fullName.includes(lowerSearchTerm) ||
          officer.badgeNumber.toLowerCase().includes(lowerSearchTerm) ||
          officer.email.toLowerCase().includes(lowerSearchTerm) ||
          (officer.rank?.name?.toLowerCase().includes(lowerSearchTerm) || false)
        );
      });
    }
    
    return result;
  }, [officers, filters, searchTerm]);
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    if (!userUnitId || loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setErrorMessage(null);
      
      const officersData = await officerRepo.getByUnitId(userUnitId);
      setOfficers(officersData || []);
    } catch (err) {
      console.error('Error refreshing officers:', err);
      setErrorMessage('Failed to refresh officers');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };
  
  // Open view details dialog
  const handleViewDetails = (officer: Officer) => {
    setSelectedOfficer(officer);
    setViewDialogOpen(true);
  };
  
  // Close view details dialog
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedOfficer(null);
  };
  
  // Open edit dialog
  const handleEdit = (officer: Officer) => {
    setSelectedOfficer(officer);
    setEditFormData({
      firstName: officer.firstName,
      lastName: officer.lastName,
      email: officer.email,
      phoneNumber: officer.phoneNumber || '',
      isActive: officer.isActive
    });
    setEditDialogOpen(true);
  };
  
  // Close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedOfficer(null);
    setEditFormData({});
  };
  
  // Handle form changes in edit dialog
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes in edit dialog
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value === 'true' ? true : false
    }));
  };
  
  // Handle save edited officer
  const handleSaveOfficer = async () => {
    if (!selectedOfficer) return;
    
    try {
      setSaving(true);
      
      // Manual patch since we don't have direct access to the update method
      const updatedData = { ...selectedOfficer, ...editFormData };
      
      // Simulate update by fetching full list and replacing the officer
      // In a real app, you would call an API endpoint here
      const updatedOfficers = officers.map(officer => 
        officer.id === selectedOfficer.id ? updatedData : officer
      );
      
      setOfficers(updatedOfficers);
      
      // Close dialog
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating officer:', err);
      setErrorMessage('Failed to update officer');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Fade in={true} timeout={800}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 500,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2
              }
            }}
          >
            Unit Officers
          </Typography>
        </Fade>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            color="primary"
          >
            Add Officer
          </Button>
        </Box>
      </Box>
      
      {/* Error message if any */}
      {(errorMessage || repoError) && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 1 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage || 'An error occurred while loading officers'}
          </Alert>
        </Fade>
      )}
      
      {/* Filters and search */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search officers..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isActive', 
                      value === 'all' ? undefined : value === 'active'
                    );
                  }}
                >
                  <MenuItem value="all">All Officers</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Officers list */}
      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Officer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Badge #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Loading officers...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredOfficers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PersonIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No officers found
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {searchTerm ? 'Try a different search term' : 'Try changing your filters'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOfficers.map(officer => (
                  <TableRow key={officer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={officer.profilePhotoUrl} 
                          alt={`${officer.firstName} ${officer.lastName}`}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2,
                            backgroundColor: officer.profilePhotoUrl ? 'transparent' : theme.palette.primary.main 
                          }}
                        >
                          {officer.firstName?.charAt(0) || 'O'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {officer.firstName} {officer.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {officer.department?.name || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BadgeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        {officer.badgeNumber}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {officer.rank?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '0.9rem' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            {officer.email}
                          </Typography>
                        </Box>
                        {officer.phoneNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '0.9rem' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                              {officer.phoneNumber}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={officer.isActive ? 'Active' : 'Inactive'} 
                        color={officer.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="View details">
                          <IconButton size="small" sx={{ mr: 1 }} onClick={() => handleViewDetails(officer)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit officer">
                          <IconButton size="small" onClick={() => handleEdit(officer)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* View Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Officer Details</Typography>
          <IconButton onClick={handleCloseViewDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedOfficer && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={selectedOfficer.profilePhotoUrl}
                    alt={`${selectedOfficer.firstName} ${selectedOfficer.lastName}`}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  >
                    {selectedOfficer.firstName?.charAt(0) || 'O'}
                  </Avatar>
                  <Typography variant="h6">
                    {selectedOfficer.firstName} {selectedOfficer.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedOfficer.rank?.name || ''}
                  </Typography>
                  <Chip 
                    label={selectedOfficer.isActive ? 'Active' : 'Inactive'} 
                    color={selectedOfficer.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Badge Number</Typography>
                    <Typography variant="body1">{selectedOfficer.badgeNumber}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{selectedOfficer.email}</Typography>
                  </Box>
                  
                  {selectedOfficer.phoneNumber && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">{selectedOfficer.phoneNumber}</Typography>
                    </Box>
                  )}
                  
                  {selectedOfficer.department && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                      <Typography variant="body1">{selectedOfficer.department.name}</Typography>
                    </Box>
                  )}
                  
                  {selectedOfficer.primaryUnit && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Unit</Typography>
                      <Typography variant="body1">{selectedOfficer.primaryUnit.name}</Typography>
                    </Box>
                  )}
                  
                  {selectedOfficer.reportingOfficer && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Reports To</Typography>
                      <Typography variant="body1">
                        {selectedOfficer.reportingOfficer.firstName} {selectedOfficer.reportingOfficer.lastName}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedOfficer.dateOfJoining && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Date of Joining</Typography>
                      <Typography variant="body1">
                        {new Date(selectedOfficer.dateOfJoining).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          {selectedOfficer && (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={() => {
                handleCloseViewDialog();
                handleEdit(selectedOfficer);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Officer</Typography>
          <IconButton onClick={handleCloseEditDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedOfficer && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editFormData.firstName || ''}
                  onChange={handleEditFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editFormData.lastName || ''}
                  onChange={handleEditFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={handleEditFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={editFormData.phoneNumber || ''}
                  onChange={handleEditFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="isActive"
                    value={String(editFormData.isActive === undefined ? selectedOfficer.isActive : editFormData.isActive)}
                    label="Status"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveOfficer}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfficersPage; 