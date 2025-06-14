import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Photo as PhotoIcon,
  CheckCircle as CheckCircleIcon,
  LocalMall as SellIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useRecords } from '../../hooks/useRecords';
import { StolenPropertyRecord } from '../../types';
import { PageContainer } from '../common';
import { formatDate, formatCurrency } from '../../utils/formatters';

const StolenPropertyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, loading, error, deleteRecord, markAsRecovered, markAsSold } = useRecords();
  const [property, setProperty] = useState<StolenPropertyRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Recovery dialog state
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [recoveryDate, setRecoveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [recoveryRemarks, setRecoveryRemarks] = useState('');
  const [recoveryNotes, setRecoveryNotes] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Sale dialog state
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState(0);
  const [dateOfRemittance, setDateOfRemittance] = useState(new Date().toISOString().split('T')[0]);
  const [disposalMethod, setDisposalMethod] = useState('');
  const [saleRemarks, setSaleRemarks] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      try {
        const record = await getRecord(id, 'stolen_property') as StolenPropertyRecord;
        setProperty(record);
      } catch (err) {
        console.error('Error loading property record:', err);
      }
    };
    
    loadProperty();
  }, [id, getRecord]);

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this property record? This action cannot be undone.')) {
      setIsDeleting(true);
      setActionError(null);
      
      try {
        await deleteRecord(id, 'stolen_property');
        navigate('/records/type/stolen_property');
      } catch (err) {
        console.error('Error deleting property record:', err);
        setActionError('Failed to delete property record. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const handleRecoverySubmit = async () => {
    if (!id) return;
    
    setIsRecovering(true);
    setActionError(null);
    
    try {
      const updatedProperty = await markAsRecovered(id, {
        recoveryDate,
        remarks: recoveryRemarks,
        notes: recoveryNotes
      });
      
      setProperty(updatedProperty);
      setRecoveryDialogOpen(false);
    } catch (err) {
      console.error('Error marking property as recovered:', err);
      setActionError('Failed to mark property as recovered. Please try again.');
    } finally {
      setIsRecovering(false);
    }
  };
  
  const handleSaleSubmit = async () => {
    if (!id) return;
    
    setIsSelling(true);
    setActionError(null);
    
    try {
      const updatedProperty = await markAsSold(id, {
        soldPrice: Number(soldPrice),
        dateOfRemittance,
        disposalMethod,
        remarks: saleRemarks,
        notes: saleNotes
      });
      
      setProperty(updatedProperty);
      setSaleDialogOpen(false);
    } catch (err) {
      console.error('Error marking property as sold:', err);
      setActionError('Failed to mark property as sold. Please try again.');
    } finally {
      setIsSelling(false);
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
          .print-chip-reported { background: #ffebee; color: #c62828; }
          .print-chip-investigation { background: #e3f2fd; color: #1565c0; }
          .print-chip-recovered { background: #e8f5e9; color: #2e7d32; }
          
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
      const propertyHTML = `
        <div class="print-header">
          <h1 class="document-title">Stolen Property Report</h1>
          <p class="document-id">Property #${property?.propertyId || 'Unknown'}</p>
        </div>
        
        <div class="print-container">
          <div class="print-section" style="width: 100%;">
            <div class="print-section-title">Property Overview</div>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-field-label">Property ID</div>
                <div class="print-field-value">${property?.propertyId || ''}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Date of Theft/Finding</div>
                <div class="print-field-value">${property?.dateOfTheft ? formatDate(property.dateOfTheft) : ''}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Status</div>
                <div class="print-field-value">
                  <span class="print-chip print-chip-${property?.status || ''}">${property?.status || ''}</span>
                </div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Recovery Status</div>
                <div class="print-field-value">
                  <span class="print-chip print-chip-${property?.recoveryStatus || ''}">${property?.recoveryStatus || ''}</span>
                </div>
              </div>
              <div class="print-field" style="grid-column: span 2">
                <div class="print-field-label">Location</div>
                <div class="print-field-value">${property?.location || ''}</div>
              </div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Property Details</div>
            <div class="print-field">
              <div class="print-field-label">Property Type</div>
              <div class="print-field-value">${property?.propertyType || ''}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Property Source</div>
              <div class="print-field-value">${property?.propertySource || ''}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Estimated Value</div>
              <div class="print-field-value">${formatCurrency(property?.estimatedValue || 0)}</div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Owner Information</div>
            <div class="print-field">
              <div class="print-field-label">Owner Name</div>
              <div class="print-field-value">${property?.ownerName || 'Unknown'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Contact</div>
              <div class="print-field-value">${property?.ownerContact || 'Not provided'}</div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Incident Details</div>
            <div class="print-field">
              <div class="print-field-label">Found By</div>
              <div class="print-field-value">${property?.foundBy || 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Date of Receipt</div>
              <div class="print-field-value">${property?.dateOfReceipt ? formatDate(property.dateOfReceipt) : 'Not specified'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Received By</div>
              <div class="print-field-value">${property?.receivedBy || 'Not specified'}</div>
            </div>
          </div>
          
          <div class="print-section" style="width: calc(50% - 6px);">
            <div class="print-section-title">Case Details</div>
            <div class="print-field">
              <div class="print-field-label">Linked Case</div>
              <div class="print-field-value">${property?.linkedCaseNumber || 'None'}</div>
            </div>
            <div class="print-field">
              <div class="print-field-label">Recovery Date</div>
              <div class="print-field-value">${property?.recoveryDate ? formatDate(property.recoveryDate) : 'Not recovered'}</div>
            </div>
          </div>
          
          <div class="print-section">
            <div class="print-section-title">Property Description</div>
            <div class="print-field">
              <div class="print-field-value">${property?.description || 'No description provided'}</div>
            </div>
          </div>
          
          ${(property?.isSold || property?.soldPrice || property?.dateOfRemittance) ? `
          <div class="print-section">
            <div class="print-section-title">Sale/Disposal Information</div>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-field-label">Sale Status</div>
                <div class="print-field-value">${property?.isSold ? 'Sold/Disposed' : 'Not Sold'}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Sale Price</div>
                <div class="print-field-value">${property?.soldPrice ? formatCurrency(property.soldPrice) : 'N/A'}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Date of Remittance</div>
                <div class="print-field-value">${property?.dateOfRemittance ? formatDate(property.dateOfRemittance) : 'N/A'}</div>
              </div>
              <div class="print-field">
                <div class="print-field-label">Disposal Method</div>
                <div class="print-field-value">${property?.disposalMethod || 'Not specified'}</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${property?.remarks || property?.notes ? `
          <div class="print-section">
            <div class="print-section-title">Notes & Remarks</div>
            ${property?.remarks ? `
            <div class="print-field">
              <div class="print-field-label">Remarks</div>
              <div class="print-field-value">${property.remarks}</div>
            </div>
            ` : ''}
            ${property?.notes ? `
            <div class="print-field">
              <div class="print-field-label">Notes</div>
              <div class="print-field-value">${property.notes}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          ${property?.photoUrls && property?.photoUrls.length > 0 ? `
          <div class="print-section ${property?.photoUrls.length > 4 ? 'page-break' : ''}">
            <div class="print-section-title">Property Photos</div>
            <div class="print-photos">
              ${property.photoUrls.map((url, index) => 
                `<img src="${url}" alt="Property photo ${index + 1}" class="print-photo" />`
              ).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        
        <div class="print-footer">
          <p>Printed on ${new Date().toLocaleString()} | Property ID: ${property?.id || 'Unknown'}</p>
          <p>Created: ${property?.createdAt ? formatDate(property.createdAt) : ''} by ${
            property?.createdBy ? 
              (typeof property.createdBy === 'string' ? 
                property.createdBy : 
                `${property.createdBy.firstName} ${property.createdBy.lastName}`) : 
              'Unknown'
          }
          ${property?.lastModifiedBy ? 
            ` • Last Modified: ${property.updatedAt ? formatDate(property.updatedAt) : ''} by ${
              typeof property.lastModifiedBy === 'string' ? 
                property.lastModifiedBy : 
                `${property.lastModifiedBy.firstName} ${property.lastModifiedBy.lastName}`
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
          <title>Stolen Property #${property?.propertyId || 'Unknown'}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${propertyHTML}
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
  }, [property]);

  if (loading || !property) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/records')}
          variant="outlined"
        >
          Back to Records
        </Button>
      </PageContainer>
    );
  }

  const isPropertyRecovered = property.recoveryStatus === 'recovered';
  const isPropertySold = property.isSold;

  return (
    <PageContainer>
      {/* Header with actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Property #{property.propertyId}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label={property.status} 
              color={property.status === 'active' ? 'success' : property.status === 'archived' ? 'warning' : 'error'} 
              size="small"
            />
            <Chip 
              label={property.recoveryStatus} 
              color={
                property.recoveryStatus === 'reported' ? 'error' : 
                property.recoveryStatus === 'investigation' ? 'warning' : 
                property.recoveryStatus === 'recovered' ? 'success' : 
                'default'
              } 
              size="small"
            />
            <Chip 
              label={property.propertySource} 
              color="primary"
              size="small"
            />
            {property.isSold && (
              <Chip 
                label="Sold" 
                color="success"
                size="small"
              />
            )}
          </Stack>
        </Box>
        <Box>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            variant="contained"
            disabled={isPrinting}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/records/type/stolen_property')}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/records/edit/${property.id}`)}
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

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {actionError}
        </Alert>
      )}

      {/* Action buttons for recovery and sale */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          disabled={isPropertyRecovered}
          onClick={() => setRecoveryDialogOpen(true)}
        >
          {isPropertyRecovered ? 'Already Recovered' : 'Mark as Recovered'}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SellIcon />}
          disabled={isPropertySold || !isPropertyRecovered}
          onClick={() => setSaleDialogOpen(true)}
        >
          {isPropertySold ? 'Already Sold' : 'Mark as Sold/Disposed'}
        </Button>
      </Box>

      {/* Main content */}
      <Box ref={printRef} sx={{ position: 'relative' }}>
      <Grid container spacing={3}>
        {/* Property Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 1 }} /> Property Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Property ID</Typography>
                <Typography variant="body1" gutterBottom>{property.propertyId}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Property Type</Typography>
                <Typography variant="body1" gutterBottom>{property.propertyType}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Property Source</Typography>
                <Typography variant="body1" gutterBottom>{property.propertySource}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Estimated Value</Typography>
                <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  {formatCurrency(property.estimatedValue)}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1" gutterBottom>{property.description}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Incident Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1 }} /> Incident Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Date of Theft/Finding</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(property.dateOfTheft)}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Found By</Typography>
                <Typography variant="body1" gutterBottom>{property.foundBy}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  {property.location}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Linked Case</Typography>
                <Typography variant="body1" gutterBottom>
                  {property.linkedCaseNumber || 'None'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Date of Receipt</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(property.dateOfReceipt)}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Received By</Typography>
                <Typography variant="body1" gutterBottom>{property.receivedBy || 'Not specified'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Owner Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} /> Owner Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Owner Name</Typography>
                <Typography variant="body1" gutterBottom>{property.ownerName || 'Unknown/Not specified'}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography variant="body1" gutterBottom>{property.ownerContact || 'Not provided'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Recovery Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} /> Recovery Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Recovery Status</Typography>
                <Chip 
                  label={property.recoveryStatus} 
                  color={
                    property.recoveryStatus === 'reported' ? 'error' : 
                    property.recoveryStatus === 'investigation' ? 'warning' : 
                    property.recoveryStatus === 'recovered' ? 'success' : 
                    'default'
                  } 
                  size="small"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">Recovery Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {property.recoveryDate ? formatDate(property.recoveryDate) : 'Not recovered'}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Sale/Disposal Information */}
        {(property.isSold || property.soldPrice || property.dateOfRemittance) && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SellIcon sx={{ mr: 1 }} /> Sale/Disposal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">Sale Status</Typography>
                  <Chip 
                    label={property.isSold ? 'Sold/Disposed' : 'Not Sold'} 
                    color={property.isSold ? 'success' : 'default'} 
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">Sale Price</Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.soldPrice ? formatCurrency(property.soldPrice) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Remittance</Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.dateOfRemittance ? formatDate(property.dateOfRemittance) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">Disposal Method</Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.disposalMethod || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}

        {/* Photos */}
        {property.photoUrls && property.photoUrls.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PhotoIcon sx={{ mr: 1 }} /> Photos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {property.photoUrls.map((url, index) => (
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
                <Typography variant="body1" gutterBottom>{property.remarks || 'No remarks'}</Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                <Typography variant="body1" gutterBottom>{property.notes || 'No notes'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Metadata */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created: {formatDate(property.createdAt)} by {typeof property.createdBy === 'string' ? property.createdBy : property.createdBy.firstName + ' ' + property.createdBy.lastName}
              {property.lastModifiedBy && 
                ` • Last Modified: ${formatDate(property.updatedAt)} by ${typeof property.lastModifiedBy === 'string' ? property.lastModifiedBy : property.lastModifiedBy.firstName + ' ' + property.lastModifiedBy.lastName}`
              }
            </Typography>
          </Paper>
        </Grid>
      </Grid>
                </Box>

      {/* Recovery Dialog */}
      <Dialog open={recoveryDialogOpen} onClose={() => setRecoveryDialogOpen(false)}>
        <DialogTitle>Mark Property as Recovered</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Recovery Date"
              type="date"
              fullWidth
              margin="normal"
              value={recoveryDate}
              onChange={(e) => setRecoveryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Remarks"
              fullWidth
              margin="normal"
              value={recoveryRemarks}
              onChange={(e) => setRecoveryRemarks(e.target.value)}
              placeholder="Brief remarks about recovery"
            />
            
            <TextField
              label="Notes"
              fullWidth
              margin="normal"
              value={recoveryNotes}
              onChange={(e) => setRecoveryNotes(e.target.value)}
              placeholder="Detailed notes about recovery process"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecoveryDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRecoverySubmit} 
            variant="contained" 
            color="success"
            disabled={isRecovering || !recoveryDate}
          >
            {isRecovering ? 'Processing...' : 'Mark as Recovered'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sale Dialog */}
      <Dialog open={saleDialogOpen} onClose={() => setSaleDialogOpen(false)}>
        <DialogTitle>Mark Property as Sold/Disposed</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Sale Price"
              type="number"
              fullWidth
              margin="normal"
              value={soldPrice}
              onChange={(e) => setSoldPrice(Number(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Date of Remittance"
              type="date"
              fullWidth
              margin="normal"
              value={dateOfRemittance}
              onChange={(e) => setDateOfRemittance(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Disposal Method"
              fullWidth
              margin="normal"
              value={disposalMethod}
              onChange={(e) => setDisposalMethod(e.target.value)}
              placeholder="e.g., Auction, Court Order, Returned to Owner"
            />
            
            <TextField
              label="Remarks"
              fullWidth
              margin="normal"
              value={saleRemarks}
              onChange={(e) => setSaleRemarks(e.target.value)}
              placeholder="Brief remarks about sale/disposal"
            />
            
            <TextField
              label="Notes"
              fullWidth
              margin="normal"
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              placeholder="Detailed notes about sale/disposal process"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSelling || !dateOfRemittance || !disposalMethod}
          >
            {isSelling ? 'Processing...' : 'Mark as Sold/Disposed'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StolenPropertyView; 