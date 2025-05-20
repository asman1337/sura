import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  useTheme
} from '@mui/material';

import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer,
  disposeActionRenderer
} from './common/MalkhanaDataGrid';
import { redInkColumns, createActionsColumn } from './common/gridColumns';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

const RedInkRegistry: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRedInkRegistry = async () => {
      try {
        setLoading(true);
        const redInk = await malkhanaService.getRedInkRegistry();
        setItems(redInk.items);
      } catch (error) {
        console.error('Error loading Red Ink Registry:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRedInkRegistry();
  }, []);
  
  // Create action column
  const actionColumn = createActionsColumn((params: GridRenderCellParams) => {
    const isActive = params.row.status === 'ACTIVE';
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {viewActionRenderer(params.row.id)}
        {disposeActionRenderer(params.row.id, isActive)}
      </Box>
    );
  });

  // Combine the columns with our action column
  const columns: GridColDef[] = [...redInkColumns, actionColumn];
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Red Ink Registry (Historical)
        </Typography>
      </Box>
      
      <MalkhanaDataGrid 
        rows={items}
        columns={columns}
        loading={loading}
        title={`Red Ink Registry Items (${items.length})`}
        checkboxSelection
        customEmptyContent={
          <Typography color="text.secondary">
            No items found in the Red Ink Registry
          </Typography>
        }
      />
      
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
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
        <Typography variant="h6" color="warning.dark" gutterBottom>
          About Red Ink Registry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The Red Ink Registry contains historical items from previous years that have not been disposed of.
          When a new year begins, all active items from the Black Ink Registry are automatically transferred to the Red Ink Registry.
          If an item in the Red Ink Registry is disposed of, all subsequent items are automatically renumbered.
        </Typography>
      </Box>
    </Box>
  );
};

export default RedInkRegistry; 