import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer,
  editActionRenderer, 
  disposeActionRenderer
} from './common/MalkhanaDataGrid';
import { blackInkColumns, createActionsColumn } from './common/gridColumns';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

const BlackInkRegistry: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    const loadBlackInkRegistry = async () => {
      try {
        setLoading(true);
        const blackInk = await malkhanaService.getBlackInkRegistry();
        setItems(blackInk.items);
        setCurrentYear(blackInk.year);
      } catch (error) {
        console.error('Error loading Black Ink Registry:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBlackInkRegistry();
  }, []);
  
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
  
  return (
    <Box>
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
    </Box>
  );
};

export default BlackInkRegistry; 