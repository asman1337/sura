import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRecordsApi } from '../hooks';
import { useRecords } from '../hooks/useRecords';
import { RecordType, UDCaseRecord, StolenPropertyRecord } from '../types';
import { PageContainer } from './common';
import { formatDate } from '../utils/formatters';

// Helper function to get a readable name for record types
const getRecordTypeName = (type: RecordType): string => {
  switch (type) {
    case 'ud_case':
      return 'UD Case';
    case 'stolen_property':
      return 'Stolen Property';
    case 'general_diary':
      return 'General Diary';
    case 'fir':
      return 'FIR';
    case 'arrest_memo':
      return 'Arrest Memo';
    default:
      return type;
  }
};

const RecordsList: React.FC = () => {
  const { recordType } = useParams<{ recordType: RecordType }>();
  const navigate = useNavigate();
  const recordsApi = useRecordsApi();
  const { records, loading, error, refreshData, deleteRecord } = useRecords(recordType as RecordType);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter records based on search term
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Generic fields to search
    if (record.id.toLowerCase().includes(searchLower)) return true;
    if (record.status.toLowerCase().includes(searchLower)) return true;
    if (record.remarks?.toLowerCase().includes(searchLower)) return true;
    
    // Type-specific fields
    if (record.type === 'ud_case') {
      const udCase = record as UDCaseRecord;
      if (udCase.caseNumber?.toLowerCase().includes(searchLower)) return true;
      if (udCase.deceasedName?.toLowerCase().includes(searchLower)) return true;
      if (udCase.informantName?.toLowerCase().includes(searchLower)) return true;
      if (udCase.location?.toLowerCase().includes(searchLower)) return true;
    } else if (record.type === 'stolen_property') {
      const property = record as StolenPropertyRecord;
      if (property.propertyId?.toLowerCase().includes(searchLower)) return true;
      if (property.propertyType?.toLowerCase().includes(searchLower)) return true;
      if (property.description?.toLowerCase().includes(searchLower)) return true;
      if (property.ownerName?.toLowerCase().includes(searchLower)) return true;
    }
    
    return false;
  });

  // Update total records count
  useEffect(() => {
    // Safety check to prevent errors during initialization
    try {
      if (recordsApi && recordsApi.lastResponse) {
        console.log('Setting total records from API response:', recordsApi.lastResponse.total);
        setTotalRecords(recordsApi.lastResponse.total);
      } else {
        console.log('Setting total records from filtered records length:', filteredRecords.length);
        setTotalRecords(filteredRecords.length);
      }

      // Debug log the records to see what we're getting
      console.debug('Records loaded in RecordsList:', 
        records.length, 
        'records. First record:', 
        records.length > 0 ? records[0].id : 'none'
      );
    } catch (err) {
      console.error('Error updating total records:', err);
      setTotalRecords(filteredRecords.length);
    }
  }, [records, filteredRecords.length, recordsApi]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      setIsDeleting(true);
      setDeleteError(null);
      
      try {
        await deleteRecord(id, recordType as RecordType);
      } catch (err) {
        console.error('Error deleting record:', err);
        setDeleteError('Failed to delete record. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleViewRecord = (record: UDCaseRecord | StolenPropertyRecord) => {
    if (record.type === 'ud_case') {
      navigate(`/records/ud-case/${record.id}`);
    } else if (record.type === 'stolen_property') {
      navigate(`/records/stolen-property/${record.id}`);
    }
  };

  const handleEditRecord = (record: UDCaseRecord | StolenPropertyRecord) => {
    if (record.type === 'ud_case') {
      navigate(`/records/edit/ud-case/${record.id}`);
    } else if (record.type === 'stolen_property') {
      navigate(`/records/edit/stolen-property/${record.id}`);
    }
  };

  const handleCreateRecord = () => {
    if (recordType === 'ud_case') {
      navigate('/records/create/ud-case');
    } else if (recordType === 'stolen_property') {
      navigate('/records/create/stolen-property');
    } else {
      navigate('/records/create');
    }
  };

  if (!recordType) {
    return (
      <PageContainer>
        <Alert severity="error">
          No record type specified.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/records')}
          sx={{ mt: 2 }}
        >
          Back to Records
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header with actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {getRecordTypeName(recordType as RecordType)} Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredRecords.length} {searchTerm ? 'filtered' : ''} records 
            {totalRecords > 0 && filteredRecords.length !== totalRecords && !searchTerm ? 
              ` of ${totalRecords} total` : ''}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              console.log('Refreshing records...');
              refreshData();
            }}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRecord}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {/* Search and filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteError}
        </Alert>
      )}

      {/* Records table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {recordType === 'ud_case' && (
                  <>
                    <TableCell>Case Number</TableCell>
                    <TableCell>Deceased Name</TableCell>
                    <TableCell>Date of Occurrence</TableCell>
                    <TableCell>Investigation Status</TableCell>
                  </>
                )}
                {recordType === 'stolen_property' && (
                  <>
                    <TableCell>Property ID</TableCell>
                    <TableCell>Property Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Recovery Status</TableCell>
                  </>
                )}
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={recordType === 'ud_case' ? 7 : recordType === 'stolen_property' ? 7 : 4} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={recordType === 'ud_case' ? 7 : recordType === 'stolen_property' ? 7 : 4} align="center">
                    <Typography variant="body1" sx={{ my: 2 }}>
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.id.slice(0, 8)}...</TableCell>
                      
                      {recordType === 'ud_case' && record.type === 'ud_case' && (
                        <>
                          <TableCell>{record.caseNumber}</TableCell>
                          <TableCell>{record.deceasedName || 'Unidentified'}</TableCell>
                          <TableCell>{formatDate(record.dateOfOccurrence)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.investigationStatus || 'pending'}
                              color={
                                record.investigationStatus === 'pending' ? 'warning' :
                                record.investigationStatus === 'investigation' ? 'info' :
                                'success'
                              }
                              size="small"
                            />
                          </TableCell>
                        </>
                      )}
                      
                      {recordType === 'stolen_property' && record.type === 'stolen_property' && (
                        <>
                          <TableCell>{record.propertyId}</TableCell>
                          <TableCell>{record.propertyType}</TableCell>
                          <TableCell>₹{record.estimatedValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.recoveryStatus || 'reported'}
                              color={
                                record.recoveryStatus === 'reported' ? 'error' :
                                record.recoveryStatus === 'investigation' ? 'warning' :
                                record.recoveryStatus === 'recovered' ? 'success' :
                                'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </>
                      )}
                      
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'active' ? 'success' :
                            record.status === 'archived' ? 'warning' :
                            'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewRecord(record)}
                          title="View"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditRecord(record)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(record.id)}
                          title="Delete"
                          disabled={isDeleting}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={searchTerm ? filteredRecords.length : totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </PageContainer>
  );
};

export default RecordsList; 