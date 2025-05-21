import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

import { MalkhanaItem } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer,
  editActionRenderer, 
  disposeActionRenderer
} from './common/MalkhanaDataGrid';
import { PageContainer } from './common';
import { blackInkColumns, createActionsColumn } from './common/gridColumns';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

const BlackInkRegistry: React.FC = () => {
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, _] = useState(new Date().getFullYear());
  
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
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/malkhana/add-item"
        >
          Add New Item
        </Button>
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