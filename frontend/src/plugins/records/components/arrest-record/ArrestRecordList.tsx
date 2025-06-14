import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useRecords } from '../../hooks/useRecords';
import { ArrestRecord } from '../../types';
import { PageContainer } from '../common';

const ArrestRecordList: React.FC = () => {
  const navigate = useNavigate();
  const { records, loading, error } = useRecords('arrest_record');
  const [searchTerm, setSearchTerm] = useState('');
  const [partTypeFilter, setPartTypeFilter] = useState<string>('all');

  // Filter and cast records to ArrestRecord type
  const arrestRecords = records.filter(record => record.type === 'arrest_record') as ArrestRecord[];

  const filteredRecords = arrestRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.accusedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.arrestingOfficerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.caseReference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPartType = partTypeFilter === 'all' || record.partType === partTypeFilter;
    
    return matchesSearch && matchesPartType;
  });
  const handleCreateNew = () => {
    navigate('/records/create/arrest-record');
  };
  const handleView = (recordId: string) => {
    navigate(`/records/arrest-record/${recordId}`);
  };

  const handleEdit = (recordId: string) => {
    navigate(`/records/edit/arrest-record/${recordId}`);
  };

  const getPartTypeColor = (partType: string) => {
    return partType === 'part1' ? 'primary' : 'secondary';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Arrest Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          New Arrest Record
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by accused name, officer, or case reference..."
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
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Part Type</InputLabel>
              <Select
                value={partTypeFilter}
                label="Part Type"
                onChange={(e) => setPartTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Parts</MenuItem>
                <MenuItem value="part1">Part 1</MenuItem>
                <MenuItem value="part2">Part 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                sx={{ mb: { xs: 2, md: 0 } }}
              >
                Create New Arrest Record
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Serial No.</TableCell>
                  <TableCell>Part Type</TableCell>
                  <TableCell>Accused Name</TableCell>
                  <TableCell>Arresting Officer</TableCell>
                  <TableCell>Date of Arrest</TableCell>
                  <TableCell>Case Reference</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <GavelIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary">
                          No arrest records found
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleCreateNew}
                        >
                          Create First Arrest Record
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {record.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.partType.toUpperCase()}
                          color={getPartTypeColor(record.partType) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {record.accusedName}
                        </Typography>
                        {record.accusedPCN && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            PCN: {record.accusedPCN}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.arrestingOfficerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(record.dateOfArrest)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.caseReference || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleView(record.id)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(record.id)}
                              color="secondary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ArrestRecordList;
