import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  QrCode as QrCodeIcon} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { MalkhanaItem, ShelfInfo } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer, 
  qrCodeActionRenderer, 
  moveActionRenderer
} from './common/MalkhanaDataGrid';
import { shelfItemColumns, createActionsColumn } from './common/gridColumns';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

const ShelfItems: React.FC = () => {
  const { shelfId } = useParams<{ shelfId: string }>();
  const theme = useTheme();
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  
  const [shelf, setShelf] = useState<ShelfInfo | null>(null);
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MalkhanaItem | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [availableShelves, setAvailableShelves] = useState<ShelfInfo[]>([]);
  const [targetShelfId, setTargetShelfId] = useState<string>('');
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  const loadShelfData = async () => {
    if (!shelfId || !malkhanaApi.isReady) return;
    
    try {
      setLoading(true);
      
      // Load shelf details
      const shelfData = await malkhanaApi.getShelfById(shelfId);
      
      if (!shelfData) {
        setError(`Shelf with ID ${shelfId} not found`);
        setLoading(false);
        return;
      }
      
      setShelf(shelfData);
      
      // Load items assigned to this shelf
      const shelfItems = await malkhanaApi.getShelfItems(shelfId);
      setItems(shelfItems);
      
      // Load all shelves for the move dialog
      const allShelves = await malkhanaApi.getAllShelves();
      setAvailableShelves(allShelves.filter(s => s.id !== shelfId));
      
      setError(null);
    } catch (err) {
      console.error('Failed to load shelf data:', err);
      setError(`Failed to load shelf data: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadShelfData();
  }, [shelfId, malkhanaApi.isReady]);
  
  const handleOpenQrDialog = async (item: MalkhanaItem) => {
    setSelectedItem(item);
    try {
      if (!malkhanaApi.isReady) {
        throw new Error('API service is not initialized');
      }
      
      let qrCodeUrl = item.qrCodeUrl;
      
      // Generate QR code if it doesn't exist
      if (!qrCodeUrl) {
        const qrResult = await malkhanaApi.generateQRCode(item.id);
        if (qrResult && qrResult.qrCodeUrl) {
          qrCodeUrl = qrResult.qrCodeUrl;
          // Update item with QR code URL
          await malkhanaApi.updateItem(item.id, { qrCodeUrl });
        } else {
          throw new Error('Failed to generate QR code');
        }
      }
      
      setQrCode(qrCodeUrl);
      setOpenQrDialog(true);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      setError(`Failed to generate QR code: ${(err as Error).message}`);
    }
  };
  
  const handleOpenMoveDialog = (item: MalkhanaItem) => {
    setSelectedItem(item);
    setTargetShelfId('');
    setOpenMoveDialog(true);
  };
  
  const handleMoveItem = async () => {
    if (!selectedItem || !targetShelfId) {
      return;
    }
    
    try {
      if (!malkhanaApi.isReady) {
        throw new Error('API service is not initialized');
      }
      
      // Move item to new shelf
      const result = await malkhanaApi.assignToShelf(selectedItem.id, { shelfId: targetShelfId });
      if (result) {
        setOpenMoveDialog(false);
        // Refresh items
        await loadShelfData();
      } else {
        throw new Error('Failed to move item to new shelf');
      }
    } catch (err) {
      console.error('Failed to move item to new shelf:', err);
      setError(`Failed to move item: ${(err as Error).message}`);
    }
  };
  
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
  
  // Create action column for shelf items
  const actionColumn = createActionsColumn((params: GridRenderCellParams) => {
    const isActive = params.row.status === 'ACTIVE';
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {viewActionRenderer(params.row.id)}
        {qrCodeActionRenderer(() => handleOpenQrDialog(params.row))}
        {moveActionRenderer(() => handleOpenMoveDialog(params.row), isActive)}
      </Box>
    );
  });

  // Combine the columns with our action column
  const columns: GridColDef[] = [...shelfItemColumns, actionColumn];
  
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading shelf items...
        </Typography>
      </Box>
    );
  }
  
  if (!shelf) {
    return (
      <Alert severity="error">
        Shelf not found
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/malkhana" color="inherit">
            Malkhana
          </Link>
          <Link component={RouterLink} to="/malkhana/shelves" color="inherit">
            Shelves
          </Link>
          <Typography color="textPrimary">{shelf.name}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="500">
            {shelf.name}
          </Typography>
          <Typography color="textSecondary">
            Location: {shelf.location} {shelf.category && `• Category: ${shelf.category}`}
          </Typography>
        </Box>
        
        <Box>
          <Button
            component={RouterLink}
            to="/malkhana/shelves"
            startIcon={<BackIcon />}
            sx={{ mr: 1 }}
          >
            Back to Shelves
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <MalkhanaDataGrid 
        rows={items}
        columns={columns}
        loading={loading}
        title={`Items on ${shelf.name} (${items.length})`}
        customEmptyContent={
          <Typography color="text.secondary">
            No items are currently stored on this shelf.
          </Typography>
        }
      />
      
      {/* QR Code Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)}>
        <DialogTitle>Item QR Code</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6">
                {selectedItem.motherNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedItem.description}
              </Typography>
              
              {qrCode ? (
                <Box sx={{ my: 3, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <img 
                    src={qrCode} 
                    alt={`QR Code for ${selectedItem.motherNumber}`}
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Move Item Dialog */}
      <Dialog open={openMoveDialog} onClose={() => setOpenMoveDialog(false)}>
        <DialogTitle>Move Item to Different Shelf</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 1 }}>
              <Typography gutterBottom>
                Select the shelf to move <strong>{selectedItem.motherNumber}</strong> to:
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Target Shelf</InputLabel>
                <Select
                  value={targetShelfId}
                  onChange={(e) => setTargetShelfId(e.target.value as string)}
                  label="Target Shelf"
                >
                  {availableShelves.map(shelf => (
                    <MenuItem key={shelf.id} value={shelf.id}>
                      {shelf.name} ({shelf.location})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMoveDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleMoveItem} 
            variant="contained"
            disabled={!targetShelfId}
          >
            Move Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShelfItems;