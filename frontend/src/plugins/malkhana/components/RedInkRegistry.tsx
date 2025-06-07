import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

import { MalkhanaItem } from '../types';
import MalkhanaDataGrid, { 
  viewActionRenderer,
  disposeActionRenderer
} from './common/MalkhanaDataGrid';
import { PageContainer } from './common';
import { redInkColumns, createActionsColumn } from './common/gridColumns';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useMalkhanaApi } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

const RedInkRegistry: React.FC = () => {
  const { api } = useData();
  const malkhanaApi = useMalkhanaApi();
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearTransitionLoading, setYearTransitionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
    useEffect(() => {
    const loadRedInkRegistry = async () => {
      if (!malkhanaApi.isReady) return;
      
      try {
        setLoading(true);
        const redInkItems = await malkhanaApi.getRedInkItems();
        setItems(redInkItems);
        setError(null);
      } catch (err) {
        console.error('Error loading Red Ink Registry:', err);
        setError('Failed to load Red Ink Registry. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRedInkRegistry();
  }, [malkhanaApi.isReady]);
  // Function to handle year transition
  const handleYearTransition = async () => {
    if (!malkhanaApi.isReady) return;

    // Show confirmation dialog first
    const confirmed = window.confirm(
      `Are you sure you want to transition all active Black Ink items from ${new Date().getFullYear()} to Red Ink Registry? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setYearTransitionLoading(true);
      const currentYear = new Date().getFullYear();
      // We're transitioning TO the next year (current year + 1)
      const result = await malkhanaApi.performYearTransition({ newYear: currentYear + 1 });
        if (result) {
        setSuccessMessage(`Year transition completed! ${result.itemsTransitioned} items moved from ${result.previousYear} Black Ink to Red Ink Registry.`);
        // Reload the Red Ink Registry to show new items
        const updatedRedInkItems = await malkhanaApi.getRedInkItems();
        setItems(updatedRedInkItems);
      }
    } catch (err) {
      console.error('Error performing year transition:', err);
      setError('Failed to perform year transition. Please try again.');
    } finally {
      setYearTransitionLoading(false);
    }
  };
  
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
    <PageContainer>      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Red Ink Registry (Historical)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/malkhana/add-red-ink-item"
          >
            Add Red Ink Item
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleYearTransition}
            disabled={yearTransitionLoading}
          >
            {yearTransitionLoading ? <CircularProgress size={20} color="inherit" /> : 'Year Transition'}
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

      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default RedInkRegistry; 