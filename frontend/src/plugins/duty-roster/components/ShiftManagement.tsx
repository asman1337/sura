import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, 
  Grid, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, 
  TableRow, IconButton, TextField, 
  Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle,
  Chip, Tooltip, Card, CardHeader, CardContent,
  Divider, alpha, useTheme, Link, Breadcrumbs
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useData } from '../../../core/data/data-context';
import { DutyShiftRepository } from '../repositories/duty-shift-repository';
import { DutyShift } from '../types';
import { PageContainer } from './common';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  WorkOutline as WorkIcon
} from '@mui/icons-material';

const ShiftManagement: React.FC = () => {
  const navigate = useNavigate();
  const dataContext = useData();
  const theme = useTheme();
  
  const [shifts, setShifts] = useState<DutyShift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<DutyShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    defaultShifts: 0
  });

  // Fetch shift templates
  useEffect(() => {
    fetchShifts();
  }, [dataContext]);

  const fetchShifts = async () => {
    if (!dataContext) return;
    
    try {
      setLoading(true);
      const shiftRepository = new DutyShiftRepository(
        dataContext.api,
        dataContext.cache,
        dataContext.sync,
        dataContext.storage
      );

      const allShifts = await shiftRepository.getAll();
      setShifts(allShifts);
      setFilteredShifts(allShifts);
      
      // Calculate statistics
      const defaultShifts = allShifts.filter(shift => shift.isDefault).length;
      
      setStats({
        total: allShifts.length,
        defaultShifts
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setError('Failed to load shifts');
      setLoading(false);
    }
  };

  // Apply search filter when search query changes
  useEffect(() => {
    if (shifts.length === 0) return;
    
    let result = [...shifts];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(shift => 
        shift.name?.toLowerCase().includes(query)
      );
    }
    
    setFilteredShifts(result);
  }, [shifts, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDeleteClick = (shiftId: string) => {
    setShiftToDelete(shiftId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete || !dataContext) return;
    
    try {
      const shiftRepository = new DutyShiftRepository(
        dataContext.api,
        dataContext.cache,
        dataContext.sync,
        dataContext.storage
      );
      
      await shiftRepository.delete(shiftToDelete);
      setShifts(shifts.filter(shift => shift.id !== shiftToDelete));
      setDeleteDialogOpen(false);
      setShiftToDelete(null);
    } catch (err) {
      console.error('Error deleting shift:', err);
      setError('Failed to delete shift. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  return (
    <PageContainer>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/duty-roster" color="inherit" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Shift Management</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Shift Management
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchShifts}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/duty-roster/shifts/create')}
          >
            Create New Shift
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
        <Grid size={{ xs: 12, sm: 6 }}>
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
                  <TimeIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Shifts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
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
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WorkIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.defaultShifts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Default Shifts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Search */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Search shifts"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name"
                size="small"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.secondary' }}>
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Shifts list */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardHeader 
          title="Shift Templates" 
          subheader={
            filteredShifts.length > 0
              ? `Showing ${filteredShifts.length} of ${shifts.length} shifts`
              : undefined
          }
        />
        <Divider />
        
        {filteredShifts.length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" gutterBottom>No shifts found</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {shifts.length > 0 
                ? 'No shifts match your search criteria. Try adjusting your search.'
                : 'Create your first shift template to get started'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/duty-roster/shifts/create')}
            >
              Create Shift
            </Button>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Is Default</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredShifts.map((shift) => (
                  <TableRow key={shift.id} hover>
                    <TableCell>{shift.name || 'Unnamed Shift'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        {shift.startTime} - {shift.endTime}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {shift.isDefault ? (
                        <Chip 
                          label="Default" 
                          color="success"
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : 'No'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Edit Shift">
                          <IconButton 
                            onClick={() => navigate(`/duty-roster/shifts/${shift.id}/edit`)}
                            size="small"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Shift">
                          <IconButton 
                            onClick={() => handleDeleteClick(shift.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this shift template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ShiftManagement; 