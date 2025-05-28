import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
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
  Chip,
  Collapse,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowBack as ArrowBackIcon,
  VisibilityOutlined as VisibilityIcon
} from '@mui/icons-material';
import { useData } from '../../../core/data';
import { useDailyBalance } from '../hooks';
import { formatDate } from '../../../utils/date';
import { setGlobalApiInstance } from '../services';
import { PageContainer } from './common';

/**
 * Balance History Component
 * Shows the historical cash balance records
 */
const BalanceHistory: React.FC = () => {
  const navigate = useNavigate();
  const { api } = useData();
  const { balances, loadBalances, loading, error } = useDailyBalance();
  
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Set API instance
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  // Load balance history
  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoading(true);
      try {
        await loadBalances(30); // Load up to 30 balance records
        setLocalError(null);
      } catch (err) {
        console.error('Error loading balance history:', err);
        setLocalError('Failed to load balance history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalances();
  }, [loadBalances]);
  
  // Format currency amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
  // Toggle expanded row
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Calculate denomination total
  const calculateDenominationTotal = (details: any): number => {
    if (!details) return 0;
    
    return (
      (details.notes2000 || 0) * 2000 +
      (details.notes500 || 0) * 500 +
      (details.notes200 || 0) * 200 +
      (details.notes100 || 0) * 100 +
      (details.notes50 || 0) * 50 +
      (details.notes20 || 0) * 20 +
      (details.notes10 || 0) * 10 +
      (details.coins || 0)
    );
  };
  
  // Render denomination breakdown
  const renderDenominationBreakdown = (details: any) => {
    if (!details) return null;
    
    const denominations = [
      { label: '₹2000 Notes', value: details.notes2000 || 0, total: (details.notes2000 || 0) * 2000 },
      { label: '₹500 Notes', value: details.notes500 || 0, total: (details.notes500 || 0) * 500 },
      { label: '₹200 Notes', value: details.notes200 || 0, total: (details.notes200 || 0) * 200 },
      { label: '₹100 Notes', value: details.notes100 || 0, total: (details.notes100 || 0) * 100 },
      { label: '₹50 Notes', value: details.notes50 || 0, total: (details.notes50 || 0) * 50 },
      { label: '₹20 Notes', value: details.notes20 || 0, total: (details.notes20 || 0) * 20 },
      { label: '₹10 Notes', value: details.notes10 || 0, total: (details.notes10 || 0) * 10 },
      { label: 'Coins', value: '-', total: details.coins || 0 }
    ].filter(item => item.value > 0 || (item.label === 'Coins' && item.total > 0));
    
    if (denominations.length === 0) {
      return <Typography variant="body2">No denomination details available</Typography>;
    }
    
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Denomination</TableCell>
            <TableCell align="right">Count</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {denominations.map((denom, index) => (
            <TableRow key={index}>
              <TableCell>{denom.label}</TableCell>
              <TableCell align="right">{denom.value}</TableCell>
              <TableCell align="right">{formatCurrency(denom.total)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} align="right"><strong>Total</strong></TableCell>
            <TableCell align="right"><strong>{formatCurrency(calculateDenominationTotal(details))}</strong></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };
  
  if (isLoading && (!balances || balances.length === 0)) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Balance History
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cash-registry/daily-balance')}
        >
          Back to Daily Balance
        </Button>
      </Box>
      
      {(localError || error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof localError === 'string' ? localError : 
           typeof error === 'string' ? error : 'An error occurred while loading balance history'}
        </Alert>
      )}
      
      {/* Balance history table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Opening Balance</TableCell>
                <TableCell>Receipts</TableCell>
                <TableCell>Disbursements</TableCell>
                <TableCell align="right">Closing Balance</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Verified By</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No balance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((balance) => (
                  <React.Fragment key={balance.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(balance.id)}
                        >
                          {expandedRows[balance.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatDate(balance.balanceDate)}</TableCell>
                      <TableCell>{formatCurrency(balance.openingBalance)}</TableCell>
                      <TableCell>{formatCurrency(balance.receiptsTotal)}</TableCell>
                      <TableCell>{formatCurrency(balance.disbursementsTotal)}</TableCell>
                      <TableCell align="right">{formatCurrency(balance.closingBalance)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={balance.isBalanced ? 'Balanced' : 'Discrepancy'}
                          color={balance.isBalanced ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {balance.verifiedBy ? 
                          `${balance.verifiedBy.firstName} ${balance.verifiedBy.lastName}` : 
                          'Not verified'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded row with details */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={expandedRows[balance.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Balance Details
                            </Typography>
                            
                            <Grid container spacing={3}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Verified On
                                  </Typography>
                                  <Typography variant="body1">
                                    {formatDate(balance.verifiedAt)}
                                  </Typography>
                                </Box>
                                
                                {!balance.isBalanced && balance.discrepancyNotes && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Discrepancy Notes
                                    </Typography>
                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                      {balance.discrepancyNotes}
                                    </Alert>
                                  </Box>
                                )}
                              </Grid>
                              
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Denomination Breakdown
                                </Typography>
                                {renderDenominationBreakdown(balance.closingDenominationDetails)}
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </PageContainer>
  );
};

export default BalanceHistory; 