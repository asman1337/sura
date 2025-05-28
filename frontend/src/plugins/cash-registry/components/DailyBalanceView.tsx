import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  InputAdornment,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Done as DoneIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useData } from '../../../core/data';
import { useDailyBalance } from '../hooks';
import { formatDate } from '../../../utils/date';
import { setGlobalApiInstance } from '../services';
import { 
  CreateDailyBalanceDto, 
  DenominationDetails, 
  CashRegistryDailyBalance 
} from '../types';
import { PageContainer } from './common';

/**
 * Daily Balance View component
 * Allows users to view the current balance and create a new daily balance
 */
const DailyBalanceView: React.FC = () => {
  const navigate = useNavigate();
  const { api } = useData();
  const { 
    stats, 
    balances, 
    loadStats, 
    loadBalances, 
    createBalance  } = useDailyBalance();
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayBalance, setTodayBalance] = useState<CashRegistryDailyBalance | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state for new balance
  const [balanceForm, setBalanceForm] = useState<CreateDailyBalanceDto>({
    balanceDate: new Date(),
    openingBalance: 0,
    closingDenominationDetails: {
      notes2000: 0,
      notes500: 0,
      notes200: 0,
      notes100: 0,
      notes50: 0,
      notes20: 0,
      notes10: 0,
      coins: 0
    }
  });
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  
  // Set API instance
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load stats and balances
        await Promise.all([
          loadStats(),
          loadBalances(5) // Load the 5 most recent balances
        ]);
        setError(null);
      } catch (err) {
        console.error('Error loading balance data:', err);
        setError('Failed to load balance data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [loadStats, loadBalances]);
  
  // Check if today's balance exists when balances change
  useEffect(() => {
    if (!balances || balances.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todaysBalance = balances.find(balance => {
      const balanceDate = new Date(balance.balanceDate).toISOString().split('T')[0];
      return balanceDate === today;
    });
    
    if (todaysBalance) {
      setTodayBalance(todaysBalance);
    }
  }, [balances]);
  
  // Update form when stats change
  useEffect(() => {
    if (stats) {
      setBalanceForm(prev => ({
        ...prev,
        openingBalance: stats.lastClosingBalance || 0
      }));
    }
  }, [stats]);
  
  // Calculate total from denomination details
  useEffect(() => {
    const { closingDenominationDetails } = balanceForm;
    
    const total = 
      (closingDenominationDetails.notes2000 || 0) * 2000 +
      (closingDenominationDetails.notes500 || 0) * 500 +
      (closingDenominationDetails.notes200 || 0) * 200 +
      (closingDenominationDetails.notes100 || 0) * 100 +
      (closingDenominationDetails.notes50 || 0) * 50 +
      (closingDenominationDetails.notes20 || 0) * 20 +
      (closingDenominationDetails.notes10 || 0) * 10 +
      (closingDenominationDetails.coins || 0);
    
    setCalculatedTotal(total);
  }, [balanceForm.closingDenominationDetails]);
  
  // Format currency amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
  // Handle dialog open/close
  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
  };
  
  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };
  
  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('denom.')) {
      const denomKey = name.replace('denom.', '') as keyof DenominationDetails;
      setBalanceForm(prev => ({
        ...prev,
        closingDenominationDetails: {
          ...prev.closingDenominationDetails,
          [denomKey]: parseInt(value) || 0
        }
      }));
    } else {
      setBalanceForm(prev => ({
        ...prev,
        [name]: name === 'openingBalance' ? parseFloat(value) || 0 : value
      }));
    }
  };
  
  // Handle form submission
  const handleSubmitBalance = async () => {
    try {
      setLoading(true);
      
      const expectedClosing = stats ? stats.currentBalance : 0;
      const hasDifference = calculatedTotal !== expectedClosing;
      
      // Create the balance
      const newBalance = await createBalance({
        ...balanceForm,
        balanceDate: new Date(),
        isBalanced: !hasDifference,
        discrepancyNotes: hasDifference 
          ? `System expected ${formatCurrency(expectedClosing)}, but counted ${formatCurrency(calculatedTotal)}`
          : undefined
      });
      
      if (newBalance) {
        setTodayBalance(newBalance);
        handleCloseCreateDialog();
        // Refresh stats
        loadStats();
      }
    } catch (err) {
      console.error('Error creating balance:', err);
      setError('Failed to create daily balance');
    } finally {
      setLoading(false);
    }
  };
  
  // Determine if the form is valid
  const isFormValid = () => {
    return calculatedTotal > 0;
  };
  
  // Get difference amount for displayed warning
  const getDifference = () => {
    if (!stats) return 0;
    return calculatedTotal - stats.currentBalance;
  };
  
  if (loading && !stats) {
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
          Daily Cash Balance
        </Typography>
        
        {!todayBalance && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Today's Balance
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Current balance status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="Current Balance Status" 
              avatar={<AccountBalanceIcon />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Balance
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {stats ? formatCurrency(stats.currentBalance) : 'N/A'}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Closing Balance
                    </Typography>
                    <Typography variant="h5">
                      {stats && stats.lastClosingBalance 
                        ? formatCurrency(stats.lastClosingBalance) 
                        : 'Not Available'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats && stats.lastBalanceDate 
                        ? `As of ${formatDate(stats.lastBalanceDate)}`
                        : 'No previous balance found'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Today's Activity
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Receipts:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stats ? formatCurrency(stats.receiptsToday) : 'N/A'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Disbursements:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stats ? formatCurrency(stats.disbursementsToday) : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Balance Sheet Status" />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1">Previous Day's Balance</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats && stats.lastBalanceDate 
                        ? formatDate(stats.lastBalanceDate)
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Chip
                    icon={stats?.isLastDayBalanced ? <DoneIcon /> : <WarningIcon />}
                    label={stats?.isLastDayBalanced ? "Balanced" : "Not Balanced"}
                    color={stats?.isLastDayBalanced ? "success" : "warning"}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1">Today's Balance</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    icon={todayBalance || stats?.isCurrentDayBalanced ? <DoneIcon /> : <WarningIcon />}
                    label={todayBalance || stats?.isCurrentDayBalanced ? "Created" : "Not Created"}
                    color={todayBalance || stats?.isCurrentDayBalanced ? "success" : "warning"}
                  />
                </Box>
                {todayBalance && (
                  <Button 
                    variant="outlined"
                    onClick={() => navigate(`/cash-registry/balance-history`)}
                  >
                    View Balance Details
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Daily Balance Creation Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Daily Cash Balance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Today's Date: {new Date().toLocaleDateString()}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Opening Balance"
                  name="openingBalance"
                  type="number"
                  value={balanceForm.openingBalance}
                  onChange={handleFormChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    readOnly: true
                  }}
                  helperText="Opening balance is based on last closing balance"
                  margin="normal"
                />
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Today's Transactions
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Receipts:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats ? formatCurrency(stats.receiptsToday) : 'N/A'}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Disbursements:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats ? formatCurrency(stats.disbursementsToday) : 'N/A'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">Expected Closing Balance:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {stats ? formatCurrency(stats.currentBalance) : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                
                {/* Warning for different values */}
                {stats && calculatedTotal > 0 && calculatedTotal !== stats.currentBalance && (
                  <Alert 
                    severity={calculatedTotal > stats.currentBalance ? "info" : "warning"}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    <Typography variant="body2">
                      {calculatedTotal > stats.currentBalance 
                        ? `Surplus of ${formatCurrency(getDifference())}`
                        : `Deficit of ${formatCurrency(Math.abs(getDifference()))}`}
                    </Typography>
                    <Typography variant="caption">
                      {calculatedTotal > stats.currentBalance 
                        ? "The counted amount is higher than the expected balance."
                        : "The counted amount is lower than the expected balance."}
                    </Typography>
                  </Alert>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom align="center">
                    Total Counted: {formatCurrency(calculatedTotal)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Denomination Count
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹2000 Notes"
                      name="denom.notes2000"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes2000}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹500 Notes"
                      name="denom.notes500"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes500}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹200 Notes"
                      name="denom.notes200"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes200}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹100 Notes"
                      name="denom.notes100"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes100}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹50 Notes"
                      name="denom.notes50"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes50}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹20 Notes"
                      name="denom.notes20"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes20}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="₹10 Notes"
                      name="denom.notes10"
                      type="number"
                      value={balanceForm.closingDenominationDetails.notes10}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Coins (total value)"
                      name="denom.coins"
                      type="number"
                      value={balanceForm.closingDenominationDetails.coins}
                      onChange={handleFormChange}
                      margin="normal"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitBalance} 
            variant="contained"
            disabled={!isFormValid() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Create Balance Sheet
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DailyBalanceView; 