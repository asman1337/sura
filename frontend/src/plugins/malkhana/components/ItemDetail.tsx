import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

import { MalkhanaItem } from '../types';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

/**
 * Component to display details for a single Malkhana item
 */
const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  const [item, setItem] = useState<MalkhanaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  useEffect(() => {
    const fetchItem = async () => {
      if (!id || !malkhanaApi.isReady) return;
      
      setLoading(true);
      try {
        const itemData = await malkhanaApi.getItemById(id);
        setItem(itemData);
        setError(null);
      } catch (err) {
        console.error(`Error fetching item ${id}:`, err);
        setError('Failed to load item. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id, malkhanaApi.isReady]);
  
  // Generate QR code data as JSON string
  const getQrCodeData = (item: MalkhanaItem) => {
    // Create a data structure that's useful for both web and mobile apps
    const qrData = {
      type: 'malkhana_item',
      id: item.id,
      motherNumber: item.motherNumber,
      registryNumber: item.registryNumber,
      registryType: item.registryType,
      registryYear: item.registryYear,
      timestamp: new Date().toISOString()
    };
    
    // Return JSON string of the data
    return JSON.stringify(qrData);
  };
  
  const handleGenerateQrCode = () => {
    if (!item) return;
    setOpenQrDialog(true);
  };
  
  const handleEdit = () => {
    navigate(`/malkhana/edit/${id}`);
  };
  
  const handleDispose = () => {
    navigate(`/malkhana/dispose/${id}`);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleRefresh = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const itemData = await malkhanaApi.getItemById(id);
      setItem(itemData);
      setError(null);
    } catch (err) {
      console.error(`Error refreshing item ${id}:`, err);
      setError('Failed to refresh item data. Please try again.');
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
  
  if (loading && !item) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading item details...
        </Typography>
      </Box>
    );
  }
  
  if (error && !item) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }
  
  if (!item) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Item Not Found
        </Typography>
        <Typography variant="body1" gutterBottom>
          The requested item could not be found.
        </Typography>
        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.palette.success.main;
      case 'DISPOSED':
        return theme.palette.error.main;
      case 'TRANSFERRED':
        return theme.palette.warning.main;
      case 'RELEASED':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ mr: 1 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="500">
            Evidence Item Details
          </Typography>
        </Box>
        
        <Box>
          <IconButton 
            onClick={handleRefresh} 
            disabled={loading}
            color="primary"
            aria-label="refresh"
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
          
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          
          {item.status === 'ACTIVE' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDispose}
            >
              Dispose
            </Button>
          )}
        </Box>
      </Box>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Paper>
      )}
      
      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="500" gutterBottom>
            Registration Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Number
              </Typography>
              <Typography variant="body1">
                {item.registryNumber}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mother Number
              </Typography>
              <Typography variant="body1">
                {item.motherNumber}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Type
              </Typography>
              <Typography variant="body1">
                {item.registryType === 'BLACK_INK' ? 'Black Ink' : 'Red Ink'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registry Year
              </Typography>
              <Typography variant="body1">
                {item.registryYear}
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="h6" fontWeight="500" gutterBottom>
            Item Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Case Number
              </Typography>
              <Typography variant="body1">
                {item.caseNumber}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1">
                {item.category}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Date Received
              </Typography>
              <Typography variant="body1">
                {new Date(item.dateReceived).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Received From
              </Typography>
              <Typography variant="body1">
                {item.receivedFrom}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Condition
              </Typography>
              <Typography variant="body1">
                {item.condition}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={item.status} 
                size="small"
                sx={{ 
                  bgcolor: `${getStatusColor(item.status)}20`,
                  color: getStatusColor(item.status),
                  fontWeight: 500
                }} 
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {item.description}
              </Typography>
            </Grid>
          </Grid>
          
          {item.shelfId && (
            <>
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Storage Location
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Shelf ID
                  </Typography>
                  <Typography variant="body1">
                    {item.shelfId}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Shelf Location
                  </Typography>
                  <Typography variant="body1">
                    {item.shelf?.location || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {item.status === 'DISPOSED' && (
            <>
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Disposal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Disposal Date
                  </Typography>
                  <Typography variant="body1">
                    {item.disposalDate ? new Date(item.disposalDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Approved By
                  </Typography>
                  <Typography variant="body1">
                    {item.disposalApprovedBy || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1">
                    {item.disposalReason || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          
          {item.notes && (
            <>
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1">
                  {item.notes}
                </Typography>
              </Box>
            </>
          )}
          
          {item.photos && item.photos.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Photos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {item.photos.map((photo, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box 
                      component="img"
                      src={photo}
                      alt={`Evidence item ${item.motherNumber} - ${index + 1}`}
                      sx={{ 
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          <Typography variant="h6" fontWeight="500" gutterBottom>
            QR Code
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            {item && (
              <>
                <Box 
                  sx={{ 
                    width: 200,
                    height: 200,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <QRCodeSVG 
                    value={getQrCodeData(item)}
                    size={180}
                    level="M"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Scan this QR code to quickly access this item's details
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* QR Code Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)}>
        <DialogTitle>Item QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {item?.motherNumber}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {item?.description}
            </Typography>
            
            {item && (
              <Box sx={{ my: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                <QRCodeSVG 
                  value={getQrCodeData(item)}
                  size={250}
                  level="M"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </Box>
            )}
            
            <Button variant="outlined" fullWidth>
              Print QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetail; 