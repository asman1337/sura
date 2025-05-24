import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Plugin, DashboardWidget } from '../../../core/plugins';
import { useRecords } from '../hooks/useRecords';
import { useData } from '../../../core/data';
import { setGlobalApiInstance } from '../services';

// Widget to display recent records on the dashboard
const RecentRecordsWidget = () => {
  const { api } = useData();
  const { records, loading, error, isReady } = useRecords();
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  if (!api || !isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {records.length > 0 ? (
        <List disablePadding>
          {records.slice(0, 5).map((record, index) => (
            <React.Fragment key={record.id}>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <RouterLink 
                      to={`/records/view/${record.id}`} 
                      style={{ 
                        color: 'inherit', 
                        textDecoration: 'none'
                      }}
                    >
                      {record.type === 'ud_case' ? 
                        `UD Case: ${(record as any).caseNumber}` : 
                        record.type === 'stolen_property' ?
                        `Property: ${(record as any).propertyId}` :
                        `Record #${record.id}`
                      }
                    </RouterLink>
                  }
                  secondary={`Created: ${new Date(record.createdAt).toLocaleDateString()}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {index < Math.min(records.length, 5) - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No records found
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          size="small"
          component={RouterLink}
          to="/records"
        >
          View All Records
        </Button>
      </Box>
    </Box>
  );
};

// Widget to display records statistics
const RecordsStatsWidget = () => {
  const { api } = useData();
  const { stats, loading, error, isReady } = useRecords();
  
  // Set global API instance on component mount
  useEffect(() => {
    if (api) {
      setGlobalApiInstance(api);
    }
  }, [api]);
  
  if (!api || !isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {stats ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Records
              </Typography>
              <Typography variant="h5" fontWeight={500}>
                {stats.totalRecords}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" align="right">
                Recently Added
              </Typography>
              <Typography variant="h5" fontWeight={500} align="right">
                {stats.recentlyAdded}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                UD Cases
              </Typography>
              <Typography variant="h5" fontWeight={500}>
                {stats.recordsByType['ud_case'] || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" align="right">
                Stolen Property
              </Typography>
              <Typography variant="h5" fontWeight={500} align="right">
                {stats.recordsByType['stolen_property'] || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No statistics available
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          size="small"
          component={RouterLink}
          to="/records"
        >
          Go to Records
        </Button>
      </Box>
    </Box>
  );
};

// Placeholder for dashboard widgets extension points
export default {
  initialize: (plugin: Plugin) => {
    console.log('Records widgets initialized for plugin:', plugin.id);
    
    // Get existing widgets to check for duplicates
    const existingWidgets = plugin.getExtensionPoints<DashboardWidget>('dashboard:widgets');
    console.log(`Found ${existingWidgets.length} existing widget extensions`);
    
    // Check if a widget with a specific title already exists
    const hasWidget = (title: string) => {
      return existingWidgets.some(widget => 
        widget.data && 
        'title' in widget.data && 
        widget.data.title === title
      );
    };
    
    // Register Recent Records widget if not already registered
    if (!hasWidget('Recent Records')) {
      console.log('Registering Recent Records widget');
      const recentRecordsId = plugin.registerExtensionPoint<DashboardWidget>(
        'dashboard:widgets',
        {
          component: RecentRecordsWidget,
          width: 6, // Half width on desktop
          title: 'Recent Records'
        },
        { priority: 15 }
      );
      console.log(`Registered Recent Records widget with ID: ${recentRecordsId}`);
    } else {
      console.log('Recent Records widget already registered, skipping');
    }
    
    // Register Stats widget if not already registered
    if (!hasWidget('Records Stats')) {
      console.log('Registering Records Stats widget');
      const statsId = plugin.registerExtensionPoint<DashboardWidget>(
        'dashboard:widgets',
        {
          component: RecordsStatsWidget,
          width: 6, // Half width on desktop
          title: 'Records Stats'
        },
        { priority: 25 }
      );
      console.log(`Registered Records Stats widget with ID: ${statsId}`);
    } else {
      console.log('Records Stats widget already registered, skipping');
    }
    
    // Optional cleanup function
    return async () => {
      console.log('Records widgets cleanup');
    };
  }
}; 