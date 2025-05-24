import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Paper,
  Button,
  Divider,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  LocalHospital as HospitalIcon,
  Photo as PhotoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRecords } from '../../hooks/useRecords';
import { UDCaseRecord } from '../../types';
import { PageContainer } from '../common';
import { formatDate } from '../../utils/formatters';
import { useData } from '../../../../core/data';

const UDCaseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { api } = useData(); // Access the API directly as a fallback
  const { getRecord, loading: apiLoading, error: apiError, deleteRecord } = useRecords(
    undefined, 
    { skipInitialFetch: true, skipStatsFetch: true }
  );
  const [udCase, setUdCase] = useState<UDCaseRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [manualRetryEnabled, setManualRetryEnabled] = useState(false);

  // Memoize the loadUDCase function to prevent infinite renders
  const loadUDCase = useCallback(async () => {
    if (!id) {
      setError('No case ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      // First, try with getRecord from useRecords
      let record;
      try {
        record = await getRecord(id, 'ud_case');
      } catch (recordError) {
        console.error('Error getting record via useRecords:', recordError);
        record = null;
      }
      
      // If the record is undefined or null, try direct API access as a fallback
      if (!record && api) {
        try {
          const response = await api.get(`/ud-cases/${id}`) as { data?: UDCaseRecord } | UDCaseRecord;
          
          // Check if response or response.data contains the record
          if (response && 'id' in response) {
            record = response as UDCaseRecord;
          } else if (response && 'data' in response && response.data && 'id' in response.data) {
            record = response.data;
          }
        } catch (directApiError) {
          console.error('Direct API access also failed:', directApiError);
        }
      }
      
      if (record && record.id) {
        setUdCase(record as UDCaseRecord);
        setRetryCount(0); // Reset retry count on success
        setManualRetryEnabled(false);
      } else {
        console.error('Received empty or invalid record:', record);
        
        // Auto-retry logic - retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const nextRetry = retryCount + 1;
          const delay = Math.pow(2, nextRetry) * 1000; // 2s, 4s, 8s
          
          console.log(`Auto-retrying in ${delay/1000} seconds (attempt ${nextRetry})`);
          setRetryCount(nextRetry);
          
          setTimeout(() => {
            console.log(`Executing retry attempt ${nextRetry}`);
            loadUDCase();
          }, delay);
        } else {
          setError('Failed to load case after multiple attempts. You can try manually refreshing.');
          setManualRetryEnabled(true);
        }
      }
    } catch (err) {
      console.error('Error loading UD case:', err);
      setError('Failed to load case details. Please try again.');
      setManualRetryEnabled(true);
    } finally {
      setLoading(false);
    }
  }, [id, getRecord, api, retryCount]);

  // Run the effect only once when loadUDCase changes
  useEffect(() => {
    loadUDCase();
  }, [loadUDCase]);

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    loadUDCase();
  };

  const handleDelete = async () => {
    if (!id) {
      setDeleteError('No case ID provided');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this UD case? This action cannot be undone.')) {
      setIsDeleting(true);
      setDeleteError(null);
      
      try {
        await deleteRecord(id, 'ud_case');
        navigate('/records/type/ud_case');
      } catch (err) {
        console.error('Error deleting UD case:', err);
        setDeleteError('Failed to delete UD case. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading || apiLoading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || apiError) {
    return (
      <PageContainer>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || apiError}
        </Alert>
        
        {manualRetryEnabled && (
          <Button
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
            variant="contained"
            sx={{ mb: 2 }}
          >
            Retry Loading
          </Button>
        )}
        
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/records/type/ud_case')}
          variant="outlined"
        >
          Back to Records
        </Button>
      </PageContainer>
    );
  }

  if (!udCase) {
    return (
      <PageContainer>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Case not found or data could not be loaded.
        </Alert>
        
        <Button
          onClick={handleRetry}
          startIcon={<RefreshIcon />}
          variant="contained"
          sx={{ mb: 2, mr: 1 }}
        >
          Retry Loading
        </Button>
        
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/records/type/ud_case')}
          variant="outlined"
        >
          Back to Records
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header with actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            UD Case #{udCase.caseNumber}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label={udCase.status} 
              color={udCase.status === 'active' ? 'success' : udCase.status === 'archived' ? 'warning' : 'error'} 
              size="small"
            />
            <Chip 
              label={udCase.investigationStatus} 
              color={
                udCase.investigationStatus === 'pending' ? 'warning' : 
                udCase.investigationStatus === 'investigation' ? 'info' : 
                'success'
              } 
              size="small"
            />
            <Chip 
              label={udCase.identificationStatus || 'unidentified'} 
              color={
                udCase.identificationStatus === 'identified' ? 'success' : 
                udCase.identificationStatus === 'partial' ? 'warning' : 
                'error'
              } 
              size="small"
            />
          </Stack>
        </Box>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/records/type/ud_case')}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/records/edit/ud-case/${udCase.id}`)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="outlined"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Case Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> Case Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Case Number</Typography>
                <Typography variant="body1" gutterBottom>{udCase.caseNumber}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Date of Occurrence</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(udCase.dateOfOccurrence)}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  {udCase.location}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Apparent Cause of Death</Typography>
                <Typography variant="body1" gutterBottom>{udCase.apparentCauseOfDeath}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Assigned Officer</Typography>
                <Typography variant="body1" gutterBottom>
                  {udCase.assignedOfficer ? 
                    `${udCase.assignedOfficer.firstName} ${udCase.assignedOfficer.lastName}` : 
                    udCase.assignedOfficerId}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1" gutterBottom>{udCase.description || 'No description provided'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Deceased Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} /> Deceased Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1" gutterBottom>
                  {udCase.deceasedName || 'Unidentified'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1" gutterBottom>
                  {udCase.deceasedAddress || 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Identification Status</Typography>
                <Chip 
                  label={udCase.identificationStatus || 'unidentified'} 
                  color={
                    udCase.identificationStatus === 'identified' ? 'success' : 
                    udCase.identificationStatus === 'partial' ? 'warning' : 
                    'error'
                  } 
                  size="small"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Informant Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} /> Informant Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1" gutterBottom>{udCase.informantName}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Relation</Typography>
                <Typography variant="body1" gutterBottom>{udCase.informantRelation || 'Not specified'}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1" gutterBottom>{udCase.informantAddress}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography variant="body1" gutterBottom>{udCase.informantContact || 'Not provided'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Post Mortem Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HospitalIcon sx={{ mr: 1 }} /> Post Mortem Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Post Mortem Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {udCase.postMortemDate ? formatDate(udCase.postMortemDate) : 'Not conducted'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                <Typography variant="body1" gutterBottom>{udCase.postMortemDoctor || 'Not specified'}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Hospital</Typography>
                <Typography variant="body1" gutterBottom>{udCase.postMortemHospital || 'Not specified'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Photos */}
        {udCase.photoUrls && udCase.photoUrls.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PhotoIcon sx={{ mr: 1 }} /> Photos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {udCase.photoUrls.map((url, index) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                    <Box
                      component="img"
                      src={url}
                      alt={`Photo ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        )}

        {/* Additional Notes */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>Notes & Remarks</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                <Typography variant="body1" gutterBottom>{udCase.remarks || 'No remarks'}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                <Typography variant="body1" gutterBottom>{udCase.notes || 'No notes'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Metadata */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created: {formatDate(udCase.createdAt)} by {
                udCase.createdBy ? 
                  (typeof udCase.createdBy === 'string' ? 
                    udCase.createdBy : 
                    `${udCase.createdBy.firstName} ${udCase.createdBy.lastName}`) : 
                  'Unknown'
              }
              {udCase.lastModifiedBy && 
                ` • Last Modified: ${formatDate(udCase.updatedAt)} by ${
                  typeof udCase.lastModifiedBy === 'string' ? 
                    udCase.lastModifiedBy : 
                    `${udCase.lastModifiedBy.firstName} ${udCase.lastModifiedBy.lastName}`
                }`
              }
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default UDCaseView; 