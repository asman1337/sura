import React from 'react';
import { 
  DataGrid, 
  DataGridProps, 
  GridColDef, 
  GridToolbar,
  GridRowParams,
  GridRenderCellParams,
  GridValueFormatter
} from '@mui/x-data-grid';
import { 
  Box, 
  Card, 
  useTheme, 
  Chip, 
  IconButton, 
  Tooltip,
  Typography 
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  MoveDown as MoveIcon 
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { MalkhanaItem, MalkhanaItemStatus } from '../../types';

export type MalkhanaDataGridProps = {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  title?: string;
  height?: string | number;
  showToolbar?: boolean;
  checkboxSelection?: boolean;
  onRowClick?: (params: GridRowParams) => void;
  customEmptyContent?: React.ReactNode;
  dataGridProps?: Partial<DataGridProps>;
};

// Utility function to determine status color - used by multiple components
export const getStatusColor = (status: string) => {
  const theme = useTheme();
  
  switch (status) {
    case 'ACTIVE':
      return theme.palette.success.main;
    case 'DISPOSED':
      return theme.palette.error.main;
    case 'TRANSFERRED':
      return theme.palette.warning.main;
    case 'RELEASED':
      return theme.palette.info.main;
    default:
      return theme.palette.grey[500];
  }
};

// Common value formatters
export const dateFormatter: GridValueFormatter = (value) => {
  if (!value) return '-';
  return new Date(value as string).toLocaleDateString();
};

export const statusCellRenderer = (params: GridRenderCellParams) => {
  const status = params.value as MalkhanaItemStatus;
  return (
    <Chip 
      label={status} 
      size="small"
      sx={{ 
        backgroundColor: `${getStatusColor(status)}20`,
        color: getStatusColor(status),
        fontWeight: 500
      }}
    />
  );
};

// Standard action button renderers
export const viewActionRenderer = (id: string) => (
  <Tooltip title="View Details">
    <IconButton size="small" component={RouterLink} to={`/malkhana/item/${id}`}>
      <ViewIcon fontSize="small" />
    </IconButton>
  </Tooltip>
);

export const editActionRenderer = (id: string, isActive: boolean = true) => (
  <Tooltip title="Edit Item">
    <span>
      <IconButton 
        size="small" 
        component={RouterLink} 
        to={`/malkhana/edit/${id}`}
        disabled={!isActive}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export const disposeActionRenderer = (id: string, isActive: boolean = true) => (
  <Tooltip title="Dispose Item">
    <span>
      <IconButton 
        size="small" 
        component={RouterLink} 
        to={`/malkhana/dispose/${id}`}
        disabled={!isActive}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export const qrCodeActionRenderer = (onClickHandler: () => void) => (
  <Tooltip title="Generate QR Code">
    <IconButton size="small" onClick={onClickHandler}>
      <QrCodeIcon fontSize="small" />
    </IconButton>
  </Tooltip>
);

export const moveActionRenderer = (onClickHandler: () => void, isActive: boolean = true) => (
  <Tooltip title="Move Item">
    <span>
      <IconButton size="small" onClick={onClickHandler} disabled={!isActive}>
        <MoveIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

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

// Empty content renderer
const EmptyContent = ({ customContent }: { customContent?: React.ReactNode }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 3,
        height: '100%',
        width: '100%'
      }}
    >
      {customContent || (
        <Typography color="text.secondary">
          No data to display
        </Typography>
      )}
    </Box>
  );
};

const MalkhanaDataGrid: React.FC<MalkhanaDataGridProps> = ({
  rows,
  columns,
  loading = false,
  title,
  height = 'calc(100vh - 220px)',
  showToolbar = true,
  checkboxSelection = false,
  onRowClick,
  customEmptyContent,
  dataGridProps = {},
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: height,
        width: '100%'
      }}
    >
      {title && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}
      
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick
        autoHeight={height === 'auto'}
        onRowClick={onRowClick}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        slots={{
          toolbar: showToolbar ? GridToolbar : undefined,
          noRowsOverlay: () => <EmptyContent customContent={customEmptyContent} />,
          noResultsOverlay: () => <EmptyContent customContent={customEmptyContent} />,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.action.hover,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          ...dataGridProps?.sx || {},
        }}
        {...dataGridProps}
      />
    </Card>
  );
};

export default MalkhanaDataGrid; 