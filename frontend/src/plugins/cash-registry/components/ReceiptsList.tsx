import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Paper,
  Button,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useCashRegistry } from '../hooks';
import { useData } from '../../../core/data';
import { formatDate } from '../../../utils/date';
import { setGlobalApiInstance } from '../services';
import { CashRegistryEntry, TransactionType, CashSource } from '../types';
import { PageContainer } from './common';

const ReceiptsList: React.FC = () => {
  const { api } = useData();
  const { entries, loadEntries, loading, error } = useCashRegistry();
  
  const [receipts, setReceipts] = useState<CashRegistryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Set API instance
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  // Load receipt entries
  useEffect(() => {
    const fetchReceipts = async () => {
      await loadEntries({ transactionType: TransactionType.RECEIPT });
    };
    
    fetchReceipts();
  }, [loadEntries]);
  
  // Filter and update entries when they change
  useEffect(() => {
    if (!entries) return;
    
    const filteredReceipts = entries
      .filter(entry => entry.transactionType === TransactionType.RECEIPT)
      .filter(entry => {
        // Apply text search filter
        if (searchText) {
          const lowerCaseSearch = searchText.toLowerCase();
          return (
            entry.documentNumber.toLowerCase().includes(lowerCaseSearch) ||
            (entry.caseReference && entry.caseReference.toLowerCase().includes(lowerCaseSearch)) ||
            formatCurrency(entry.amount).toLowerCase().includes(lowerCaseSearch)
          );
        }
        return true;
      })
      .filter(entry => {
        // Apply source filter
        if (sourceFilter && entry.source) {
          return entry.source === sourceFilter;
        }
        return true;
      })
      .filter(entry => {
        // Apply date filter
        if (dateFilter) {
          const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
          return entryDate === dateFilter;
        }
        return true;
      });
    
    setReceipts(filteredReceipts);
  }, [entries, searchText, sourceFilter, dateFilter]);
  
  // Format currency amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
  // Format enum values for display
  const formatEnumValue = (value: string): string => {
    if (!value) return '';
    return value.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    loadEntries({ transactionType: TransactionType.RECEIPT });
  };
  
  // Apply pagination
  const paginatedReceipts = receipts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(receipts.length / rowsPerPage);
  
  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Cash Receipts
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/cash-registry/add"
          >
            New Receipt
          </Button>
        </Box>
      </Box>
      
      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by document number, case..."
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="source-filter-label">Source</InputLabel>
              <Select
                labelId="source-filter-label"
                value={sourceFilter}
                label="Source"
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <MenuItem value="">All Sources</MenuItem>
                {Object.values(CashSource).map((source) => (
                  <MenuItem key={source} value={source}>
                    {formatEnumValue(source)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Card>
      
      {/* Entries table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Case Reference</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      {error ? 'Error loading receipts' : 'No receipts found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceipts.map((receipt) => (
                  <TableRow key={receipt.id} hover>
                    <TableCell>{receipt.documentNumber}</TableCell>
                    <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                    <TableCell>{receipt.source && formatEnumValue(receipt.source)}</TableCell>
                    <TableCell>{receipt.caseReference || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small"
                        label={receipt.isReconciled ? 'Reconciled' : 'Pending'}
                        color={receipt.isReconciled ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton 
                          size="small"
                          component={RouterLink}
                          to={`/cash-registry/transaction/${receipt.id}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          component={RouterLink}
                          to={`/cash-registry/edit/${receipt.id}`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        )}
      </Card>
    </PageContainer>
  );
};

export default ReceiptsList; 