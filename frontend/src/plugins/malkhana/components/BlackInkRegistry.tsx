import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem } from '../types';

const BlackInkRegistry: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    const loadBlackInkRegistry = async () => {
      try {
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
  
  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter items by search query
  const filteredItems = items.filter((item) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      item.description.toLowerCase().includes(lowerQuery) ||
      item.caseNumber.toLowerCase().includes(lowerQuery) ||
      item.receivedFrom.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  });
  
  // Paginate items
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Get status chip color
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
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading Black Ink Registry...</Typography>
      </Box>
    );
  }
  
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
      
      <Card
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by case number, description, category..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Box>
        
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableCell>Registry #</TableCell>
                <TableCell>Case Number</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Received From</TableCell>
                <TableCell>Date Received</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.registryNumber}</TableCell>
                    <TableCell>{item.caseNumber}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.receivedFrom}</TableCell>
                    <TableCell>{new Date(item.dateReceived).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        size="small"
                        sx={{ 
                          backgroundColor: `${getStatusColor(item.status)}20`,
                          color: getStatusColor(item.status),
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            component={RouterLink}
                            to={`/malkhana/item/${item.id}`}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Item">
                          <IconButton 
                            size="small"
                            component={RouterLink}
                            to={`/malkhana/edit/${item.id}`}
                            sx={{ ml: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Dispose Item">
                          <IconButton 
                            size="small"
                            component={RouterLink}
                            to={`/malkhana/dispose/${item.id}`}
                            sx={{ ml: 1 }}
                            disabled={item.status !== 'ACTIVE'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    {searchQuery ? 'No matching items found' : 'No items in Black Ink Registry'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      
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
    </Box>
  );
};

export default BlackInkRegistry; 