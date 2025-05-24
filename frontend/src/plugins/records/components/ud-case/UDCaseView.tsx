import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Chip,
  Alert,
  useTheme,
  alpha
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
  Refresh as RefreshIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useRecords } from '../../hooks/useRecords';
import { UDCaseRecord } from '../../types';
import { PageContainer } from '../common';
import { formatDate } from '../../utils/formatters';
import { useData } from '../../../../core/data';

// Icon container for section headers
interface IconContainerProps {
  children: React.ReactNode;
  color: string;
}

const IconContainer: React.FC<IconContainerProps> = React.memo(({ children, color }) => (
  <Box
    sx={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      bgcolor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0
    }}
  >
    {children}
  </Box>
));

// Section header component
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  color: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ icon, title, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <IconContainer color={color}>{icon}</IconContainer>
    <Typography variant="h6" sx={{ ml: 2, fontWeight: 500 }}>
      {title}
    </Typography>
  </Box>
));

// Field component for consistent display
interface FieldDisplayProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const FieldDisplay: React.FC<FieldDisplayProps> = React.memo(({ label, value, icon }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography 
      variant="body1"
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        color: 'text.primary',
        fontWeight: 500
      }}
    >
      {icon && icon}
      {value || 'N/A'}
    </Typography>
  </Box>
));

const UDCaseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { api } = useData();
  const printRef = useRef<HTMLDivElement>(null);
  
  const { getRecord, loading, error: apiError, deleteRecord } = useRecords(
    undefined, 
    { skipInitialFetch: true, skipStatsFetch: true }
  );
  
  const [udCase, setUdCase] = useState<UDCaseRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load the UD case data
  const loadUDCase = useCallback(async () => {
    if (!id) {
      setError('No case ID provided');
      return;
    }
    
    try {
      // First try with getRecord
      let record;
      try {
        record = await getRecord(id, 'ud_case');
      } catch (recordError) {
        console.error('Error loading record:', recordError);
        record = null;
      }
      
      // Fallback to direct API
      if (!record && api) {
        try {
          const response = await api.get(`/ud-cases/${id}`) as { data?: UDCaseRecord };
          record = response.data || response;
        } catch (apiError) {
          console.error('Direct API access failed:', apiError);
        }
      }
      
      if (record && 'id' in record) {
        setUdCase(record as UDCaseRecord);
        setRetryCount(0);
      } else {
        // Auto-retry with backoff
          const nextRetry = retryCount + 1;
        if (nextRetry <= 3) {
          setRetryCount(nextRetry);
          setTimeout(() => loadUDCase(), Math.pow(2, nextRetry) * 1000);
        } else {
          setError('Failed to load case details. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error loading case:', err);
      setError('Failed to load case details. Please try again.');
    }
  }, [id, getRecord, api, retryCount]);

  useEffect(() => {
    loadUDCase();
  }, [loadUDCase]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }
    
      setIsDeleting(true);
      try {
        await deleteRecord(id, 'ud_case');
        navigate('/records/type/ud_case');
      } catch (err) {
      console.error('Error deleting case:', err);
      setDeleteError('Failed to delete. Please try again.');
        setIsDeleting(false);
    }
  };

  // Print functionality
  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    
    setTimeout(() => {
      const content = printRef.current;
      if (!content) {
        console.error('Print content not available');
        setIsPrinting(false);
        return;
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print this document');
        setIsPrinting(false);
        return;
      }
      
      // Create print styles
      const printStyles = `
        @media print {
          @page {
            size: A4;
            margin: 1.5cm 1cm;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
            position: relative;
          }
          
          .document-title {
            font-size: 20pt;
            font-weight: 600;
            color: #1976d2;
            margin: 0 0 5px 0;
          }
          
          .document-id {
            font-size: 11pt;
            color: #555;
            margin-top: 0;
          }
          
          .print-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .print-section {
            width: 100%;
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          
          .print-section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          
          .print-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .print-field {
            margin-bottom: 8px;
          }
          
          .print-field-label {
            font-size: 9pt;
            font-weight: 600;
            color: #666;
            margin-bottom: 2px;
          }
          
          .print-field-value {
            font-size: 10pt;
          }
          
          .print-chip {
            display: inline-block;
            background: #e0e0e0;
            border-radius: 12px;
            padding: 1px 6px;
            font-size: 9pt;
            margin-right: 5px;
          }
          
          .print-chip-active { background: #e8f5e9; color: #2e7d32; }
          .print-chip-pending { background: #fff8e1; color: #f57f17; }
          .print-chip-unidentified { background: #ffebee; color: #c62828; }
          
          .print-photos {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .print-photo {
            width: calc(25% - 8px);
            height: auto;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          
          .print-footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #ccc;
            font-size: 8pt;
            text-align: center;
            color: #666;
          }
          
          .print-footer p {
            margin: 3px 0;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      `;
      
      // Generate clean HTML for printing
      const caseHTML = `
        <div class="print-header">
          <h1 class="document-title">UD Case Report</h1>
          <p class="document-id">Case #${udCase?.caseNumber || 'Unknown'}</p>
        </div>
        
        <div class="print-container">
          <div class="print-section" style="width: 100%;">
            <div class="print-section-title">Case Overview</div>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-field-label">Case Number</div>
                <div class="print-field-value">${udCase?.caseNumber || ''}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Date of Occurrence</div>
                <div class="print-field-value">${udCase?.dateOfOccurrence ? formatDate(udCase.dateOfOccurrence) : ''}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Status</div>
                <div class="print-field-value">
                  <span class="print-chip print-chip-${udCase?.status || 'unidentified'}">${udCase?.status || ''}</span>
                </div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Investigation Status</div>
                <div class="print-field-value">
                  <span class="print-chip print-chip-${udCase?.investigationStatus === 'pending' ? 'pending' : 'active'}">${udCase?.investigationStatus || ''}</span>
                </div>
              </div>
              <div class="print-field" style="grid-column: span 2">
                <div class="print-field-label">Location</div>
                <div class="print-field-value">${udCase?.location || ''}</div>
              </div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Deceased Information</div>
            <div class="print-field">
              <div class="print-field-label">Name</div>
              <div class="print-field-value">${udCase?.deceasedName || 'Unidentified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Address</div>
              <div class="print-field-value">${udCase?.deceasedAddress || 'Unknown'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Identification Status</div>
              <div class="print-field-value">
                <span class="print-chip print-chip-${udCase?.identificationStatus || 'unidentified'}">${udCase?.identificationStatus || 'unidentified'}</span>
              </div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Informant Information</div>
            <div class="print-field">
              <div class="print-field-label">Name</div>
              <div class="print-field-value">${udCase?.informantName || 'Not provided'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Relation</div>
              <div class="print-field-value">${udCase?.informantRelation || 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Contact</div>
              <div class="print-field-value">${udCase?.informantContact || 'Not provided'}</div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Post Mortem Details</div>
            <div class="print-field">
              <div class="print-field-label">Date</div>
              <div class="print-field-value">${udCase?.postMortemDate ? formatDate(udCase.postMortemDate) : 'Not conducted'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Doctor</div>
              <div class="print-field-value">${udCase?.postMortemDoctor || 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Hospital</div>
              <div class="print-field-value">${udCase?.postMortemHospital || 'Not specified'}</div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Case Details</div>
            <div class="print-field">
              <div class="print-field-label">Apparent Cause of Death</div>
              <div class="print-field-value">${udCase?.apparentCauseOfDeath || 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Assigned Officer</div>
              <div class="print-field-value">${
                udCase?.assignedOfficer 
                  ? `${udCase.assignedOfficer.firstName} ${udCase.assignedOfficer.lastName}` 
                  : (udCase?.assignedOfficerId || 'Not assigned')
              }</div>
            </div>
          </div>
          
          <div class="print-section">
            <div class="print-section-title">Case Description</div>
            <div class="print-field">
              <div class="print-field-value">${udCase?.description || 'No description provided'}</div>
            </div>
          </div>
          
          ${udCase?.remarks || udCase?.notes ? `
          <div class="print-section">
            <div class="print-section-title">Notes & Remarks</div>
            ${udCase?.remarks ? `
            <div class="print-field">
              <div class="print-field-label">Remarks</div>
              <div class="print-field-value">${udCase.remarks}</div>
            </div>
            ` : ''}
            ${udCase?.notes ? `
            <div class="print-field">
              <div class="print-field-label">Notes</div>
              <div class="print-field-value">${udCase.notes}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          ${udCase?.photoUrls && udCase?.photoUrls.length > 0 ? `
          <div class="print-section ${udCase?.photoUrls.length > 4 ? 'page-break' : ''}">
            <div class="print-section-title">Case Photos</div>
            <div class="print-photos">
              ${udCase.photoUrls.map((url, index) => 
                `<img src="${url}" alt="Case photo ${index + 1}" class="print-photo" />`
              ).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        
        <div class="print-footer">
          <p>Printed on ${new Date().toLocaleString()} | Case ID: ${udCase?.id || 'Unknown'}</p>
          <p>Created: ${udCase?.createdAt ? formatDate(udCase.createdAt) : ''} by ${
            udCase?.createdBy ? 
              (typeof udCase.createdBy === 'string' ? 
                udCase.createdBy : 
                `${udCase.createdBy.firstName} ${udCase.createdBy.lastName}`) : 
              'Unknown'
          }
          ${udCase?.lastModifiedBy ? 
            ` • Last Modified: ${udCase.updatedAt ? formatDate(udCase.updatedAt) : ''} by ${
              typeof udCase.lastModifiedBy === 'string' ? 
                udCase.lastModifiedBy : 
                `${udCase.lastModifiedBy.firstName} ${udCase.lastModifiedBy.lastName}`
            }` : ''}
          </p>
          <p>SURA @ All rights reserved by Otmalse Technologies </p>
        </div>
      `;
      
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>UD Case #${udCase?.caseNumber || 'Unknown'}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${caseHTML}
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 300);
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      setIsPrinting(false);
    }, 100);
  }, [udCase]);

  // Status color helpers
  const getStatusColor = (status: string | undefined): string => {
    if (status === 'active') return '#4caf50';
    if (status === 'archived') return '#ff9800';
    return '#f44336';
  };
  
  const getInvestigationColor = (status: string | undefined): string => {
    if (status === 'completed') return '#4caf50';
    if (status === 'investigation') return '#2196f3';
    return '#ff9800';
  };
  
  const getIdentificationColor = (status: string | undefined): string => {
    if (status === 'identified') return '#4caf50';
    if (status === 'partial') return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
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
          <Button
            startIcon={<RefreshIcon />}
          onClick={() => loadUDCase()}
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

  if (!udCase) {
    return (
      <PageContainer>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Case not found or data could not be loaded.
        </Alert>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => loadUDCase()}
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
      {/* Header and Actions */}
      <Box sx={{ mb: 4, bgcolor: 'background.default', borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            UD Case #{udCase.caseNumber}
          </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={udCase.status} 
              size="small"
                sx={{
                  bgcolor: alpha(getStatusColor(udCase.status), 0.1),
                  color: getStatusColor(udCase.status),
                  fontWeight: 500,
                  borderRadius: 4
                }}
            />
            <Chip 
              label={udCase.investigationStatus} 
              size="small"
                sx={{
                  bgcolor: alpha(getInvestigationColor(udCase.investigationStatus), 0.1),
                  color: getInvestigationColor(udCase.investigationStatus),
                  fontWeight: 500,
                  borderRadius: 4
                }}
            />
            <Chip 
              label={udCase.identificationStatus || 'unidentified'} 
              size="small"
                sx={{
                  bgcolor: alpha(getIdentificationColor(udCase.identificationStatus), 0.1),
                  color: getIdentificationColor(udCase.identificationStatus),
                  fontWeight: 500,
                  borderRadius: 4
                }}
              />
            </Box>
        </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              variant="contained"
              disabled={isPrinting}
              sx={{ 
                borderRadius: 2, 
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark }
              }}
            >
              Print
            </Button>
          <Button
            startIcon={<RefreshIcon />}
              onClick={() => loadUDCase()}
            variant="outlined"
              sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/records/type/ud_case')}
            variant="outlined"
              sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/records/edit/ud-case/${udCase.id}`)}
            variant="outlined"
              sx={{ borderRadius: 2 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="outlined"
            color="error"
            disabled={isDeleting}
              sx={{ borderRadius: 2 }}
          >
              Delete
          </Button>
          </Box>
        </Box>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      {/* Main content - Masonry-like grid layout */}
      <Box ref={printRef} sx={{ position: 'relative' }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(300px, 1fr))',
              md: 'repeat(auto-fill, minmax(350px, 1fr))'
            },
            gap: 3,
            alignItems: 'start'
          }}
        >
        {/* Case Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              gridColumn: { xs: 'auto', md: 'span 1' }
            }}
          >
            <SectionHeader 
              icon={<AssignmentIcon />} 
              title="Case Information" 
              color={theme.palette.primary.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldDisplay
                  label="Case Number"
                  value={udCase.caseNumber}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldDisplay
                  label="Date of Occurrence"
                  value={formatDate(udCase.dateOfOccurrence)}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Location"
                  icon={<LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  value={udCase.location}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Apparent Cause of Death"
                  value={udCase.apparentCauseOfDeath}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Assigned Officer"
                  value={
                    udCase.assignedOfficer ? 
                    `${udCase.assignedOfficer.firstName} ${udCase.assignedOfficer.lastName}` : 
                      udCase.assignedOfficerId
                  }
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Description"
                  value={udCase.description || 'No description provided'}
                />
              </Grid>
            </Grid>
          </Card>

        {/* Deceased Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              height: 'fit-content'
            }}
          >
            <SectionHeader 
              icon={<PersonIcon />} 
              title="Deceased Information" 
              color={theme.palette.primary.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Name"
                  value={udCase.deceasedName || 'Unidentified'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Address"
                  value={udCase.deceasedAddress || 'Unknown'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Identification Status
                  </Typography>
                <Chip 
                  label={udCase.identificationStatus || 'unidentified'} 
                  size="small"
                    sx={{
                      bgcolor: alpha(getIdentificationColor(udCase.identificationStatus), 0.1),
                      color: getIdentificationColor(udCase.identificationStatus),
                      fontWeight: 500,
                      borderRadius: 4
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Card>

        {/* Informant Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              height: 'fit-content'
            }}
          >
            <SectionHeader 
              icon={<PersonIcon />} 
              title="Informant Information" 
              color={theme.palette.info.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldDisplay
                  label="Name"
                  value={udCase.informantName}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldDisplay
                  label="Relation"
                  value={udCase.informantRelation || 'Not specified'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Address"
                  value={udCase.informantAddress}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Contact"
                  value={udCase.informantContact || 'Not provided'}
                />
              </Grid>
            </Grid>
          </Card>

        {/* Post Mortem Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              height: 'fit-content'
            }}
          >
            <SectionHeader 
              icon={<HospitalIcon />} 
              title="Post Mortem Information" 
              color={theme.palette.error.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldDisplay
                  label="Post Mortem Date"
                  value={udCase.postMortemDate ? formatDate(udCase.postMortemDate) : 'Not conducted'}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldDisplay
                  label="Doctor"
                  value={udCase.postMortemDoctor || 'Not specified'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Hospital"
                  value={udCase.postMortemHospital || 'Not specified'}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Notes & Remarks */}
          {(udCase.remarks || udCase.notes) && (
            <Card 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                gridColumn: { xs: 'auto', md: 'span 2' }
              }}
            >
              <SectionHeader 
                icon={<AssignmentIcon />} 
                title="Notes & Remarks" 
                color={theme.palette.warning.main}
              />
              
              <Grid container spacing={2}>
                {udCase.remarks && (
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Remarks"
                      value={udCase.remarks}
                    />
        </Grid>
                )}
                
                {udCase.notes && (
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Notes"
                      value={udCase.notes}
                    />
                  </Grid>
                )}
              </Grid>
            </Card>
          )}
        </Box>

        {/* Photos - Full width section */}
        {udCase.photoUrls && udCase.photoUrls.length > 0 && (
          <Card 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              mt: 3
            }}
          >
            <SectionHeader 
              icon={<PhotoIcon />} 
              title="Photos" 
              color={theme.palette.secondary.main}
            />
              
              <Grid container spacing={2}>
                {udCase.photoUrls.map((url, index) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                    <Box
                      component="img"
                      src={url}
                      alt={`Photo ${index + 1}`}
                      sx={{
                        width: '100%',
                      height: 180,
                        objectFit: 'cover',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => window.open(url, '_blank')}
                    />
                  </Grid>
                ))}
              </Grid>
            </Card>
        )}

        {/* Metadata */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
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
      </Box>
    </PageContainer>
  );
};

export default React.memo(UDCaseView); 