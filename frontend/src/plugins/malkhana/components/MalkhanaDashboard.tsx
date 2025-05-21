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
  Search as SearchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Category as ShelvesIcon,
  ViewList as ViewListIcon,
  Inventory as InventoryIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useMalkhanaApi } from '../hooks';
import { MalkhanaItem, MalkhanaStats } from '../types';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

/**
 * Dashboard component for the Malkhana plugin
 * Shows statistics and item lists
 */
const MalkhanaDashboard: React.FC = () => {
  const theme = useTheme();
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();

  const [stats, setStats] = useState<MalkhanaStats | null>(null);
  const [recentItems, setRecentItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!malkhanaApi.isReady) return;
      
      try {
        setLoading(true);
        
        // Load stats and items in parallel for better performance
        const [statsData, blackInkItems] = await Promise.all([
          malkhanaApi.getStats(),
          malkhanaApi.getBlackInkItems()
        ]);
        
        if (statsData) setStats(statsData);
        
        // Sort and get recent items
        const sortedItems = [...blackInkItems]
          .sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime())
          .slice(0, 5);
          
        setRecentItems(sortedItems);
        setError(null);
      } catch (err) {
        console.error('Error loading Malkhana data:', err);
        setError('Failed to load Malkhana data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [malkhanaApi.isReady]);
  
  const handleRefresh = async () => {
    if (!malkhanaApi.isReady) return;
    
    try {
      setLoading(true);
      
      // Load stats and items in parallel
      const [statsData, blackInkItems] = await Promise.all([
        malkhanaApi.getStats(),
        malkhanaApi.getBlackInkItems()
      ]);
      
      if (statsData) setStats(statsData);
      
      // Sort and get recent items
      const sortedItems = [...blackInkItems]
        .sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime())
        .slice(0, 5);
        
      setRecentItems(sortedItems);
      setError(null);
    } catch (err) {
      console.error('Error refreshing Malkhana data:', err);
      setError('Failed to refresh Malkhana data. Please try again.');
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
  
  // Show loading state while Malkhana API initializes
  if (!malkhanaApi.isReady) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing Malkhana module...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Malkhana Management
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
            to="/malkhana/add-item"
          >
            Add New Item
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
            to="/malkhana"
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
                  <InventoryIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats?.totalItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            component={RouterLink}
            to="/malkhana/black-ink"
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
                    {stats?.blackInkItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Black Ink Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            component={RouterLink}
            to="/malkhana/red-ink"
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
                  <HistoryIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats?.redInkItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Red Ink Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            component={RouterLink}
            to="/malkhana/black-ink" 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderColor: theme.palette.error.main,
              },
              textDecoration: 'none',
              color: 'text.primary'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DeleteIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats?.disposedItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disposed Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main content area */}
      <Grid container spacing={3}>
        {/* Recent items */}
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
              title="Recently Added Items" 
              action={
                <IconButton aria-label="settings">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              <List>
                {recentItems.length > 0 ? (
                  recentItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ px: 0 }}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            component={RouterLink}
                            to={`/malkhana/item/${item.id}`}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`${item.description} (Case #${item.caseNumber})`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block', fontWeight: 500 }}
                              >
                                Registry #{item.registryNumber} - {item.category}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                Received: {new Date(item.dateReceived).toLocaleDateString()}
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
                      primary="No items found"
                      secondary="Add new items to the registry"
                    />
                  </ListItem>
                )}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                  component={RouterLink}
                  to="/malkhana/black-ink"
                >
                  View Black Ink Registry
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
            <CardHeader title="Malkhana Actions" />
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
                    to="/malkhana/add-item"
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
                      Add New Item
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
                    to="/malkhana/black-ink"
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
                      Black Ink Registry
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
                    to="/malkhana/red-ink"
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
                      <HistoryIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Red Ink Registry
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
                    to="/malkhana/search"
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
                      <SearchIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Search Items
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
                    to="/malkhana/shelves"
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
                      <ShelvesIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Shelf Management
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
                      <DeleteIcon />
                    </Box>
                    <Typography variant="subtitle2" align="center">
                      Disposed Items
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MalkhanaDashboard; 