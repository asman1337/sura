import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  List,
  Button,
  Divider,
  useTheme,
  ListItem,
  IconButton,
  Typography,
  CardHeader,
  CardContent,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  ArrowForward as ArrowForwardIcon,
  BalanceOutlined as BalanceIcon
} from '@mui/icons-material';
import { useCashRegistry, useDailyBalance } from '../hooks';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';
import { CashRegistryEntry, TransactionType } from '../types';
import { PageContainer } from './common';

/**
 * Dashboard component for the Cash Registry plugin
 * Shows statistics and recent transactions
 */
const CashRegistryDashboard: React.FC = () => {
  const theme = useTheme();
  const { api } = useData();
  const { entries, loading: entriesLoading, error: entriesError, loadEntries } = useCashRegistry();
  const { stats, loading: statsLoading, error: statsError, loadStats } = useDailyBalance();
  
  const [recentEntries, setRecentEntries] = useState<CashRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load stats and entries in parallel for better performance
        await Promise.all([
          loadStats(),
          loadEntries()
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error loading Cash Registry data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [loadStats, loadEntries]);
  
  // Update recent entries when entries change
  useEffect(() => {
    if (entries && entries.length > 0) {
      // Sort and get recent entries
      const sorted = [...entries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      setRecentEntries(sorted);
    }
  }, [entries]);
  
  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Load stats and entries in parallel
      await Promise.all([
        loadStats(),
        loadEntries()
      ]);
      
      setError(null);
    } catch (err) {
      console.error('Error refreshing Cash Registry data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2 
    }).format(amount);
  };
  
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
  
  const isLoading = loading || entriesLoading || statsLoading;
  const errorMessage = error || entriesError || statsError;
  
  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          Cash Registry Management
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
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
            New Transaction
          </Button>
        </Box>
      </Box>
      
      {errorMessage && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">
            {typeof errorMessage === 'string' ? errorMessage : 'An error occurred'}
          </Typography>
        </Box>
      )}
      
      {/* Overlay for loading state */}
      {isLoading && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Current Balance</Typography>
                  <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                    {stats ? formatCurrency(stats.currentBalance) : '—'}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              </Box>
              <Button
                size="small"
                component={RouterLink}
                to="/cash-registry/daily-balance"
                endIcon={<ArrowForwardIcon />}
              >
                Daily Balance
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Today's Receipts</Typography>
                  <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                    {stats ? formatCurrency(stats.receiptsToday) : '—'}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ color: 'success.main', fontSize: 40 }} />
              </Box>
              <Button
                size="small"
                component={RouterLink}
                to="/cash-registry/receipts"
                endIcon={<ArrowForwardIcon />}
              >
                View Receipts
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Today's Disbursements</Typography>
                  <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                    {stats ? formatCurrency(stats.disbursementsToday) : '—'}
                  </Typography>
                </Box>
                <PaymentIcon sx={{ color: theme.palette.info.main, fontSize: 40 }} />
              </Box>
              <Button
                size="small"
                component={RouterLink}
                to="/cash-registry/disbursements"
                endIcon={<ArrowForwardIcon />}
              >
                View Disbursements
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Previous Balance</Typography>
                  <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                    {stats && stats.lastClosingBalance ? formatCurrency(stats.lastClosingBalance) : '—'}
                  </Typography>
                </Box>
                <BalanceIcon sx={{ color: theme.palette.warning.main, fontSize: 40 }} />
              </Box>
              <Button
                size="small"
                component={RouterLink}
                to="/cash-registry/balance-history"
                endIcon={<ArrowForwardIcon />}
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent transactions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%' }}>
            <CardHeader 
              title="Recent Receipts" 
              action={
                <IconButton component={RouterLink} to="/cash-registry/receipts">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <List>
              {recentEntries
                .filter(entry => entry.transactionType === TransactionType.RECEIPT)
                .slice(0, 5)
                .map(entry => (
                  <React.Fragment key={entry.id}>
                    <ListItem 
                      component={RouterLink}
                      to={`/cash-registry/transaction/${entry.id}`}
                      secondaryAction={
                        <Typography variant="body2" color="textSecondary">
                          {formatCurrency(entry.amount)}
                        </Typography>
                      }
                    >
                      <ListItemText 
                        primary={entry.documentNumber}
                        secondary={`${entry.source || 'N/A'} ${entry.caseReference ? `- Case: ${entry.caseReference}` : ''}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              }
              {recentEntries.filter(entry => entry.transactionType === TransactionType.RECEIPT).length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent receipts" />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%' }}>
            <CardHeader 
              title="Recent Disbursements" 
              action={
                <IconButton component={RouterLink} to="/cash-registry/disbursements">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <List>
              {recentEntries
                .filter(entry => entry.transactionType === TransactionType.DISBURSEMENT)
                .slice(0, 5)
                .map(entry => (
                  <React.Fragment key={entry.id}>
                    <ListItem
                      component={RouterLink}
                      to={`/cash-registry/transaction/${entry.id}`}
                      secondaryAction={
                        <Typography variant="body2" color="textSecondary">
                          {formatCurrency(entry.amount)}
                        </Typography>
                      }
                    >
                      <ListItemText 
                        primary={entry.documentNumber}
                        secondary={`${entry.purpose || 'N/A'} ${entry.caseReference ? `- Case: ${entry.caseReference}` : ''}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              }
              {recentEntries.filter(entry => entry.transactionType === TransactionType.DISBURSEMENT).length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent disbursements" />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default CashRegistryDashboard; 