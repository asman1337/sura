import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Button,
  Typography,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { useRecordsApi } from '../hooks';
import { useRecords } from '../hooks/useRecords';
import { RecordType, UDCaseRecord, StolenPropertyRecord, PaperDispatchRecord } from '../types';
import { PageContainer } from './common';
import { formatDate } from '../utils/formatters';

// Helper function to get a readable name for record types
const getRecordTypeName = (type: RecordType): string => {
  switch (type) {
    case 'ud_case':
      return 'UD Case';
    case 'stolen_property':
      return 'Stolen Property';
    case 'paper_dispatch':
      return 'Paper Dispatch';
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
  const theme = useTheme();
  const recordsApi = useRecordsApi();
  const { records, loading, error, refreshData, deleteRecord } = useRecords(recordType as RecordType);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    
    const searchLower = searchTerm.toLowerCase();
    
    return records.filter(record => {
      // Generic fields to search
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
      } else if (record.type === 'paper_dispatch') {
        const paperDispatch = record as PaperDispatchRecord;
        if (paperDispatch.serialNumber?.toLowerCase().includes(searchLower)) return true;
        if (paperDispatch.fromWhom?.toLowerCase().includes(searchLower)) return true;
        if (paperDispatch.toWhom?.toLowerCase().includes(searchLower)) return true;
        if (paperDispatch.purpose?.toLowerCase().includes(searchLower)) return true;
        if (paperDispatch.memoNumber?.toLowerCase().includes(searchLower)) return true;
        if (paperDispatch.formType?.toLowerCase().includes(searchLower)) return true;
        if (paperDispatch.registryType?.toLowerCase().includes(searchLower)) return true;
      }
      
      return false;
    });
  }, [records, searchTerm]);

  // Define columns for DataGrid
  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [];

    // Type-specific columns (no ID column)
    if (recordType === 'ud_case') {
      baseColumns.push(
        {
          field: 'caseNumber',
          headerName: 'Case Number',
          width: 150,
          renderCell: (params) => params.row.caseNumber || 'N/A'
        },
        {
          field: 'deceasedName',
          headerName: 'Deceased Name',
          width: 180,
          renderCell: (params) => params.row.deceasedName || 'Unidentified'
        },
        {
          field: 'dateOfOccurrence',
          headerName: 'Date of Occurrence',
          width: 160,
          renderCell: (params) => formatDate(params.row.dateOfOccurrence)
        },
        {
          field: 'investigationStatus',
          headerName: 'Investigation Status',
          width: 160,
          renderCell: (params) => (
            <Chip
              label={params.row.investigationStatus || 'pending'}
              color={
                params.row.investigationStatus === 'pending' ? 'warning' :
                params.row.investigationStatus === 'investigation' ? 'info' :
                'success'
              }
              size="small"
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 'medium'
              }}
            />
          )
        }
      );    } else if (recordType === 'stolen_property') {
      baseColumns.push(
        {
          field: 'propertyId',
          headerName: 'Property ID',
          width: 150,
          renderCell: (params) => params.row.propertyId || 'N/A'
        },
        {
          field: 'propertyType',
          headerName: 'Property Type',
          width: 150,
          renderCell: (params) => params.row.propertyType || 'N/A'
        },
        {
          field: 'estimatedValue',
          headerName: 'Value',
          width: 120,
          renderCell: (params) => `₹${params.row.estimatedValue?.toLocaleString() || '0'}`
        },
        {
          field: 'recoveryStatus',
          headerName: 'Recovery Status',
          width: 160,
          renderCell: (params) => (
            <Chip
              label={params.row.recoveryStatus || 'reported'}
              color={
                params.row.recoveryStatus === 'reported' ? 'error' :
                params.row.recoveryStatus === 'investigation' ? 'warning' :
                params.row.recoveryStatus === 'recovered' ? 'success' :
                'default'
              }
              size="small"
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 'medium'
              }}
            />
          )
        }
      );
    } else if (recordType === 'paper_dispatch') {
      baseColumns.push(
        {
          field: 'serialNumber',
          headerName: 'Serial Number',
          width: 150,
          renderCell: (params) => params.row.serialNumber || 'N/A'
        },
        {
          field: 'formType',
          headerName: 'Form Type',
          width: 120,
          renderCell: (params) => {
            const formType = params.row.formType;
            const displayText = formType === 'part1' ? 'Part 1' : 
                               formType === 'part2' ? 'Part 2' : 
                               formType === 'part4' ? 'Part 4' : formType;
            return displayText || 'N/A';
          }
        },
        {
          field: 'fromWhom',
          headerName: 'From Whom',
          width: 180,
          renderCell: (params) => params.row.fromWhom || 'N/A'
        },
        {
          field: 'toWhom',
          headerName: 'To Whom',
          width: 180,
          renderCell: (params) => params.row.toWhom || 'N/A'
        },
        {
          field: 'registryType',
          headerName: 'Registry',
          width: 120,
          renderCell: (params) => (
            <Chip
              label={params.row.registryType === 'BLACK_INK' ? 'Black Ink' : 'Red Ink'}
              color={params.row.registryType === 'BLACK_INK' ? 'success' : 'error'}
              size="small"
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 'medium'
              }}
            />
          )
        },
        {
          field: 'dateOfReceive',
          headerName: 'Date Received',
          width: 150,
          renderCell: (params) => formatDate(params.row.dateOfReceive)
        }
      );
    }

    // Common columns
    baseColumns.push(
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.row.status}
            color={
              params.row.status === 'active' ? 'success' :
              params.row.status === 'archived' ? 'warning' :
              'error'
            }
            size="small"
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 'medium'
            }}
          />
        )
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 150,
        renderCell: (params) => formatDate(params.row.createdAt)
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 150,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="View"
            onClick={() => handleViewRecord(params.row)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditRecord(params.row)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.id)}
            disabled={isDeleting}
          />
        ]
      }
    );

    return baseColumns;
  };

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
  const handleViewRecord = (record: UDCaseRecord | StolenPropertyRecord | PaperDispatchRecord) => {
    if (record.type === 'ud_case') {
      navigate(`/records/ud-case/${record.id}`);
    } else if (record.type === 'stolen_property') {
      navigate(`/records/stolen-property/${record.id}`);
    } else if (record.type === 'paper_dispatch') {
      navigate(`/records/paper-dispatch/${record.id}`);
    }
  };
  const handleEditRecord = (record: UDCaseRecord | StolenPropertyRecord | PaperDispatchRecord) => {
    if (record.type === 'ud_case') {
      navigate(`/records/edit/ud-case/${record.id}`);
    } else if (record.type === 'stolen_property') {
      navigate(`/records/edit/stolen-property/${record.id}`);
    } else if (record.type === 'paper_dispatch') {
      navigate(`/records/edit/paper-dispatch/${record.id}`);
    }
  };

  const handleCreateRecord = () => {
    if (recordType === 'ud_case') {
      navigate('/records/create/ud-case');
    } else if (recordType === 'stolen_property') {
      navigate('/records/create/stolen-property');
    } else if(recordType === 'paper_dispatch') {
      navigate('/records/create/paper-dispatch');
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

      {/* Records DataGrid */}
      <Paper 
        sx={{ 
          width: '100%', 
          height: 'calc(100vh - 300px)',
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <DataGrid
          rows={filteredRecords}
          columns={getColumns()}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No records found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding a new record'}
                </Typography>
              </Box>
            ),
          }}
        />
      </Paper>
    </PageContainer>
  );
};

export default RecordsList; 