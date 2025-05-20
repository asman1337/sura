import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  QrCode as QrCodeIcon,
  Shelves as ShelvesIcon
} from '@mui/icons-material';

import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem } from '../types';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [item, setItem] = useState<MalkhanaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  
  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // First try Black Ink registry
        const blackInkRegistry = await malkhanaService.getBlackInkRegistry();
        let foundItem = blackInkRegistry.items.find(item => item.id === id);
        
        // If not in Black Ink, try Red Ink registry
        if (!foundItem) {
          const redInkRegistry = await malkhanaService.getRedInkRegistry();
          foundItem = redInkRegistry.items.find(item => item.id === id);
        }
        
        if (foundItem) {
          setItem(foundItem);
        } else {
          setError(`Item with ID ${id} not found`);
        }
      } catch (err) {
        setError('Failed to load item details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadItem();
  }, [id]);
  
  const handleGenerateQrCode = async () => {
    if (!item) return;
    
    try {
      // Generate QR code if it doesn't exist
      if (!item.qrCodeUrl) {
        const qrCode = await malkhanaService.generateQRCode(item);
        const updatedItem = await malkhanaService.updateItem(item.id, { qrCodeUrl: qrCode });
        setItem(updatedItem);
      }
      
      setOpenQrDialog(true);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading item details...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!item) {
    return (
      <Alert severity="warning" sx={{ mt: 3 }}>
        Item not found
      </Alert>
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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/malkhana" color="inherit">
            Malkhana
          </Link>
          {item.registryType === 'BLACK_INK' ? (
            <Link component={RouterLink} to="/malkhana/black-ink" color="inherit">
              Black Ink Registry
            </Link>
          ) : (
            <Link component={RouterLink} to="/malkhana/red-ink" color="inherit">
              Red Ink Registry
            </Link>
          )}
          <Typography color="textPrimary">Item Details</Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          {item.description}
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            component={RouterLink}
            to={item.registryType === 'BLACK_INK' ? '/malkhana/black-ink' : '/malkhana/red-ink'}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/malkhana/edit/${item.id}`}
            disabled={item.status !== 'ACTIVE'}
          >
            Edit
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8}}>
          <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardHeader 
              title="Item Information" 
              action={
                <Chip 
                  label={item.status} 
                  sx={{ 
                    backgroundColor: `${getStatusColor(item.status)}20`,
                    color: getStatusColor(item.status),
                    fontWeight: 500
                  }}
                />
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm:6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Mother Number (Permanent ID)
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {item.motherNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm:6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Current Registry Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {item.registryNumber} ({item.registryType === 'BLACK_INK' ? 'Black Ink' : 'Red Ink'})
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm:6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Case Number
                    </Typography>
                    <Typography variant="body1">
                      {item.caseNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm:6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {item.category}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm:6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Date Received
                    </Typography>
                    <Typography variant="body1">
                      {new Date(item.dateReceived).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm:6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Received From
                    </Typography>
                    <Typography variant="body1">
                      {item.receivedFrom}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Condition
                    </Typography>
                    <Typography variant="body1">
                      {item.condition}
                    </Typography>
                  </Box>
                </Grid>
                {item.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {item.notes}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {item.status === 'DISPOSED' && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Divider />
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Disposal Information
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm:6 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Disposal Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(item.disposalDate!).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm:6 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Approved By
                        </Typography>
                        <Typography variant="body1">
                          {item.disposalApprovedBy}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Disposal Reason
                        </Typography>
                        <Typography variant="body1">
                          {item.disposalReason}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
          
          {/* Historical Red Ink IDs */}
          {item.redInkHistory && item.redInkHistory.length > 0 && (
            <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader 
                title="Historical Red Ink Registry Numbers" 
                avatar={<HistoryIcon color="primary" />}
              />
              <Divider />
              <CardContent>
                <List disablePadding>
                  {item.redInkHistory.map((history, index) => (
                    <ListItem key={index} divider={index < item.redInkHistory!.length - 1}>
                      <ListItemIcon>
                        <ReceiptIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Year ${history.year}: Registry #${history.redInkId}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
          
        </Grid>
        
        <Grid size={{ xs: 12, md:4 }}>
          <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerateQrCode}
                sx={{ mb: 2 }}
              >
                {item.qrCodeUrl ? 'View QR Code' : 'Generate QR Code'}
              </Button>
              
              {item.status === 'ACTIVE' && (
                <>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    component={RouterLink}
                    to={`/malkhana/dispose/${item.id}`}
                    startIcon={<DeleteIcon />}
                    sx={{ mb: 2 }}
                  >
                    Dispose Item
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShelvesIcon />}
                    sx={{ mb: 2 }}
                  >
                    {item.shelfId ? 'Change Shelf Location' : 'Assign to Shelf'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          {item.shelfId && (
            <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader 
                title="Shelf Location" 
                avatar={<ShelvesIcon color="primary" />}
              />
              <Divider />
              <CardContent>
                <Typography variant="body1" fontWeight={500}>
                  {item.shelfLocation}
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {item.photos && item.photos.length > 0 && (
            <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader title="Photos" />
              <Divider />
              <CardContent>
                <Grid container spacing={1}>
                  {item.photos.map((photo, index) => (
                    <Grid size={{ xs:6}} key={index}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={photo}
                        alt={`Photo ${index + 1}`}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
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
            
            <Box sx={{ my: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
              {/* In a real application, render an actual QR code image here */}
              <Typography sx={{ fontSize: '8rem', color: theme.palette.primary.main }}>
                <QrCodeIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                {item.qrCodeUrl}
              </Typography>
            </Box>
            
            <Button variant="outlined" fullWidth>
              Print QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemDetail; 