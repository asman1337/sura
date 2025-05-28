import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';

import { MalkhanaItem } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer,
  editActionRenderer, 
  disposeActionRenderer
} from './common/MalkhanaDataGrid';
import { PageContainer } from './common';
import { blackInkColumns, createActionsColumn } from './common/gridColumns';
import { GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';
import { printMultipleQrCodes } from '../utils';

const BlackInkRegistry: React.FC = () => {
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, _] = useState(new Date().getFullYear());
  const [selectedItems, setSelectedItems] = useState<MalkhanaItem[]>([]);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  useEffect(() => {
    const loadBlackInkRegistry = async () => {
      if (!malkhanaApi.isReady) return;
      
      try {
        setLoading(true);
        const blackInkItems = await malkhanaApi.getBlackInkItems();
        setItems(blackInkItems);
        setError(null);
      } catch (err) {
        console.error('Error loading Black Ink Registry:', err);
        setError('Failed to load Black Ink Registry. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBlackInkRegistry();
  }, [malkhanaApi.isReady]);
  
  // Handle selection change
  const handleSelectionChange = (selectionModel: GridRowSelectionModel) => {
    // MUI X DataGrid v8.3.1+ has GridRowSelectionModel as an object with a Set of ids
    const selectedItemsList = items.filter(item => 
      selectionModel.type === 'include' 
        ? selectionModel.ids.has(item.id) 
        : !selectionModel.ids.has(item.id)
    );
    setSelectedItems(selectedItemsList);
  };

  // Handle multi-print
  const handleMultiPrint = () => {
    if (selectedItems.length === 0) return;
    
    try {
      // Prepare items for grid printing
      const qrItems = selectedItems.map(item => {
        // Generate a simplified QR code data with only essential information
        const qrData = {
          type: 'item',
          id: item.id,
          timestamp: new Date().toISOString()
        };
        
        return {
          title: `Item: ${item.motherNumber}`,
          subtitle: item.description || `Registry #${item.registryNumber}`,
          value: JSON.stringify(qrData)
        };
      });
      
      // Print all QR codes in a grid layout
      printMultipleQrCodes(qrItems);
    } catch (error) {
      console.error('Error preparing QR codes for multi-print:', error);
      setError('Failed to print QR codes. Please try again.');
    }
  };
  
  // Create action column
  const actionColumn = createActionsColumn((params: GridRenderCellParams) => {
    const isActive = params.row.status === 'ACTIVE';
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {viewActionRenderer(params.row.id)}
        {editActionRenderer(params.row.id, isActive)}
        {disposeActionRenderer(params.row.id, isActive)}
      </Box>
    );
  });

  // Combine the common columns with our action column
  const columns: GridColDef[] = [...blackInkColumns, actionColumn];
  
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
          Black Ink Registry ({currentYear})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedItems.length > 0 && (
            <Tooltip title={`Print QR codes for ${selectedItems.length} selected items`}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<QrCodeIcon />}
                onClick={handleMultiPrint}
              >
                Print {selectedItems.length} QR Code{selectedItems.length > 1 ? 's' : ''}
              </Button>
            </Tooltip>
          )}
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/malkhana/add-item"
          >
            Add New Item
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">{error}</Typography>
        </Box>
      )}
      
      <MalkhanaDataGrid 
        rows={items}
        columns={columns}
        loading={loading}
        title={`Black Ink Registry Items (${items.length})`}
        checkboxSelection
        dataGridProps={{
          onRowSelectionModelChange: handleSelectionChange
        }}
        customEmptyContent={
          <Typography color="text.secondary">
            No items found in the Black Ink Registry
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
          to="/malkhana/red-ink"
        >
          View Red Ink Registry
        </Button>
      </Box>
      
      {/* Information section */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
        <Typography variant="h6" color="success.dark" gutterBottom>
          About Black Ink Registry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The Black Ink Registry contains all active items for the current year.
          Items are recorded in this registry when they first enter the Malkhana.
          At the end of the year, active items will be transferred to the Red Ink Registry for historical record-keeping.
          Items can be edited, disposed of, or assigned to storage shelves for proper organization.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default BlackInkRegistry; 