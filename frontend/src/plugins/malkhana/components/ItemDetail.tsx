import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  QrCode as QrCodeIcon} from '@mui/icons-material';

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
  
  const handleGenerateQrCode = async () => {
    if (!item) return;
    
    try {
      // Generate QR code if it doesn't exist
      if (!item.qrCodeUrl) {
        const qrCode = await malkhanaApi.generateQRCode(item.id);
        if (qrCode) {
          // Update item with QR code URL
          const updatedItem = await malkhanaApi.updateItem(item.id, { 
            qrCodeUrl: qrCode.qrCodeUrl 
          });
          if (updatedItem) {
        setItem(updatedItem);
          }
        }
      }
      
      setOpenQrDialog(true);
    } catch (err) {
      setError('Failed to generate QR code');
    }
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
      <div className="loading-container">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing API services...
        </Typography>
      </div>
    );
  }
  
  // Show loading state while Malkhana API initializes
  if (!malkhanaApi.isReady) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Initializing Malkhana module...
        </Typography>
      </div>
    );
  }
  
  if (loading && !item) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading item details...
        </Typography>
      </div>
    );
  }
  
  if (error && !item) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack}>Go Back</button>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="error-container">
        <h2>Item Not Found</h2>
        <p>The requested item could not be found.</p>
        <button onClick={handleBack}>Go Back</button>
      </div>
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
    <div className="item-detail">
      {loading && <div className="loading-overlay">Refreshing...</div>}
      
      <div className="detail-header">
        <button className="back-btn" onClick={handleBack}>Back</button>
        <h1>Evidence Item Details</h1>
        <div className="action-buttons">
          <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
          <button className="edit-btn" onClick={handleEdit}>
            Edit
          </button>
          {item.status === 'ACTIVE' && (
            <button className="dispose-btn" onClick={handleDispose}>
              Dispose
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="detail-card">
        <div className="detail-section">
          <h2>Registration Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Registry Number:</span>
              <span className="value">{item.registryNumber}</span>
            </div>
            <div className="detail-item">
              <span className="label">Mother Number:</span>
              <span className="value">{item.motherNumber}</span>
            </div>
            <div className="detail-item">
              <span className="label">Registry Type:</span>
              <span className="value">{item.registryType === 'BLACK_INK' ? 'Black Ink' : 'Red Ink'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Registry Year:</span>
              <span className="value">{item.registryYear}</span>
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h2>Item Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Case Number:</span>
              <span className="value">{item.caseNumber}</span>
            </div>
            <div className="detail-item">
              <span className="label">Category:</span>
              <span className="value">{item.category}</span>
            </div>
            <div className="detail-item">
              <span className="label">Date Received:</span>
              <span className="value">{new Date(item.dateReceived).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Received From:</span>
              <span className="value">{item.receivedFrom}</span>
            </div>
            <div className="detail-item full-width">
              <span className="label">Description:</span>
              <span className="value">{item.description}</span>
            </div>
            <div className="detail-item">
              <span className="label">Condition:</span>
              <span className="value">{item.condition}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value status-${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
          </div>
        </div>
        
        {item.shelfId && (
          <div className="detail-section">
            <h2>Storage Location</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Shelf ID:</span>
                <span className="value">{item.shelfId}</span>
              </div>
              <div className="detail-item">
                <span className="label">Shelf Location:</span>
                <span className="value">{item.shelfLocation || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
        
        {item.status === 'DISPOSED' && (
          <div className="detail-section">
            <h2>Disposal Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Disposal Date:</span>
                <span className="value">
                  {item.disposalDate ? new Date(item.disposalDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Approved By:</span>
                <span className="value">{item.disposalApprovedBy || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="label">Reason:</span>
                <span className="value">{item.disposalReason || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
        
        {item.notes && (
          <div className="detail-section">
            <h2>Notes</h2>
            <p className="notes">{item.notes}</p>
          </div>
          )}
          
          {item.photos && item.photos.length > 0 && (
          <div className="detail-section">
            <h2>Photos</h2>
            <div className="photos-grid">
                  {item.photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`Evidence item ${item.motherNumber} - ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="detail-section qr-code-section">
          <h2>QR Code</h2>
          {item.qrCodeUrl ? (
            <div>
              <img 
                src={item.qrCodeUrl} 
                alt={`QR Code for ${item.motherNumber}`} 
                className="qr-code"
              />
              <p>Scan this QR code to quickly access this item's details</p>
            </div>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGenerateQrCode}
              startIcon={<QrCodeIcon />}
            >
              Generate QR Code
            </Button>
          )}
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)}>
        <DialogTitle>Item QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {item.motherNumber}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {item.description}
            </Typography>
            
            {item.qrCodeUrl ? (
              <Box sx={{ my: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                <img 
                  src={item.qrCodeUrl} 
                  alt={`QR Code for ${item.motherNumber}`} 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            ) : (
            <Box sx={{ my: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Typography sx={{ fontSize: '8rem', color: theme.palette.primary.main }}>
                <QrCodeIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                  QR Code not available
              </Typography>
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
    </div>
  );
};

export default ItemDetail; 