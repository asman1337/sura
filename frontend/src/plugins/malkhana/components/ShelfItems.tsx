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
  Print as PrintIcon
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { QRCodeSVG } from 'qrcode.react';

import { MalkhanaItem, ShelfInfo } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer, 
  qrCodeActionRenderer, 
  moveActionRenderer
} from './common/MalkhanaDataGrid';
import { PageContainer } from './common';
import { shelfItemColumns, createActionsColumn } from './common/gridColumns';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';
import { printQrCode } from '../utils';

const ShelfItems: React.FC = () => {
  const { shelfId } = useParams<{ shelfId: string }>();
  const theme = useTheme();
  const { api, auth } = useData();
  const malkhanaApi = useMalkhanaApi();
  
  const [shelf, setShelf] = useState<ShelfInfo | null>(null);
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MalkhanaItem | null>(null);
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
  
  // Generate QR code data as JSON string
  const getCompactQrCodeData = (item: MalkhanaItem) => {
    // Create a minimal data structure with only the essential fields
    const qrData = {
      type: 'item',
      id: item.id,
      timestamp: new Date().toISOString()
    };
    
    // Return compact JSON string
    return JSON.stringify(qrData);
  };
  
  const handleOpenQrDialog = (item: MalkhanaItem) => {
    setSelectedItem(item);
    setOpenQrDialog(true);
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
  
  // Handle printing QR code
  const handlePrintQrCode = () => {
    if (!selectedItem) return;
    try {
      const title = `PR NO - ${selectedItem.motherNumber}`;
      const value = getCompactQrCodeData(selectedItem);
      const logoUrl = '/images/logo/wbp_logo.svg';
      const currentUser = auth.getCurrentUser();
      const unitName = currentUser?.primaryUnit?.name || '';
      const orgName = currentUser?.organization?.name || '';
      printQrCode(title, value, logoUrl, unitName, orgName);
    } catch (error) {
      console.error('Error preparing QR code data for printing:', error);
      alert('Failed to print QR code. Please try again.');
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
    <PageContainer>
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
      <Dialog 
        open={openQrDialog} 
        onClose={() => setOpenQrDialog(false)}
        maxWidth="sm"
        fullWidth
      >
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
              
              <Box sx={{ 
                my: 3, 
                p: 3, 
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <QRCodeSVG 
                  value={getCompactQrCodeData(selectedItem)}
                  size={280}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth
                startIcon={<PrintIcon />}
                onClick={handlePrintQrCode}
                size="large"
              >
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
    </PageContainer>
  );
};

export default ShelfItems;