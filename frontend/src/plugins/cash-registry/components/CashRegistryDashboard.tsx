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
  CircularProgress,
  Paper,
  Grow,
  Fade,
  alpha,
  Tooltip,
  Stack,
  LinearProgress,
  Avatar,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  ArrowForward as ArrowForwardIcon,
  BalanceOutlined as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon
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
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  
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
      setRefreshAnimation(true);
      
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
      setTimeout(() => setRefreshAnimation(false), 1000);
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
  
  // Format enum values for display
  const formatEnumValue = (value: string): string => {
    if (!value) return '';
    return value.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  // Get short formatted date
  const getShortDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
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
  
  // Calculate totals
  const totalCash = stats ? stats.currentBalance : 0;
  const totalReceipts = stats ? stats.receiptsToday : 0;
  const totalDisbursements = stats ? stats.disbursementsToday : 0;
  const lastBalance = stats && stats.lastClosingBalance ? stats.lastClosingBalance : 0;
  
  return (
    <PageContainer>
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Fade in={true} timeout={800}>
          <Typography 
            variant="h4" 
            fontWeight="500"
            sx={{ 
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2
              }
            }}
          >
            Cash Registry Management
          </Typography>
        </Fade>
        
        <Box>
          <Tooltip title="Refresh data">
            <Button
              variant="outlined"
              startIcon={
                <RefreshIcon 
                  sx={{ 
                    animation: refreshAnimation ? 
                      'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} 
                />
              }
              onClick={handleRefresh}
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/cash-registry/add"
            sx={{ 
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            New Transaction
          </Button>
        </Box>
      </Box>
      
      {errorMessage && (
        <Fade in={true}>
          <Paper 
            sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.error.light, 0.9), 
              borderRadius: 1,
              boxShadow: 2
            }}
          >
            <Typography color="error.contrastText">
              {typeof errorMessage === 'string' ? errorMessage : 'An error occurred'}
            </Typography>
          </Paper>
        </Fade>
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading data...
          </Typography>
        </Box>
      )}
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Grow in={true} timeout={500}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: 3,
                borderRadius: 2,
                transition: 'all 0.3s',
                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  right: -20,
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  background: alpha(theme.palette.primary.main, 0.1),
                  zIndex: 0
                }} 
              />
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight={500}>Current Balance</Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40
                    }}
                  >
                    <AccountBalanceIcon />
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  {stats ? formatCurrency(totalCash) : '—'}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    color: 'primary.main'
                  }}
                >
                  <Button
                    size="small"
                    component={RouterLink}
                    to="/cash-registry/daily-balance"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    Daily Balance
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Grow in={true} timeout={700}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: 3,
                borderRadius: 2,
                transition: 'all 0.3s',
                background: `linear-gradient(45deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.light, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  right: -20,
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  background: alpha(theme.palette.success.main, 0.1),
                  zIndex: 0
                }} 
              />
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight={500}>Today's Receipts</Typography>
                  <Badge 
                    badgeContent={
                      recentEntries.filter(e => e.transactionType === TransactionType.RECEIPT).length
                    } 
                    color="success"
                    max={99}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.success.main, 0.1), 
                        color: theme.palette.success.main,
                        width: 40,
                        height: 40
                      }}
                    >
                      <ReceiptIcon />
                    </Avatar>
                  </Badge>
                </Box>
                <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  {stats ? formatCurrency(totalReceipts) : '—'}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    color: 'success.main'
                  }}
                >
                  <Button
                    size="small"
                    component={RouterLink}
                    to="/cash-registry/receipts"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'success.main',
                      '&:hover': {
                        background: alpha(theme.palette.success.main, 0.1)
                      }
                    }}
                  >
                    View Receipts
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Grow in={true} timeout={900}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: 3,
                borderRadius: 2,
                transition: 'all 0.3s',
                background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.light, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  right: -20,
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  background: alpha(theme.palette.info.main, 0.1),
                  zIndex: 0
                }} 
              />
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight={500}>Today's Disbursements</Typography>
                  <Badge 
                    badgeContent={
                      recentEntries.filter(e => e.transactionType === TransactionType.DISBURSEMENT).length
                    } 
                    color="info"
                    max={99}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.info.main, 0.1), 
                        color: theme.palette.info.main,
                        width: 40,
                        height: 40
                      }}
                    >
                      <PaymentIcon />
                    </Avatar>
                  </Badge>
                </Box>
                <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  {stats ? formatCurrency(totalDisbursements) : '—'}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    color: 'info.main'
                  }}
                >
                  <Button
                    size="small"
                    component={RouterLink}
                    to="/cash-registry/disbursements"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'info.main',
                      '&:hover': {
                        background: alpha(theme.palette.info.main, 0.1)
                      }
                    }}
                  >
                    View Disbursements
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Grow in={true} timeout={1100}>
            <Card 
              sx={{ 
                height: '100%',
                boxShadow: 3,
                borderRadius: 2,
                transition: 'all 0.3s',
                background: `linear-gradient(45deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  right: -20,
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  background: alpha(theme.palette.warning.main, 0.1),
                  zIndex: 0
                }} 
              />
              <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight={500}>Previous Balance</Typography>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.main, 0.1), 
                      color: theme.palette.warning.main,
                      width: 40,
                      height: 40
                    }}
                  >
                    <BalanceIcon />
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  {stats && stats.lastClosingBalance ? formatCurrency(lastBalance) : '—'}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    color: 'warning.main'
                  }}
                >
                  <Button
                    size="small"
                    component={RouterLink}
                    to="/cash-registry/balance-history"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'warning.main',
                      '&:hover': {
                        background: alpha(theme.palette.warning.main, 0.1)
                      }
                    }}
                  >
                    View History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
      
      {/* Recent transactions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Fade in={true} timeout={1300}>
            <Card 
              sx={{ 
                width: '100%', 
                boxShadow: 2, 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>Recent Receipts</Typography>
                  </Box>
                }
                action={
                  <Tooltip title="View all receipts">
                    <IconButton component={RouterLink} to="/cash-registry/receipts" size="small">
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  bgcolor: alpha(theme.palette.success.main, 0.03)
                }}
              />
              {loading ? (
                <Box sx={{ p: 2 }}>
                  <LinearProgress color="success" sx={{ mb: 1 }} />
                  <Stack spacing={2}>
                    {[...Array(3)].map((_, i) => (
                      <Paper 
                        key={i}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.grey[200], 0.5)
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentEntries
                    .filter(entry => entry.transactionType === TransactionType.RECEIPT)
                    .slice(0, 5)
                    .map((entry, index) => (
                      <React.Fragment key={entry.id}>
                        <ListItem 
                          component={RouterLink}
                          to={`/cash-registry/transaction/${entry.id}`}
                          sx={{ 
                            py: 2,
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.light, 0.1)
                            }
                          }}
                          secondaryAction={
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: 'success.main',
                                  fontSize: '1.1rem',
                                  mb: 0.5
                                }}
                              >
                                {formatCurrency(entry.amount)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              >
                                <CalendarIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                {getShortDate(entry.createdAt)}
                              </Typography>
                            </Box>
                          }
                        >
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box 
                                  sx={{ 
                                    mr: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '12px',
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main'
                                  }}
                                >
                                  <TrendingUpIcon fontSize="small" />
                                </Box>
                                <Typography variant="body1" fontWeight={500} color="text.primary">
                                  {entry.documentNumber}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ pl: 7 }}
                              >
                                {entry.source ? formatEnumValue(entry.source) : 'N/A'} 
                                {entry.caseReference ? ` - Case: ${entry.caseReference}` : ''}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentEntries.filter(e => e.transactionType === TransactionType.RECEIPT).length - 1 && (
                          <Divider component="li" sx={{ opacity: 0.6 }} />
                        )}
                      </React.Fragment>
                    ))
                  }
                  {recentEntries.filter(entry => entry.transactionType === TransactionType.RECEIPT).length === 0 && (
                    <ListItem sx={{ py: 4 }}>
                      <ListItemText 
                        primary={
                          <Typography align="center" color="text.secondary">
                            No recent receipts
                          </Typography>
                        } 
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </Card>
          </Fade>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Fade in={true} timeout={1500}>
            <Card 
              sx={{ 
                width: '100%', 
                boxShadow: 2, 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PaymentIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>Recent Disbursements</Typography>
                  </Box>
                }
                action={
                  <Tooltip title="View all disbursements">
                    <IconButton component={RouterLink} to="/cash-registry/disbursements" size="small">
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  bgcolor: alpha(theme.palette.info.main, 0.03)
                }}
              />
              {loading ? (
                <Box sx={{ p: 2 }}>
                  <LinearProgress color="info" sx={{ mb: 1 }} />
                  <Stack spacing={2}>
                    {[...Array(3)].map((_, i) => (
                      <Paper 
                        key={i}
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.grey[200], 0.5)
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentEntries
                    .filter(entry => entry.transactionType === TransactionType.DISBURSEMENT)
                    .slice(0, 5)
                    .map((entry, index) => (
                      <React.Fragment key={entry.id}>
                        <ListItem 
                          component={RouterLink}
                          to={`/cash-registry/transaction/${entry.id}`}
                          sx={{ 
                            py: 2,
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.light, 0.1)
                            }
                          }}
                          secondaryAction={
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: 'info.main',
                                  fontSize: '1.1rem',
                                  mb: 0.5
                                }}
                              >
                                {formatCurrency(entry.amount)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                              >
                                <CalendarIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                {getShortDate(entry.createdAt)}
                              </Typography>
                            </Box>
                          }
                        >
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box 
                                  sx={{ 
                                    mr: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '12px',
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: 'info.main'
                                  }}
                                >
                                  <TrendingDownIcon fontSize="small" />
                                </Box>
                                <Typography variant="body1" fontWeight={500} color="text.primary">
                                  {entry.documentNumber}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ pl: 7 }}
                              >
                                {entry.purpose ? formatEnumValue(entry.purpose) : 'N/A'} 
                                {entry.caseReference ? ` - Case: ${entry.caseReference}` : ''}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentEntries.filter(e => e.transactionType === TransactionType.DISBURSEMENT).length - 1 && (
                          <Divider component="li" sx={{ opacity: 0.6 }} />
                        )}
                      </React.Fragment>
                    ))
                  }
                  {recentEntries.filter(entry => entry.transactionType === TransactionType.DISBURSEMENT).length === 0 && (
                    <ListItem sx={{ py: 4 }}>
                      <ListItemText 
                        primary={
                          <Typography align="center" color="text.secondary">
                            No recent disbursements
                          </Typography>
                        } 
                      />
                    </ListItem>
                  )}
                </List>
              )}
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default CashRegistryDashboard; 