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
import { CashRegistryEntry, TransactionType, DisbursementPurpose } from '../types';
import { PageContainer } from './common';

const DisbursementsList: React.FC = () => {
  const { api } = useData();
  const { entries, loadEntries, loading, error } = useCashRegistry();
  
  const [disbursements, setDisbursements] = useState<CashRegistryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Set API instance
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  // Load disbursement entries
  useEffect(() => {
    const fetchDisbursements = async () => {
      await loadEntries({ transactionType: TransactionType.DISBURSEMENT });
    };
    
    fetchDisbursements();
  }, [loadEntries]);
  
  // Filter and update entries when they change
  useEffect(() => {
    if (!entries) return;
    
    const filteredDisbursements = entries
      .filter(entry => entry.transactionType === TransactionType.DISBURSEMENT)
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
        // Apply purpose filter
        if (purposeFilter && entry.purpose) {
          return entry.purpose === purposeFilter;
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
    
    setDisbursements(filteredDisbursements);
  }, [entries, searchText, purposeFilter, dateFilter]);
  
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
    loadEntries({ transactionType: TransactionType.DISBURSEMENT });
  };
  
  // Apply pagination
  const paginatedDisbursements = disbursements.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(disbursements.length / rowsPerPage);
  
  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Cash Disbursements
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
            to={{
              pathname: "/cash-registry/add",
              search: "?type=DISBURSEMENT"
            }}
          >
            New Disbursement
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
              <InputLabel id="purpose-filter-label">Purpose</InputLabel>
              <Select
                labelId="purpose-filter-label"
                value={purposeFilter}
                label="Purpose"
                onChange={(e) => setPurposeFilter(e.target.value)}
              >
                <MenuItem value="">All Purposes</MenuItem>
                {Object.values(DisbursementPurpose).map((purpose) => (
                  <MenuItem key={purpose} value={purpose}>
                    {formatEnumValue(purpose)}
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
                <TableCell>Purpose</TableCell>
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
              ) : paginatedDisbursements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      {error ? 'Error loading disbursements' : 'No disbursements found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDisbursements.map((disbursement) => (
                  <TableRow key={disbursement.id} hover>
                    <TableCell>{disbursement.documentNumber}</TableCell>
                    <TableCell>{formatDate(disbursement.createdAt)}</TableCell>
                    <TableCell>{disbursement.purpose && formatEnumValue(disbursement.purpose)}</TableCell>
                    <TableCell>{disbursement.caseReference || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(disbursement.amount)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small"
                        label={disbursement.isReconciled ? 'Reconciled' : 'Pending'}
                        color={disbursement.isReconciled ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton 
                          size="small"
                          component={RouterLink}
                          to={`/cash-registry/transaction/${disbursement.id}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          component={RouterLink}
                          to={`/cash-registry/edit/${disbursement.id}`}
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

export default DisbursementsList; 