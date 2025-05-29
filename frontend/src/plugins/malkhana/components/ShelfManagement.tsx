import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { QRCodeSVG } from 'qrcode.react';

import { ShelfInfo } from '../types';
import MalkhanaDataGrid, { qrCodeActionRenderer } from './common/MalkhanaDataGrid';
import { PageContainer } from './common';
import { shelfColumns, createActionsColumn } from './common/gridColumns';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';
import { printQrCode } from '../utils';

const ShelfManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { api, auth } = useData();
  const malkhanaApi = useMalkhanaApi();
  const [shelves, setShelves] = useState<ShelfInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openNewShelfDialog, setOpenNewShelfDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<ShelfInfo | null>(null);
  
  // New shelf form state
  const [newShelfData, setNewShelfData] = useState({
    name: '',
    location: '',
    category: ''
  });
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  const loadShelves = async () => {
    if (!malkhanaApi.isReady) return;
    
    try {
      setLoading(true);
      const shelves = await malkhanaApi.getAllShelves();
      setShelves(shelves);
      setError(null);
    } catch (err) {
      console.error('Failed to load shelves:', err);
      setError('Failed to load shelves. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadShelves();
  }, [malkhanaApi.isReady]);
  
  // Generate compact QR code data for shelf
  const getCompactShelfQrCodeData = (shelf: ShelfInfo) => {
    // Create a minimal data structure with only the essential fields
    const qrData = {
      type: 'shelf',
      id: shelf.id,
      timestamp: new Date().toISOString()
    };
    
    // Return compact JSON string
    return JSON.stringify(qrData);
  };
  
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
      
      if (!malkhanaApi.isReady) {
        throw new Error('API service is not initialized');
      }
      
      const result = await malkhanaApi.createShelf(newShelfData);
      if (result) {
        handleCloseNewShelfDialog();
        await loadShelves();
      } else {
        setError('Failed to add new shelf');
      }
    } catch (err) {
      console.error('Failed to add new shelf:', err);
      setError(`Failed to add new shelf: ${(err as Error).message}`);
    }
  };
  
  const handleOpenQrDialog = (shelf: ShelfInfo) => {
    setSelectedShelf(shelf);
    setOpenQrDialog(true);
  };
  
  const handleViewShelfItems = (shelfId: string) => {
    navigate(`/malkhana/shelf/${shelfId}`);
  };

  // Handle printing QR code
  const handlePrintQrCode = () => {
    if (!selectedShelf) return;
    try {
      const title = selectedShelf.name;
      const value = getCompactShelfQrCodeData(selectedShelf);
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
  
  return (
    <PageContainer>
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
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/malkhana"
        >
          Back to Dashboard
        </Button>
        
        <Button
          variant="outlined"
          component={RouterLink}
          to="/malkhana/black-ink"
        >
          View Black Ink Registry
        </Button>
      </Box>
      
      {/* Information section */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 2, border: '1px solid rgba(156, 39, 176, 0.3)' }}>
        <Typography variant="h6" color="secondary.dark" gutterBottom>
          About Shelf Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The Shelf Management system helps organize Malkhana items in physical storage locations.
          Create shelves corresponding to real-world storage units in your facility, and assign items to specific shelves.
          Each shelf can have a QR code generated for easy identification and scanning.
          View all items on a shelf to quickly locate evidence and maintain proper chain of custody.
        </Typography>
      </Box>
      
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
              helperText="Type of items stored on this shelf (e.g., Weapons, Documents)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewShelfDialog}>Cancel</Button>
          <Button onClick={handleAddShelf} variant="contained">
            Add Shelf
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog 
        open={openQrDialog} 
        onClose={() => setOpenQrDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Shelf QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {selectedShelf && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedShelf.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Location: {selectedShelf.location}
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
                    value={getCompactShelfQrCodeData(selectedShelf)}
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
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ShelfManagement;