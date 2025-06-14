import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Gavel as GavelIcon,
  PhotoCamera as PhotoCameraIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useRecords } from '../../hooks/useRecords';
import { ArrestRecord } from '../../types';
import { PageContainer } from '../common';
import { format } from 'date-fns';

const ArrestRecordView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, loading } = useRecords('arrest_record');
  const [record, setRecord] = useState<ArrestRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRecord();
    }
  }, [id]);

  const loadRecord = async () => {
    try {
      const arrestRecord = await getRecord(id!) as ArrestRecord;
      setRecord(arrestRecord);
    } catch (error) {
      console.error('Error loading arrest record:', error);
      setError('Failed to load arrest record');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!record) {
    return (
      <PageContainer>
        <Alert severity="warning">Arrest record not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/records')}
          variant="outlined"
        >
          Back to Records
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={() => navigate(`/records/edit/arrest-record/${id}`)}
          variant="contained"
        >
          Edit Record
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Arrest Record #{record.serialNumber}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={`Part ${record.partType.replace('part', '')}`}
              color={record.partType === 'part1' ? 'primary' : 'secondary'}
            />
            <Chip 
              label={record.status}
              color={record.status === 'active' ? 'success' : 'default'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Created: {formatDate(record.createdAt)} | 
            Record Date: {formatDate(record.recordDate)}
          </Typography>
        </Box>

        {/* Accused Person Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h6">Accused Person Details</Typography>
            </Box>            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{record.accusedName}</Typography>
              </Grid>
              {record.accusedPhone && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{record.accusedPhone}</Typography>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{record.accusedAddress}</Typography>
              </Grid>
              {record.accusedPCN && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">P.C.N</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{record.accusedPCN}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Arrest Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Arrest Details</Typography>            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Date of Arrest</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(record.dateOfArrest)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Arresting Officer</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{record.arrestingOfficerName}</Typography>
              </Grid>
              {record.arrestLocation && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Arrest Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{record.arrestLocation}</Typography>
                </Grid>
              )}
              {record.arrestCircumstances && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">Arrest Circumstances</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{record.arrestCircumstances}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Court Details */}
        {(record.dateForwardedToCourt || record.courtName || record.caseReference || record.trialResult) && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <GavelIcon />
                </Avatar>
                <Typography variant="h6">Court & Case Details</Typography>
              </Box>              <Grid container spacing={3}>
                {record.dateForwardedToCourt && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Date Forwarded to Court</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(record.dateForwardedToCourt)}</Typography>
                  </Grid>
                )}
                {record.courtName && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Court Name</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.courtName}</Typography>
                  </Grid>
                )}
                {record.courtAddress && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Court Address</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.courtAddress}</Typography>
                  </Grid>
                )}
                {record.judgeNameOrCourtNumber && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Judge / Court Number</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.judgeNameOrCourtNumber}</Typography>
                  </Grid>
                )}
                {record.caseReference && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Case Reference</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.caseReference}</Typography>
                  </Grid>
                )}
                {record.trialResult && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">Trial Result</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.trialResult}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Criminal Identification */}
        {record.isIdentificationRequired && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Criminal Identification
                <Chip 
                  label={record.partType === 'part1' ? 'Required' : 'Optional'} 
                  size="small" 
                  color={record.partType === 'part1' ? 'error' : 'info'} 
                  sx={{ ml: 1 }} 
                />
              </Typography>              <Grid container spacing={3}>
                {record.age && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                    <Typography variant="body1">{record.age} years</Typography>
                  </Grid>
                )}
                {record.height && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Height</Typography>
                    <Typography variant="body1">{record.height} cm</Typography>
                  </Grid>
                )}
                {record.weight && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Weight</Typography>
                    <Typography variant="body1">{record.weight} kg</Typography>
                  </Grid>
                )}
                {record.eyeColor && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Eye Color</Typography>
                    <Typography variant="body1">{record.eyeColor}</Typography>
                  </Grid>
                )}
                {record.hairColor && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Hair Color</Typography>
                    <Typography variant="body1">{record.hairColor}</Typography>
                  </Grid>
                )}
                {record.complexion && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Complexion</Typography>
                    <Typography variant="body1">{record.complexion}</Typography>
                  </Grid>
                )}
                {record.identifyingMarks && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">Identifying Marks</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.identifyingMarks}</Typography>
                  </Grid>
                )}
                {record.otherPhysicalFeatures && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">Other Physical Features</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{record.otherPhysicalFeatures}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Photo Attachments */}
        {record.photoUrls && record.photoUrls.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PhotoCameraIcon />
                </Avatar>
                <Typography variant="h6">Photo Attachments</Typography>
              </Box>
              <List>
                {record.photoUrls.map((url, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemText 
                      primary={`Photo ${index + 1}`}
                      secondary={url}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {(record.remarks || record.notes) && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Additional Information</Typography>
              {record.remarks && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                  <Typography variant="body1">{record.remarks}</Typography>
                </Box>
              )}
              {record.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{record.notes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Paper>
    </PageContainer>
  );
};

export default ArrestRecordView;
