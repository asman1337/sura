import React, { useEffect } from 'react';
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
  Refresh as RefreshIcon,
  Article as ArticleIcon,
  Description as FileIcon,
  Assignment as FormIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useRecordsApi } from '../hooks';
import { useRecords } from '../hooks/useRecords';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';
import { RecordFormConfig } from '../types';
import { PageContainer } from './common';

// Available record types with their configurations
const recordTypes: RecordFormConfig[] = [
  {
    id: 'ud_case',
    title: 'UD Case Register',
    description: 'Register for unnatural death cases',
    icon: 'ArticleIcon',
    type: 'ud_case',
    fields: []
  },
  {
    id: 'stolen_property',
    title: 'Stolen Property Register',
    description: 'Register for stolen property records',
    icon: 'InventoryIcon',
    type: 'stolen_property',
    fields: []
  },
  {
    id: 'general_diary',
    title: 'General Diary',
    description: 'Daily station diary records',
    icon: 'BookIcon',
    type: 'general_diary',
    fields: []
  },
  {
    id: 'fir',
    title: 'FIR Register',
    description: 'First Information Reports',
    icon: 'ReportIcon',
    type: 'fir',
    fields: []
  },
  {
    id: 'arrest_memo',
    title: 'Arrest Memo',
    description: 'Records of arrests made',
    icon: 'PersonIcon',
    type: 'arrest_memo',
    fields: []
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'ArticleIcon':
      return <ArticleIcon />;
    case 'InventoryIcon':
      return <SearchIcon />;
    case 'FileIcon':
      return <FileIcon />;
    case 'FormIcon':
      return <FormIcon />;
    default:
      return <FileIcon />;
  }
};

/**
 * Dashboard component for the Records plugin
 * Shows available record types and recent records
 */
const RecordsDashboard: React.FC = () => {
  const theme = useTheme();
  const { api } = useData();
  const recordsApi = useRecordsApi();
  const { records, stats, loading, error, refreshData } = useRecords();

  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);

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
  
  // Show loading state while Records API initializes
  if (!recordsApi.isReady) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing Records module...
        </Typography>
      </Box>
    );
  }
  
  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Police Records
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/records/create"
          >
            Add New Record
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
            to="/records"
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
                  <FileIcon fontSize="medium" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="600">
                    {stats?.totalRecords || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Dynamic stats cards based on record types */}
        {['ud_case', 'stolen_property', 'fir'].map((recordType, index) => {
          // Map colors to indices
          const colorMappings = [
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.info.main
          ];
          
          // Find the record form config
          const typeConfig = recordTypes.find(rt => rt.id === recordType);
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={recordType}>
              <Card 
                component={RouterLink}
                to={`/records/type/${recordType}`}
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    borderColor: colorMappings[index],
                  },
                  textDecoration: 'none',
                  color: 'text.primary'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: alpha(colorMappings[index], 0.1),
                      color: colorMappings[index],
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getIconComponent(typeConfig?.icon || 'FileIcon')}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" fontWeight="600">
                        {stats?.recordsByType?.[recordType] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {typeConfig?.title || recordType}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Main content area */}
      <Grid container spacing={3}>
        {/* Recent records */}
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
              title="Recently Added Records" 
              action={
                <IconButton aria-label="settings">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              <List>
                {records.length > 0 ? (
                  records.slice(0, 5).map((record) => (
                    <React.Fragment key={record.id}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ px: 0 }}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            component={RouterLink}
                            to={`/records/view/${record.id}`}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={(record as any).caseNumber || (record as any).propertyId || record.id}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block', fontWeight: 500 }}
                              >
                                {record.type === 'ud_case' ? 'UD Case' : 
                                 record.type === 'stolen_property' ? 'Stolen Property' : 
                                 record.type}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                Created: {new Date(record.createdAt).toLocaleDateString()}
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
                      primary="No records found"
                      secondary="Add new records to get started"
                    />
                  </ListItem>
                )}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                  component={RouterLink}
                  to="/records"
                >
                  View All Records
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Available Record Types */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader title="Record Types" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {recordTypes.map((recordType, index) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={recordType.id}>
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
                      to={`/records/type/${recordType.id}`}
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
                        {getIconComponent(recordType.icon)}
                      </Box>
                      <Typography variant="subtitle2" align="center">
                        {recordType.title}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default RecordsDashboard; 