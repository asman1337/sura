import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  QrCode as QrCodeIcon} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem, ShelfInfo } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer, 
  qrCodeActionRenderer, 
  moveActionRenderer
} from './common/MalkhanaDataGrid';
import { shelfItemColumns, createActionsColumn } from './common/gridColumns';

const ShelfItems: React.FC = () => {
  const { shelfId } = useParams<{ shelfId: string }>();
  const theme = useTheme();
  
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
  
  const loadShelfData = async () => {
    if (!shelfId) return;
    
    try {
      setLoading(true);
      
      // Load shelf registry to get shelf details
      const shelfRegistry = await malkhanaService.getShelfRegistry();
      const shelfData = shelfRegistry.shelves.find(s => s.id === shelfId);
      
      if (!shelfData) {
        setError(`Shelf with ID ${shelfId} not found`);
        setLoading(false);
        return;
      }
      
      setShelf(shelfData);
      
      // Load items assigned to this shelf
      const shelfItems = await malkhanaService.getItemsByShelf(shelfId);
      setItems(shelfItems);
      
      // Load all shelves for the move dialog
      setAvailableShelves(shelfRegistry.shelves.filter(s => s.id !== shelfId));
      
    } catch (err) {
      setError('Failed to load shelf data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadShelfData();
  }, [shelfId]);
  
  const handleOpenQrDialog = async (item: MalkhanaItem) => {
    setSelectedItem(item);
    try {
      let qrCodeUrl = item.qrCodeUrl;
      
      // Generate QR code if it doesn't exist
      if (!qrCodeUrl) {
        qrCodeUrl = await malkhanaService.generateQRCode(item);
        // Update item with QR code URL
        await malkhanaService.updateItem(item.id, { qrCodeUrl });
      }
      
      setQrCode(qrCodeUrl);
      setOpenQrDialog(true);
    } catch (err) {
      setError('Failed to generate QR code');
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
      await malkhanaService.assignItemToShelf(selectedItem.id, targetShelfId);
      setOpenMoveDialog(false);
      // Refresh items
      await loadShelfData();
    } catch (err) {
      setError('Failed to move item to new shelf');
      console.error(err);
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
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading shelf items...</Typography>
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
        
        <Button
          component={RouterLink}
          to="/malkhana/shelves"
          startIcon={<BackIcon />}
          variant="outlined"
        >
          Back to Shelves
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs:12, md:6 }}>
            <Card
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                p: 2
              }}
            >
              <Typography variant="subtitle1">Shelf QR Code</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <QrCodeIcon fontSize="large" sx={{ mr: 2 }} />
                <Button variant="outlined" size="small">
                  Print Shelf QR Code
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <Card
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                p: 2
              }}
            >
              <Typography variant="subtitle1">Items on this Shelf</Typography>
              <Typography variant="h4" fontWeight="500" mt={1}>
                {items.length}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <MalkhanaDataGrid 
        rows={items}
        columns={columns}
        loading={loading}
        title={`Items on ${shelf.name}`}
        customEmptyContent={
          <Typography color="text.secondary">
            No items are currently assigned to this shelf
          </Typography>
        }
      />
      
      {/* QR Code Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="sm">
        <DialogTitle>Item QR Code</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Mother #: {selectedItem.motherNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {selectedItem.description}
              </Typography>
              <Typography color="textSecondary" paragraph>
                Case: {selectedItem.caseNumber}
              </Typography>
              <Box sx={{ my: 2, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                {/* In a real application, render an actual QR code image here */}
                <Typography sx={{ fontSize: '8rem', color: theme.palette.primary.main }}>
                  <QrCodeIcon fontSize="inherit" />
                </Typography>
                <Typography variant="caption" display="block" mt={1}>
                  {qrCode}
                </Typography>
              </Box>
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
      <Dialog open={openMoveDialog} onClose={() => setOpenMoveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Move Item to Another Shelf</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 1 }}>
              <Typography gutterBottom>
                Move item <strong>{selectedItem.motherNumber}</strong> from <strong>{shelf.name}</strong> to:
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Target Shelf</InputLabel>
                <Select
                  value={targetShelfId}
                  label="Target Shelf"
                  onChange={(e) => setTargetShelfId(e.target.value as string)}
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