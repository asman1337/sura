import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Grid,
  Button,
  Dialog,
  Divider,
  Tooltip,
  Typography,
  CardContent,
  CardHeader,
  IconButton,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useData } from '../../../core/data';
import { useCashRegistry } from '../hooks';
import { formatDate } from '../../../utils/date';
import { setGlobalApiInstance } from '../services';
import { CashRegistryEntry, TransactionType } from '../types';
import { PageContainer } from './common';

/**
 * Component to display transaction details
 */
const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { api } = useData();
  const { getEntry, loading: apiLoading, error: apiError } = useCashRegistry();
  
  const [transaction, setTransaction] = useState<CashRegistryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Set API instance
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);

  // Load transaction data
  useEffect(() => {
    if (!id) return;
    
    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const entry = await getEntry(id);
        if (entry) {
          setTransaction(entry);
        } else {
          setError('Transaction not found');
        }
      } catch (err) {
        setError('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, getEntry]);

  // Format currency amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
  
  // Handle delete confirmation
  const handleDeleteTransaction = async () => {
    // This will be implemented in a separate hook 
    // We'll just navigate back for now
    handleCloseDeleteDialog();
    navigate('/cash-registry');
  };

  // Get error message as string
  const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return 'An error occurred';
  };

  if (loading || apiLoading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || apiError || !transaction) {
    return (
      <PageContainer>
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(error || apiError || 'Transaction not found')}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cash-registry')}
        >
          Back to Cash Registry
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          {transaction.transactionType === TransactionType.RECEIPT ? 'Receipt' : 'Disbursement'} Details
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {transaction.transactionType === TransactionType.RECEIPT ? (
                    <ReceiptIcon sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <PaymentIcon sx={{ color: 'info.main', mr: 1 }} />
                  )}
                  <Typography variant="h5">
                    {transaction.documentNumber}
                  </Typography>
                </Box>
              }
              action={
                <Box>
                  <Tooltip title="Print">
                    <IconButton sx={{ mr: 1 }}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      sx={{ mr: 1 }} 
                      onClick={() => navigate(`/cash-registry/edit/${transaction.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={handleOpenDeleteDialog}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
                  <Chip
                    label={transaction.transactionType}
                    color={transaction.transactionType === TransactionType.RECEIPT ? 'success' : 'info'}
                    sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                  />
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {formatCurrency(transaction.amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recorded on {formatDate(transaction.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(transaction.createdAt)}
                  </Typography>
                </Grid>
                
                {transaction.caseReference && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Case Reference
                    </Typography>
                    <Typography variant="body1">
                      {transaction.caseReference}
                    </Typography>
                  </Grid>
                )}
                
                {transaction.transactionType === TransactionType.RECEIPT && transaction.source && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Source
                    </Typography>
                    <Typography variant="body1">
                      {transaction.source.replace('_', ' ')}
                    </Typography>
                  </Grid>
                )}
                
                {transaction.transactionType === TransactionType.DISBURSEMENT && transaction.purpose && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Purpose
                    </Typography>
                    <Typography variant="body1">
                      {transaction.purpose.replace('_', ' ')}
                    </Typography>
                  </Grid>
                )}
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Handled By
                  </Typography>
                  <Typography variant="body1">
                    {transaction.handledBy ? 
                      `${transaction.handledBy.firstName} ${transaction.handledBy.lastName}` :
                      'Unknown'}
                  </Typography>
                </Grid>
                
                {transaction.attestedBy && (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Attested By
                    </Typography>
                    <Typography variant="body1">
                      {`${transaction.attestedBy.firstName} ${transaction.attestedBy.lastName}`}
                    </Typography>
                  </Grid>
                )}
                
                {transaction.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {transaction.notes}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {transaction.denominationDetails && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Denomination Details
                      </Typography>
                      <Grid container spacing={2}>
                        {transaction.denominationDetails.notes2000 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹2000 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes2000}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.notes500 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹500 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes500}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.notes200 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹200 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes200}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.notes100 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹100 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes100}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.notes50 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹50 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes50}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.notes20 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹20 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes20}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.notes10 > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">₹10 notes</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.notes10}</Typography>
                            </Card>
                          </Grid>
                        )}
                        
                        {transaction.denominationDetails.coins > 0 && (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Card variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" color="text.secondary">Coins</Typography>
                              <Typography variant="h6">{transaction.denominationDetails.coins}</Typography>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title="Transaction Status" />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reconciliation Status
                </Typography>
                <Chip
                  label={transaction.isReconciled ? 'Reconciled' : 'Pending Reconciliation'}
                  color={transaction.isReconciled ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                />
                {transaction.isReconciled && transaction.reconciledAt && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Reconciled on {formatDate(transaction.reconciledAt)}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Attestation Status
                </Typography>
                <Chip
                  label={transaction.attestedById ? 'Attested' : 'Pending Attestation'}
                  color={transaction.attestedById ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                />
                {transaction.attestedAt && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Attested on {formatDate(transaction.attestedAt)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {transaction.transactionType.toLowerCase()}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTransaction} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TransactionDetail; 