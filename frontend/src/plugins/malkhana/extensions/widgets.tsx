import React, { useEffect, useState } from 'react';
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
import { malkhanaService } from '../services/MalkhanaService';
import { MalkhanaItem, MalkhanaStats } from '../types';

// Widget to display recent items from Black Ink Registry
const RecentItemsWidget = () => {
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const blackInk = await malkhanaService.getBlackInkRegistry();
        const sortedItems = [...blackInk.items]
          .sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime())
          .slice(0, 5);
          
        setItems(sortedItems);
      } catch (error) {
        console.error('Error loading recent items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  return (
    <Box>
      {items.length > 0 ? (
        <List disablePadding>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <RouterLink 
                      to={`/malkhana/item/${item.id}`} 
                      style={{ 
                        color: 'inherit', 
                        textDecoration: 'none'
                      }}
                    >
                      {item.description} (Case #{item.caseNumber})
                    </RouterLink>
                  }
                  secondary={`Received: ${new Date(item.dateReceived).toLocaleDateString()}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {index < items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No items found in Black Ink Registry
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          size="small"
          component={RouterLink}
          to="/malkhana/black-ink"
        >
          View All Items
        </Button>
      </Box>
    </Box>
  );
};

// Widget to display Malkhana statistics
const StatsWidget = () => {
  const [stats, setStats] = useState<MalkhanaStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const malkhanaStats = await malkhanaService.getStats();
        setStats(malkhanaStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress size={24} />
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
                Black Ink Items
              </Typography>
              <Typography variant="h5" fontWeight={500}>
                {stats.blackInkItems}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" align="right">
                Red Ink Items
              </Typography>
              <Typography variant="h5" fontWeight={500} align="right">
                {stats.redInkItems}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Recently Added
              </Typography>
              <Typography variant="h5" fontWeight={500}>
                {stats.recentlyAddedItems}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" align="right">
                Disposed Items
              </Typography>
              <Typography variant="h5" fontWeight={500} align="right">
                {stats.disposedItems}
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
          to="/malkhana"
        >
          Go to Malkhana
        </Button>
      </Box>
    </Box>
  );
};

// Placeholder for dashboard widgets extension points
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana widgets initialized for plugin:', plugin.id);
    
    // Check if widgets are already registered
    const existingWidgets = plugin.getExtensionPoints<DashboardWidget>('dashboard:widgets');
    
    // Register Recent Items widget if not already registered
    if (!existingWidgets.some(widget => widget.data.title === 'Malkhana Items')) {
      const recentItemsId = plugin.registerExtensionPoint<DashboardWidget>(
        'dashboard:widgets',
        {
          component: RecentItemsWidget,
          width: 6, // Half width on desktop
          title: 'Malkhana Items'
        },
        { priority: 10 }
      );
      console.log(`Registered Recent Items widget with ID: ${recentItemsId}`);
    }
    
    // Register Stats widget if not already registered
    if (!existingWidgets.some(widget => widget.data.title === 'Malkhana Stats')) {
      const statsId = plugin.registerExtensionPoint<DashboardWidget>(
        'dashboard:widgets',
        {
          component: StatsWidget,
          width: 6, // Half width on desktop
          title: 'Malkhana Stats'
        },
        { priority: 20 }
      );
      console.log(`Registered Stats widget with ID: ${statsId}`);
    }
    
    // Optional cleanup function
    return async () => {
      console.log('Malkhana widgets cleanup');
    };
  }
}; 