import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useRecords } from '../../hooks/useRecords';
import { PaperDispatchRecord } from '../../types';
import { PageContainer } from '../common';
import { formatDate } from '../../utils/formatters';

const PaperDispatchView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getRecord, loading } = useRecords('paper_dispatch');
  const [record, setRecord] = useState<PaperDispatchRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecord = async () => {
      if (!id) return;

      try {
        const loadedRecord = await getRecord(id) as PaperDispatchRecord;
        setRecord(loadedRecord);
      } catch (err) {
        setError('Failed to load paper dispatch record');
      }
    };    loadRecord();
  }, [id, getRecord]);

  const getStatusChip = (record: PaperDispatchRecord) => {
    if (record.registryType === 'RED_INK') {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Red Registry"
          color="error"
          variant="filled"
        />
      );
    }

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const receiveDate = new Date(record.dateOfReceive);
    const willTransitionSoon = !record.noExpectingReport && receiveDate <= sevenDaysFromNow;

    if (willTransitionSoon) {
      return (
        <Chip
          icon={<ScheduleIcon />}
          label="Transition Soon"
          color="warning"
          variant="filled"
        />
      );
    }

    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="Black Registry"
        color="success"
        variant="filled"
      />
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
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
        <Alert severity="warning">Paper dispatch record not found</Alert>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Record Details</Typography>
                {getStatusChip(record)}
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Serial Number
                      </Typography>
                      <Typography variant="body1">{record.serialNumber}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Form Type
                      </Typography>
                      <Typography variant="body1">{record.formType}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Date of Receive
                      </Typography>
                      <Typography variant="body1">{formatDate(record.dateOfReceive)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Registry Type
                      </Typography>
                      <Typography variant="body1">{record.registryType}</Typography>
                    </Grid>                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        From Whom
                      </Typography>
                      <Typography variant="body1">{record.fromWhom}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        To Whom
                      </Typography>
                      <Typography variant="body1">{record.toWhom || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Purpose
                      </Typography>
                      <Typography variant="body1">{record.purpose}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Date Fixed
                      </Typography>
                      <Typography variant="body1">
                        {record.dateFixed ? formatDate(record.dateFixed) : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        No Expecting Report
                      </Typography>
                      <Typography variant="body1">
                        {record.noExpectingReport ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Remarks
                      </Typography>
                      <Typography variant="body1">{record.remarks || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {record.registryType === 'RED_INK' && record.dateTransitionToRed && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Red Registry Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Date Transitioned to Red
                    </Typography>
                    <Typography variant="body1">{formatDate(record.dateTransitionToRed)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {record.courtDetails && (
          <Grid size={{ xs: 12 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Court Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Court Name
                    </Typography>
                    <Typography variant="body1">{record.courtDetails.courtName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Case Number
                    </Typography>
                    <Typography variant="body1">{record.courtDetails.caseNumber}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Hearing Date
                    </Typography>                    <Typography variant="body1">
                      {record.courtDetails.hearingDate ? formatDate(record.courtDetails.hearingDate) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Created At
                  </Typography>
                  <Typography variant="body1">{formatDate(record.createdAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body1">{formatDate(record.updatedAt)}</Typography>
                </Grid>                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {record.createdBy 
                      ? typeof record.createdBy === 'string' 
                        ? record.createdBy 
                        : `${record.createdBy.firstName} ${record.createdBy.lastName}`
                      : 'System'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Unit
                  </Typography>
                  <Typography variant="body1">{record.unit?.name || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default PaperDispatchView;