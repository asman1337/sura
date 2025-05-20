import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { malkhanaService } from '../services/MalkhanaService';
import { ShelfInfo } from '../types';
import MalkhanaDataGrid, { qrCodeActionRenderer } from './common/MalkhanaDataGrid';
import { shelfColumns, createActionsColumn } from './common/gridColumns';

const ShelfManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [shelves, setShelves] = useState<ShelfInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openNewShelfDialog, setOpenNewShelfDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<ShelfInfo | null>(null);
  const [shelfQrCode, setShelfQrCode] = useState<string | null>(null);
  
  // New shelf form state
  const [newShelfData, setNewShelfData] = useState({
    name: '',
    location: '',
    category: ''
  });
  
  const loadShelves = async () => {
    try {
      setLoading(true);
      const registry = await malkhanaService.getShelfRegistry();
      setShelves(registry.shelves);
    } catch (err) {
      setError('Failed to load shelves');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadShelves();
  }, []);
  
  const handleOpenNewShelfDialog = () => {
    setNewShelfData({
      name: '',
      location: '',
      category: ''
    });
    setOpenNewShelfDialog(true);
  };
  
  const handleCloseNewShelfDialog = () => {
    setOpenNewShelfDialog(false);
  };
  
  const handleNewShelfDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShelfData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddShelf = async () => {
    try {
      if (!newShelfData.name || !newShelfData.location) {
        setError('Shelf name and location are required');
        return;
      }
      
      await malkhanaService.addShelf(newShelfData);
      handleCloseNewShelfDialog();
      await loadShelves();
    } catch (err) {
      setError('Failed to add new shelf');
      console.error(err);
    }
  };
  
  const handleOpenQrDialog = async (shelf: ShelfInfo) => {
    setSelectedShelf(shelf);
    try {
      const qrCode = await malkhanaService.generateShelfQRCode(shelf.id);
      setShelfQrCode(qrCode);
      setOpenQrDialog(true);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };
  
  const handleViewShelfItems = (shelfId: string) => {
    navigate(`/malkhana/shelf/${shelfId}`);
  };

  // Create action column
  const actionColumn = createActionsColumn((params: GridRenderCellParams) => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title="View Items">
          <Button
            size="small"
            onClick={() => handleViewShelfItems(params.row.id)}
          >
            <ViewIcon fontSize="small" />
          </Button>
        </Tooltip>
        {qrCodeActionRenderer(() => handleOpenQrDialog(params.row))}
      </Box>
    );
  });

  // Combine the shelf columns with our action column
  const columns: GridColDef[] = [...shelfColumns, actionColumn];
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Malkhana Shelf Management
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewShelfDialog}
        >
          Add New Shelf
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <MalkhanaDataGrid 
        rows={shelves}
        columns={columns}
        loading={loading}
        title={`Shelves (${shelves.length})`}
        customEmptyContent={
          <Typography color="text.secondary">
            No shelves have been created yet. Create your first shelf to organize Malkhana items.
          </Typography>
        }
      />
      
      {/* New Shelf Dialog */}
      <Dialog open={openNewShelfDialog} onClose={handleCloseNewShelfDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Shelf</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Shelf Name"
              name="name"
              value={newShelfData.name}
              onChange={handleNewShelfDataChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={newShelfData.location}
              onChange={handleNewShelfDataChange}
              margin="normal"
              required
              helperText="Physical location of the shelf (e.g., Room 101, Cabinet A)"
            />
            <TextField
              fullWidth
              label="Category (Optional)"
              name="category"
              value={newShelfData.category}
              onChange={handleNewShelfDataChange}
              margin="normal"
              helperText="Category of items stored on this shelf"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewShelfDialog}>Cancel</Button>
          <Button onClick={handleAddShelf} variant="contained">Add Shelf</Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="sm">
        <DialogTitle>Shelf QR Code</DialogTitle>
        <DialogContent>
          {selectedShelf && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedShelf.name}
              </Typography>
              <Typography color="textSecondary" paragraph>
                Location: {selectedShelf.location}
              </Typography>
              <Box sx={{ my: 2, p: 2, border: `1px solid ${theme.palette.divider}` }}>
                {/* In a real application, render an actual QR code image here */}
                <Typography sx={{ fontSize: '8rem', color: theme.palette.primary.main }}>
                  <QrCodeIcon fontSize="inherit" />
                </Typography>
                <Typography variant="caption" display="block" mt={1}>
                  {shelfQrCode}
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
    </Box>
  );
};

export default ShelfManagement;