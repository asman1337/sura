import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Button,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  CircularProgress,
  Select,
  Divider,
  Alert,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon 
} from '@mui/icons-material';
import { useData } from '../../../core/data';
import { useCashRegistry } from '../hooks';
import { setGlobalApiInstance } from '../services';
import { 
  CreateCashEntryDto,
  TransactionType,
  CashSource,
  DisbursementPurpose
} from '../types';
import { PageContainer } from './common';

interface TransactionFormProps {
  isEditing?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { api } = useData();
  const { 
    getEntry,
    createEntry, 
    updateEntry, 
    generateDocumentNumber,
    error: apiError 
  } = useCashRegistry();

  // Form state
  const [formData, setFormData] = useState<CreateCashEntryDto>({
    transactionType: TransactionType.RECEIPT,
    amount: 0,
    documentNumber: '',
    source: CashSource.SEIZED
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set API instance
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);

  // Load entry data when editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchEntry = async () => {
        setLoading(true);
        try {
          const entry = await getEntry(id);
          if (entry) {
            setFormData({
              transactionType: entry.transactionType,
              amount: entry.amount,
              documentNumber: entry.documentNumber,
              source: entry.source,
              purpose: entry.purpose,
              caseReference: entry.caseReference,
              notes: entry.notes
            });
          } else {
            setError('Entry not found');
            navigate('/cash-registry', { replace: true });
          }
        } catch (err) {
          setError('Failed to load entry');
        } finally {
          setLoading(false);
        }
      };
      
      fetchEntry();
    }
  }, [isEditing, id, getEntry, navigate]);

  // Generate document number when transaction type changes
  useEffect(() => {
    if (!isEditing) {
      const generateDoc = async () => {
        try {
          const docNum = await generateDocumentNumber(formData.transactionType);
          if (docNum) {
            setFormData(prev => ({
              ...prev,
              documentNumber: docNum
            }));
          }
        } catch (err) {
          console.error('Error generating document number:', err);
        }
      };
      
      generateDoc();
    }
  }, [formData.transactionType, isEditing, generateDocumentNumber]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle amount conversion
    if (name === 'amount') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle select change
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditing && id) {
        const updated = await updateEntry(id, formData);
        if (updated) {
          setSuccess('Entry updated successfully');
          setTimeout(() => navigate(`/cash-registry/transaction/${id}`), 1500);
        }
      } else {
        const created = await createEntry(formData);
        if (created) {
          setSuccess('Entry created successfully');
          setTimeout(() => navigate(`/cash-registry/transaction/${created.id}`), 1500);
        }
      }
    } catch (err) {
      setError('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  // Determine if form is valid
  const isValid = () => {
    if (!formData.amount || formData.amount <= 0) return false;
    if (!formData.documentNumber) return false;
    
    if (formData.transactionType === TransactionType.RECEIPT && !formData.source) {
      return false;
    }
    
    if (formData.transactionType === TransactionType.DISBURSEMENT && !formData.purpose) {
      return false;
    }
    
    return true;
  };

  // Get error message as string
  const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return 'An error occurred';
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="500">
          {isEditing ? 'Edit Transaction' : 'New Transaction'}
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>
      
      {(error || apiError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(error || apiError)}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader 
                title={
                  formData.transactionType === TransactionType.RECEIPT 
                    ? 'Receipt Details'
                    : 'Disbursement Details'
                }
                avatar={
                  formData.transactionType === TransactionType.RECEIPT 
                    ? <ReceiptIcon color="success" />
                    : <PaymentIcon color="info" />
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                      <Select
                        labelId="transaction-type-label"
                        id="transactionType"
                        name="transactionType"
                        value={formData.transactionType}
                        label="Transaction Type"
                        onChange={handleSelectChange}
                        disabled={isEditing}
                      >
                        <MenuItem value={TransactionType.RECEIPT}>Receipt</MenuItem>
                        <MenuItem value={TransactionType.DISBURSEMENT}>Disbursement</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      id="documentNumber"
                      name="documentNumber"
                      label="Document Number"
                      value={formData.documentNumber}
                      onChange={handleChange}
                      disabled={true} // Auto-generated
                      helperText="Auto-generated document number"
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      id="amount"
                      name="amount"
                      label="Amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      id="caseReference"
                      name="caseReference"
                      label="Case Reference"
                      value={formData.caseReference || ''}
                      onChange={handleChange}
                      placeholder="FIR number, case ID, etc."
                    />
                  </Grid>
                  
                  {formData.transactionType === TransactionType.RECEIPT && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth required>
                        <InputLabel id="source-label">Source</InputLabel>
                        <Select
                          labelId="source-label"
                          id="source"
                          name="source"
                          value={formData.source || ''}
                          label="Source"
                          onChange={handleSelectChange}
                        >
                          {Object.values(CashSource).map(source => (
                            <MenuItem key={source} value={source}>
                              {source.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {formData.transactionType === TransactionType.DISBURSEMENT && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth required>
                        <InputLabel id="purpose-label">Purpose</InputLabel>
                        <Select
                          labelId="purpose-label"
                          id="purpose"
                          name="purpose"
                          value={formData.purpose || ''}
                          label="Purpose"
                          onChange={handleSelectChange}
                        >
                          {Object.values(DisbursementPurpose).map(purpose => (
                            <MenuItem key={purpose} value={purpose}>
                              {purpose.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      id="notes"
                      name="notes"
                      label="Notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="Actions" />
              <Divider />
              <CardContent>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading || !isValid()}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ mb: 2 }}
                >
                  {isEditing ? 'Update Transaction' : 'Save Transaction'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate('/cash-registry')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </PageContainer>
  );
};

export default TransactionForm; 