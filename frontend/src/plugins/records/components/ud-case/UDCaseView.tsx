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
                <div class="print-field-label">Serial Number</div>
                <div class="print-field-value">${udCase?.serialNumber || 'Not specified'}</div>
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
              <div class="print-field">
                <div class="print-field-label">Final Form Status</div>
                <div class="print-field-value">
                  <span class="print-chip print-chip-${udCase?.finalFormStatus === 'draft' ? 'pending' : 'active'}">${udCase?.finalFormStatus || 'draft'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Police Station Information</div>
            <div class="print-field">
              <div class="print-field-label">Police Station Code</div>
              <div class="print-field-value">${udCase?.policeStationCode || 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Police Station Name</div>
              <div class="print-field-value">${udCase?.policeStationName || 'Not specified'}</div>
            </div>
          </div>

          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Location Information</div>
            <div class="print-field">
              <div class="print-field-label">Location</div>
              <div class="print-field-value">${udCase?.location || ''}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Exact Location</div>
              <div class="print-field-value">${udCase?.exactLocation || 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Nearest Landmark</div>
              <div class="print-field-value">${udCase?.nearestLandmark || 'Not specified'}</div>
            </div>
            ${udCase?.coordinates?.latitude || udCase?.coordinates?.longitude ? `
            <div class="print-field">
              <div class="print-field-label">Coordinates</div>
              <div class="print-field-value">${udCase?.coordinates?.latitude || 'N/A'}, ${udCase?.coordinates?.longitude || 'N/A'}</div>
            </div>
            ` : ''}
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
              <div class="print-field-label">Age</div>
              <div class="print-field-value">${udCase?.deceasedAge || 'Unknown'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Gender</div>
              <div class="print-field-value">${udCase?.deceasedGender || 'Unknown'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Occupation</div>
              <div class="print-field-value">${udCase?.deceasedOccupation || 'Unknown'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Nationality</div>
              <div class="print-field-value">${udCase?.deceasedNationality || 'Unknown'}</div>
            </div>            <div class="print-field">
              <div class="print-field-label">Identification Status</div>
              <div class="print-field-value">
                <span class="print-chip print-chip-${udCase?.identificationStatus || 'unidentified'}">${udCase?.identificationStatus || 'unidentified'}</span>
              </div>
            </div>
            ${udCase?.ageCategory ? `
            <div class="print-field">
              <div class="print-field-label">Age Category</div>
              <div class="print-field-value">${udCase.ageCategory}</div>
            </div>
            ` : ''}
            ${udCase?.deceasedReligion ? `
            <div class="print-field">
              <div class="print-field-label">Religion</div>
              <div class="print-field-value">${udCase.deceasedReligion}</div>
            </div>
            ` : ''}
            ${udCase?.deceasedCaste ? `
            <div class="print-field">
              <div class="print-field-label">Caste</div>
              <div class="print-field-value">${udCase.deceasedCaste}</div>
            </div>
            ` : ''}
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
            </div>          </div>
          
          ${udCase?.identifiedByName || udCase?.identifiedByMobile || udCase?.identifiedByRelation || udCase?.identifiedByAddress ? `
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Identified By Information</div>
            ${udCase?.identifiedByName ? `
            <div class="print-field">
              <div class="print-field-label">Name</div>
              <div class="print-field-value">${udCase.identifiedByName}</div>
            </div>
            ` : ''}
            ${udCase?.identifiedByMobile ? `
            <div class="print-field">
              <div class="print-field-label">Mobile</div>
              <div class="print-field-value">${udCase.identifiedByMobile}</div>
            </div>
            ` : ''}
            ${udCase?.identifiedByRelation ? `
            <div class="print-field">
              <div class="print-field-label">Relation</div>
              <div class="print-field-value">${udCase.identifiedByRelation}</div>
            </div>
            ` : ''}
            ${udCase?.identifiedByAddress ? `
            <div class="print-field">
              <div class="print-field-label">Address</div>
              <div class="print-field-value">${udCase.identifiedByAddress}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
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
          </div>

          ${udCase?.assignedOfficerName ? `
          <div class="print-section" style="width: 100%;">
            <div class="print-section-title">Assigned Officer Information</div>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-field-label">Officer Name</div>
                <div class="print-field-value">${udCase.assignedOfficerName}</div>
              </div>
              ${udCase.assignedOfficerBadgeNumber ? `
              <div class="print-field">
                <div class="print-field-label">Badge Number</div>
                <div class="print-field-value">${udCase.assignedOfficerBadgeNumber}</div>
              </div>
              ` : ''}
              ${udCase.assignedOfficerRank ? `
              <div class="print-field">
                <div class="print-field-label">Rank</div>
                <div class="print-field-value">${udCase.assignedOfficerRank}</div>
              </div>
              ` : ''}
              ${udCase.assignedOfficerDepartment ? `
              <div class="print-field">
                <div class="print-field-label">Department</div>
                <div class="print-field-value">${udCase.assignedOfficerDepartment}</div>
              </div>
              ` : ''}
              ${udCase.assignedOfficerContact ? `
              <div class="print-field">
                <div class="print-field-label">Contact</div>
                <div class="print-field-value">${udCase.assignedOfficerContact}</div>
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          ${udCase?.autopsyResults ? `
          <div class="print-section" style="width: 100%;">
            <div class="print-section-title">Detailed Autopsy Results</div>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-field-label">Cause of Death</div>
                <div class="print-field-value">${udCase.autopsyResults.cause_of_death || 'Not determined'}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Manner of Death</div>
                <div class="print-field-value">${udCase.autopsyResults.manner_of_death || 'Not determined'}</div>
              </div>
              <div class="print-field" style="grid-column: span 2">
                <div class="print-field-label">Autopsy Findings</div>
                <div class="print-field-value">${udCase.autopsyResults.findings || 'No findings recorded'}</div>
              </div>
              <div class="print-field" style="grid-column: span 2">
                <div class="print-field-label">Injuries Description</div>
                <div class="print-field-value">${udCase.autopsyResults.injuries_description || 'No injuries described'}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Toxicology Results</div>
                <div class="print-field-value">${udCase.autopsyResults.toxicology_results || 'Not available'}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Estimated Time of Death</div>
                <div class="print-field-value">${udCase.autopsyResults.time_of_death_estimate || 'Not estimated'}</div>
              </div>
            </div>
          </div>
          ` : ''}

          ${udCase?.finalFormSubmissionDate || udCase?.finalFormReviewedBy || udCase?.finalFormApprovedBy ? `
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Final Form Workflow</div>
            ${udCase?.finalFormSubmissionDate ? `
            <div class="print-field">
              <div class="print-field-label">Submission Date</div>
              <div class="print-field-value">${formatDate(udCase.finalFormSubmissionDate)}</div>
            </div>
            ` : ''}
            ${udCase?.finalFormReviewedBy ? `
            <div class="print-field">
              <div class="print-field-label">Reviewed By</div>
              <div class="print-field-value">${udCase.finalFormReviewedBy}</div>
            </div>
            ` : ''}
            ${udCase?.finalFormApprovedBy ? `
            <div class="print-field">
              <div class="print-field-label">Approved By</div>
              <div class="print-field-value">${udCase.finalFormApprovedBy}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
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
      {/* Enhanced Header with Case Information */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 4, 
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '100%',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%)',
            zIndex: 0
          }}
        />
        
        <Box sx={{ 
          px: { xs: 2, sm: 3, md: 4 }, 
          py: { xs: 3, sm: 4 },
          position: 'relative',
          zIndex: 1
        }}>
          {/* Main Header Content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            gap: { xs: 3, lg: 2 }
          }}>
            {/* Left Side - Case Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Case Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.75rem', sm: '2.125rem' }
                    }}
                  >
                    UD Case #{udCase.caseNumber}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Serial: {udCase.serialNumber || 'Not specified'} • Created: {formatDate(udCase.createdAt)}
                  </Typography>
                </Box>
              </Box>

              {/* Status Chips */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 1.5,
                alignItems: 'center'
              }}>
                <Chip 
                  label={udCase.status} 
                  size="medium"
                  sx={{
                    bgcolor: alpha(getStatusColor(udCase.status), 0.12),
                    color: getStatusColor(udCase.status),
                    fontWeight: 600,
                    borderRadius: 6,
                    px: 1,
                    height: 32,
                    fontSize: '0.875rem',
                    border: `1px solid ${alpha(getStatusColor(udCase.status), 0.2)}`
                  }}
                />
                <Chip 
                  label={udCase.investigationStatus} 
                  size="medium"
                  sx={{
                    bgcolor: alpha(getInvestigationColor(udCase.investigationStatus), 0.12),
                    color: getInvestigationColor(udCase.investigationStatus),
                    fontWeight: 600,
                    borderRadius: 6,
                    px: 1,
                    height: 32,
                    fontSize: '0.875rem',
                    border: `1px solid ${alpha(getInvestigationColor(udCase.investigationStatus), 0.2)}`
                  }}
                />
                <Chip 
                  label={udCase.identificationStatus || 'unidentified'} 
                  size="medium"
                  sx={{
                    bgcolor: alpha(getIdentificationColor(udCase.identificationStatus), 0.12),
                    color: getIdentificationColor(udCase.identificationStatus),
                    fontWeight: 600,
                    borderRadius: 6,
                    px: 1,
                    height: 32,
                    fontSize: '0.875rem',
                    border: `1px solid ${alpha(getIdentificationColor(udCase.identificationStatus), 0.2)}`
                  }}
                />
                <Chip 
                  label={udCase.finalFormStatus || 'draft'} 
                  size="medium"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    color: theme.palette.warning.main,
                    fontWeight: 600,
                    borderRadius: 6,
                    px: 1,
                    height: 32,
                    fontSize: '0.875rem',
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}
                />
              </Box>
            </Box>

            {/* Right Side - Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: { xs: 'flex-start', lg: 'flex-end' },
              width: { xs: '100%', lg: 'auto' }
            }}>
              {/* Primary Actions */}
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                variant="contained"
                disabled={isPrinting}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': { 
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.primary.main, 0.3)
                  },
                  minWidth: { xs: 'auto', sm: '120px' }
                }}
              >
                {isPrinting ? 'Printing...' : 'Print'}
              </Button>

              <Button
                startIcon={<EditIcon />}
                onClick={() => navigate(`/records/edit/ud-case/${udCase.id}`)}
                variant="contained"
                color="secondary"
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  '&:hover': { 
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`
                  },
                  minWidth: { xs: 'auto', sm: '100px' }
                }}
              >
                Edit
              </Button>

              {/* Secondary Actions */}
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => loadUDCase()}
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  '&:hover': { 
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-1px)'
                  },
                  minWidth: { xs: 'auto', sm: '100px' }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Refresh</Box>
              </Button>

              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/records/type/ud_case')}
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.grey[500], 0.3),
                  color: theme.palette.grey[700],
                  backgroundColor: alpha(theme.palette.grey[500], 0.03),
                  '&:hover': { 
                    borderColor: theme.palette.grey[500],
                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                    transform: 'translateY(-1px)'
                  },
                  minWidth: { xs: 'auto', sm: '100px' }
                }}
              >
                Back
              </Button>

              <Button
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                variant="outlined"
                color="error"
                disabled={isDeleting}
                sx={{ 
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  backgroundColor: alpha(theme.palette.error.main, 0.03),
                  '&:hover': { 
                    borderColor: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    borderColor: alpha(theme.palette.error.main, 0.2),
                    color: alpha(theme.palette.error.main, 0.5)
                  },
                  minWidth: { xs: 'auto', sm: '100px' }
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Box>
          </Box>

          {/* Quick Info Bar */}
          <Box sx={{ 
            mt: 3, 
            pt: 3, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            },
            gap: 2
          }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Location
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                {udCase.location || 'Not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Deceased
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                {udCase.deceasedName || 'Unidentified'}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Station
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                {udCase.policeStationName || udCase.policeStationCode || 'Not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Officer
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                {udCase.assignedOfficerName || 'Not assigned'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      {/* Main content - Enhanced sectioned layout */}
      <Box ref={printRef} sx={{ position: 'relative' }}>
        {/* Case Overview Section */}
        <Card 
          elevation={0} 
          sx={{ 
            p: 4,
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
          }}
        >
          <SectionHeader 
            icon={<AssignmentIcon />} 
            title="Case Overview" 
            color={theme.palette.primary.main}
          />
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: 'background.paper',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                height: '100%'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  Case Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FieldDisplay
                      label="Case Number"
                      value={udCase.caseNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FieldDisplay
                      label="Serial Number"
                      value={udCase.serialNumber || 'Not specified'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Date of Occurrence"
                      value={formatDate(udCase.dateOfOccurrence)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Apparent Cause of Death"
                      value={udCase.apparentCauseOfDeath}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: 'background.paper',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                height: '100%'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', fontWeight: 600 }}>
                  Status Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Investigation Status
                      </Typography>
                      <Chip 
                        label={udCase.investigationStatus || 'pending'} 
                        size="medium"
                        sx={{
                          bgcolor: alpha(getInvestigationColor(udCase.investigationStatus), 0.1),
                          color: getInvestigationColor(udCase.investigationStatus),
                          fontWeight: 600,
                          borderRadius: 6,
                          px: 2
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Identification Status
                      </Typography>
                      <Chip 
                        label={udCase.identificationStatus || 'unidentified'} 
                        size="medium"
                        sx={{
                          bgcolor: alpha(getIdentificationColor(udCase.identificationStatus), 0.1),
                          color: getIdentificationColor(udCase.identificationStatus),
                          fontWeight: 600,
                          borderRadius: 6,
                          px: 2
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Final Form Status
                      </Typography>
                      <Chip 
                        label={udCase.finalFormStatus || 'draft'} 
                        size="medium"
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 600,
                          borderRadius: 6,
                          px: 2
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {udCase.description && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                    Case Description
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {udCase.description}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>

        {/* People & Location Information Section */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'repeat(2, 1fr)'
            },
            gap: 3,
            alignItems: 'start',
            mb: 3
          }}
        >
        {/* Left Column - People Information */}
        <Box>
          {/* Deceased Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)} 0%, ${alpha(theme.palette.error.main, 0.06)} 100%)`
            }}
          >
            <SectionHeader 
              icon={<PersonIcon />} 
              title="Deceased Information" 
              color={theme.palette.error.main}
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

              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Age"
                  value={udCase.deceasedAge || 'Unknown'}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Gender"
                  value={udCase.deceasedGender || 'Unknown'}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Occupation"
                  value={udCase.deceasedOccupation || 'Unknown'}
                />
              </Grid>              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Nationality"
                  value={udCase.deceasedNationality || 'Unknown'}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Age Category"
                  value={udCase.ageCategory || 'Unknown'}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Religion"
                  value={udCase.deceasedReligion || 'Unknown'}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FieldDisplay
                  label="Caste"
                  value={udCase.deceasedCaste || 'Unknown'}
                />
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
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`
            }}
          >
            <SectionHeader 
              icon={<PersonIcon />} 
              title="Informant Information" 
              color={theme.palette.info.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Name"
                  value={udCase.informantName || 'Not provided'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Relation"
                  value={udCase.informantRelation || 'Not specified'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Address"
                  value={udCase.informantAddress || 'Not provided'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Contact"
                  value={udCase.informantContact || 'Not provided'}
                />
              </Grid>            </Grid>
          </Card>

          {/* Identified By Information */}
          {(udCase.identifiedByName || udCase.identifiedByAddress || udCase.identifiedByMobile || udCase.identifiedByRelation) && (
            <Card 
              elevation={0} 
              sx={{ 
                p: 3,
                borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                mt: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`
              }}
            >
              <SectionHeader 
                icon={<PersonIcon />} 
                title="Identified By Information" 
                color={theme.palette.secondary.main}
              />
              
              <Grid container spacing={2}>
                {udCase.identifiedByName && (
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Name"
                      value={udCase.identifiedByName}
                    />
                  </Grid>
                )}
                
                {udCase.identifiedByRelation && (
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Relation to Deceased"
                      value={udCase.identifiedByRelation}
                    />
                  </Grid>
                )}
                
                {udCase.identifiedByMobile && (
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Mobile Number"
                      value={udCase.identifiedByMobile}
                    />
                  </Grid>
                )}
                
                {udCase.identifiedByAddress && (
                  <Grid size={{ xs: 12 }}>
                    <FieldDisplay
                      label="Address"
                      value={udCase.identifiedByAddress}
                    />
                  </Grid>
                )}
              </Grid>
            </Card>
          )}
        </Box>

        {/* Right Column - Location & Administrative Information */}
        <Box>
          {/* Location Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.success.main, 0.06)} 100%)`
            }}
          >
            <SectionHeader 
              icon={<LocationIcon />} 
              title="Location Information" 
              color={theme.palette.success.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Location"
                  icon={<LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  value={udCase.location}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Exact Location"
                  value={udCase.exactLocation || 'Not specified'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Nearest Landmark"
                  value={udCase.nearestLandmark || 'Not specified'}
                />
              </Grid>

              {(udCase.coordinates?.latitude || udCase.coordinates?.longitude) && (
                <>
                  <Grid size={{ xs: 6 }}>
                    <FieldDisplay
                      label="Latitude"
                      value={udCase.coordinates.latitude || 'Not available'}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <FieldDisplay
                      label="Longitude"
                      value={udCase.coordinates.longitude || 'Not available'}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Card>

          {/* Police Station Information */}
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`
            }}
          >
            <SectionHeader 
              icon={<AssignmentIcon />} 
              title="Police Station Information" 
              color={theme.palette.primary.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Police Station Code"
                  value={udCase.policeStationCode || 'Not specified'}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Police Station Name"
                  value={udCase.policeStationName || 'Not specified'}
                />
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Box>

      {/* Assigned Officer Section */}
      {udCase.assignedOfficerName && (
        <Card 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`
          }}
        >
          <SectionHeader 
            icon={<PersonIcon />} 
            title="Assigned Officer Information" 
            color={theme.palette.secondary.main}
          />
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FieldDisplay
                label="Officer Name"
                value={udCase.assignedOfficerName}
              />
            </Grid>
            {udCase.assignedOfficerBadgeNumber && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FieldDisplay
                  label="Badge Number"
                  value={udCase.assignedOfficerBadgeNumber}
                />
              </Grid>
            )}
            {udCase.assignedOfficerRank && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FieldDisplay
                  label="Rank"
                  value={udCase.assignedOfficerRank}
                />
              </Grid>
            )}
            {udCase.assignedOfficerDepartment && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FieldDisplay
                  label="Department"
                  value={udCase.assignedOfficerDepartment}
                />
              </Grid>
            )}
            {udCase.assignedOfficerContact && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FieldDisplay
                  label="Contact"
                  value={udCase.assignedOfficerContact}
                />
              </Grid>
            )}
          </Grid>
        </Card>
      )}

      {/* Medical Information Section */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            lg: udCase.autopsyResults ? 'repeat(2, 1fr)' : '1fr'
          },
          gap: 3,
          alignItems: 'start',
          mb: 3
        }}
      >
        {/* Post Mortem Information */}
        <Card 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.02)} 0%, ${alpha(theme.palette.warning.main, 0.06)} 100%)`
          }}
        >
          <SectionHeader 
            icon={<HospitalIcon />} 
            title="Post Mortem Information" 
            color={theme.palette.warning.main}
          />
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FieldDisplay
                label="Post Mortem Date"
                value={udCase.postMortemDate ? formatDate(udCase.postMortemDate) : 'Not conducted'}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
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

        {/* Detailed Autopsy Results */}
        {udCase.autopsyResults && (
          <Card 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)} 0%, ${alpha(theme.palette.error.main, 0.06)} 100%)`
            }}
          >
            <SectionHeader 
              icon={<HospitalIcon />} 
              title="Detailed Autopsy Results" 
              color={theme.palette.error.main}
            />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Cause of Death"
                  value={udCase.autopsyResults.cause_of_death || 'Not determined'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Manner of Death"
                  value={udCase.autopsyResults.manner_of_death || 'Not determined'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Autopsy Findings"
                  value={udCase.autopsyResults.findings || 'No findings recorded'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Injuries Description"
                  value={udCase.autopsyResults.injuries_description || 'No injuries described'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Toxicology Results"
                  value={udCase.autopsyResults.toxicology_results || 'Not available'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FieldDisplay
                  label="Estimated Time of Death"
                  value={udCase.autopsyResults.time_of_death_estimate || 'Not estimated'}
                />
              </Grid>
            </Grid>
          </Card>
        )}
      </Box>

      {/* Final Form Workflow Section */}
      {(udCase.finalFormSubmissionDate || udCase.finalFormReviewedBy || udCase.finalFormApprovedBy) && (
        <Card 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.success.main, 0.06)} 100%)`
          }}
        >
          <SectionHeader 
            icon={<AssignmentIcon />} 
            title="Final Form Workflow" 
            color={theme.palette.success.main}
          />
          
          <Grid container spacing={3}>
            {udCase.finalFormSubmissionDate && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldDisplay
                  label="Submission Date"
                  value={formatDate(udCase.finalFormSubmissionDate)}
                />
              </Grid>
            )}

            {udCase.finalFormReviewedBy && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldDisplay
                  label="Reviewed By"
                  value={udCase.finalFormReviewedBy}
                />
              </Grid>
            )}

            {udCase.finalFormApprovedBy && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldDisplay
                  label="Approved By"
                  value={udCase.finalFormApprovedBy}
                />
              </Grid>
            )}
          </Grid>
        </Card>
      )}

      {/* Notes & Remarks Section */}
      {(udCase.remarks || udCase.notes) && (
        <Card 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`
          }}
        >
          <SectionHeader 
            icon={<AssignmentIcon />} 
            title="Notes & Remarks" 
            color={theme.palette.info.main}
          />
          
          <Grid container spacing={2}>
            {udCase.remarks && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                    Remarks
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {udCase.remarks}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {udCase.notes && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {udCase.notes}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>
      )}

      {/* Photos Section - Full width */}
      {udCase.photoUrls && udCase.photoUrls.length > 0 && (
        <Card 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`
          }}
        >
          <SectionHeader 
            icon={<PhotoIcon />} 
            title={`Case Photos (${udCase.photoUrls.length})`} 
            color={theme.palette.secondary.main}
          />
            
          <Grid container spacing={3}>
            {udCase.photoUrls.map((url, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={index}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => window.open(url, '_blank')}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`Photo ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      p: 1,
                      color: 'white'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Photo {index + 1}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* Metadata Footer */}
      <Box sx={{ 
        p: 3, 
        borderRadius: 3, 
        bgcolor: alpha(theme.palette.grey[500], 0.05),
        border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
        textAlign: 'center'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Case ID: {udCase.id}
        </Typography>
      </Box>
    </Box>
    </PageContainer>
  );
};

export default React.memo(UDCaseView); 