import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box,
  Card,
  Chip,
  Grid,
  alpha,
  Table, 
  Button, 
  Divider,
  Tooltip,
  useTheme,
  TableRow,
  TableBody, 
  TableCell, 
  TableHead, 
  IconButton,
  Typography,
  CardHeader,
  CardContent,
  TableContainer, 
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { DutyRoster } from '../types';
import { PageContainer } from './common';
import { useData } from '../../../core/data/data-context';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';

/**
 * Roster list component displays all duty rosters
 * Redesigned to match Malkhana styling
 */
const RosterList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { api, cache, sync, storage } = useData();
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  });

  useEffect(() => {
    loadData();
  }, [api, cache, sync, storage]);

  const loadData = async () => {
    if (!api) return;
    
    try {
      setLoading(true);
      
      // Initialize repositories
      const rosterRepository = new DutyRosterRepository(api, cache, sync, storage);
      
      // Load data
      const data = await rosterRepository.getAll();
      
      // Calculate stats
      const published = data.filter(roster => roster.status === 'PUBLISHED').length;
      const draft = data.filter(roster => roster.status === 'DRAFT').length;
      
      setRosters(data);
      setStats({
        total: data.length,
        published,
        draft
      });
      
      setError(null);
    } catch (err) {
      console.error('Error loading duty rosters:', err);
      setError('Failed to load duty rosters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this roster?')) {
      try {
        setLoading(true);
        const repository = new DutyRosterRepository(api, cache, sync, storage);
        await repository.deleteRoster(id);
        
        // Reload data to refresh stats
        await loadData();
      } catch (err) {
        console.error('Error deleting roster:', err);
        setError('Failed to delete roster. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      setLoading(true);
      const repository = new DutyRosterRepository(api, cache, sync, storage);
      await repository.publishRoster(id);
      
      // Reload data to refresh stats
      await loadData();
    } catch (err) {
      console.error('Error publishing roster:', err);
      setError('Failed to publish roster. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    loadData();
  };
  
  const handleBack = () => {
    navigate('/duty-roster');
  };

  // Format date as a readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            sx={{ mr: 2 }}
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="500">
            Duty Rosters
          </Typography>
        </Box>
        
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
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
                  <ViewIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rosters
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
              border: `1px solid ${theme.palette.divider}`,
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
                  <PublishIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.published}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Published Rosters
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
              border: `1px solid ${theme.palette.divider}`,
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
                  <EditIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats.draft}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Draft Rosters
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Roster list */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardHeader title="All Rosters" />
        <Divider />
        
        {rosters.length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" gutterBottom>No duty rosters found</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first duty roster to get started
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/duty-roster/rosters/create"
              startIcon={<AddIcon />}
            >
              Create Roster
            </Button>
          </CardContent>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date Range</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rosters.map((roster) => (
                  <TableRow key={roster.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">
                        {roster.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(roster.startDate)} - {formatDate(roster.endDate)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={roster.status}
                        color={roster.status === 'PUBLISHED' ? 'success' : 'warning'}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          minWidth: 80,
                          textAlign: 'center'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {roster.createdBy 
                        ? (typeof roster.createdBy === 'string' 
                          ? roster.createdBy 
                          : `${(roster.createdBy as any).firstName || ''} ${(roster.createdBy as any).lastName || ''}`.trim() || 'Unknown')
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            component={RouterLink} 
                            to={`/duty-roster/rosters/${roster.id}`}
                            color="primary"
                            size="small"
                            sx={{ mx: 0.5 }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {roster.status !== 'PUBLISHED' && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton 
                                component={RouterLink} 
                                to={`/duty-roster/rosters/${roster.id}/edit`}
                                color="info"
                                size="small"
                                sx={{ mx: 0.5 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Publish">
                              <IconButton 
                                onClick={() => handlePublish(roster.id)}
                                color="success"
                                size="small"
                                sx={{ mx: 0.5 }}
                              >
                                <PublishIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton 
                                onClick={() => handleDelete(roster.id)}
                                color="error"
                                size="small"
                                sx={{ mx: 0.5 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </PageContainer>
  );
};

export default RosterList; 