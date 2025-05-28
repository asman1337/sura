import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { dateFormatter, statusCellRenderer } from './MalkhanaDataGrid';

// Basic columns used in most registry/item tables
export const commonItemColumns: GridColDef[] = [
  { 
    field: 'motherNumber', 
    headerName: 'Mother #',
    flex: 1,
    minWidth: 140,
  },
  { 
    field: 'registryNumber', 
    headerName: 'Registry #', 
    width: 130,
  },
  { 
    field: 'caseNumber', 
    headerName: 'Case Number', 
    flex: 1,
    minWidth: 120,
  },
  { 
    field: 'description', 
    headerName: 'Description', 
    flex: 2,
    minWidth: 200,
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 150,
  },
  {
    field: 'dateReceived',
    headerName: 'Date Received',
    width: 130,
    valueFormatter: dateFormatter,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: statusCellRenderer,
  }
];

// For Black Ink Registry specifically
export const blackInkColumns: GridColDef[] = [
  ...commonItemColumns,
  {
    field: 'prNumber',
    headerName: 'PR Number',
    width: 120,
    valueFormatter: (value) => value || '-',
  },
  {
    field: 'gdeNumber',
    headerName: 'GDE Number',
    width: 120,
    valueFormatter: (value) => value || '-',
  },
  {
    field: 'propertyNature',
    headerName: 'Nature',
    width: 130,
    valueFormatter: (value) => {
      if (!value) return '-';
      const labels: Record<string, string> = {
        'STOLEN_PROPERTY': 'Stolen',
        'INTESTATE_PROPERTY': 'Intestate',
        'UNCLAIMED_PROPERTY': 'Unclaimed',
        'SUSPICIOUS_PROPERTY': 'Suspicious',
        'EXHIBITS_AND_OTHER_PROPERTY': 'Exhibits',
        'SAFE_CUSTODY_PROPERTY': 'Safe Custody',
        'OTHERS': 'Others'
      };
      return labels[value] || value;
    },
  },
  {
    field: 'receivedFrom',
    headerName: 'Received From',
    width: 150,
  },
  {
    field: 'investigatingOfficerName',
    headerName: 'IO Name',
    width: 130,
    valueFormatter: (value) => value || '-',
  },
];

// For Red Ink Registry specifically
export const redInkColumns: GridColDef[] = [
  ...commonItemColumns,
  {
    field: 'registryYear',
    headerName: 'Year',
    width: 90,
  }
];

// For shelf items view
export const shelfItemColumns: GridColDef[] = [
  ...commonItemColumns,
  {
    field: 'registryType',
    headerName: 'Registry Type',
    width: 130,
    valueFormatter: (value) => {
      return value === 'BLACK_INK' ? 'Black Ink' : 'Red Ink';
    },
  }
];

// For shelf management view
export const shelfColumns: GridColDef[] = [
  { 
    field: 'name', 
    headerName: 'Name',
    flex: 1,
    minWidth: 150,
  },
  { 
    field: 'location', 
    headerName: 'Location', 
    flex: 1,
    minWidth: 150,
  },
  { 
    field: 'category', 
    headerName: 'Category', 
    width: 150,
    valueFormatter: (value) => {
      return value || '-';
    },
  },
];

// Helper function to create action column configuration
export const createActionsColumn = (renderCell: (params: GridRenderCellParams) => React.ReactNode): GridColDef => ({
  field: 'actions',
  headerName: 'Actions',
  sortable: false,
  filterable: false,
  width: 150,
  headerAlign: 'center',
  align: 'center',
  renderCell,
}); 