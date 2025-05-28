import React, { useEffect, useState } from 'react';
import { useData } from '../../data';
import { usePlugins } from '../../plugins';
import { Plugin, DashboardWidget as PluginDashboardWidget } from '../../plugins/types';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  CasesOutlined as CaseIcon,
  InventoryOutlined as InventoryIcon,
  AssignmentOutlined as TaskIcon,
  DescriptionOutlined as ReportIcon,
  MoreVert as MoreIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

interface UserInfo {
  username: string;
  role: string;
}

// Interface for our local widget representation
interface DashboardWidgetDisplay {
  id: string;
  title: string;
  description?: string;
  width?: number;
  pluginId: string;
  pluginName: string;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { auth } = useData();
  const { enabledPlugins } = usePlugins();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [pluginWidgets, setPluginWidgets] = useState<DashboardWidgetDisplay[]>([]);
  
  // In a real app, you would fetch this from your API
  useEffect(() => {
    // Simulate fetching user info
    setTimeout(() => {
      setUserInfo({
        username: auth.getCurrentUser()?.firstName || 'Officer',
        role: auth.getCurrentUser()?.rank?.abbreviation || 'Officer'
      });
    }, 500);
  }, []);
  
  // Process plugin widgets
  useEffect(() => {
    // Extract dashboard widgets from enabled plugins
    const widgets: DashboardWidgetDisplay[] = [];
    const widgetIds = new Set<string>();
    
    enabledPlugins.forEach((plugin: Plugin) => {
      const dashboardWidgets = plugin.getExtensionPoints<PluginDashboardWidget>('dashboard:widgets');
      if (dashboardWidgets && dashboardWidgets.length > 0) {
        dashboardWidgets.forEach(widget => {
          // Skip duplicate widgets (based on ID)
          if (widgetIds.has(widget.id)) {
            console.log(`Skipping duplicate widget: ${widget.id}`);
            return;
          }
          
          widgets.push({
            id: widget.id,
            title: widget.data.title,
            description: 'Widget from plugin',
            width: widget.data.width || 6,
            pluginId: plugin.id,
            pluginName: plugin.manifest.name
          });
          
          widgetIds.add(widget.id);
        });
      }
    });
    
    console.log(`Processed ${widgets.length} unique widgets from plugins`);
    setPluginWidgets(widgets);
  }, [enabledPlugins]);
  
  // Stats data
  const statsData = [
    { 
      title: 'Cases', 
      value: 24, 
      subtitle: 'Active cases', 
      icon: <CaseIcon fontSize="large" />,
      color: theme.palette.primary.main
    },
    { 
      title: 'Evidence', 
      value: 128, 
      subtitle: 'Items in Malkhana', 
      icon: <InventoryIcon fontSize="large" />,
      color: theme.palette.success.main
    },
    { 
      title: 'Tasks', 
      value: 12, 
      subtitle: 'Pending tasks', 
      icon: <TaskIcon fontSize="large" />,
      color: theme.palette.warning.main
    },
    { 
      title: 'Reports', 
      value: 8, 
      subtitle: 'Needs review', 
      icon: <ReportIcon fontSize="large" />,
      color: theme.palette.info.main
    }
  ];
  
  // Activity data
  const activityData = [
    {
      time: '9:45 AM',
      description: 'New evidence item added to case #4872',
      user: 'Officer Singh'
    },
    {
      time: 'Yesterday',
      description: 'You were assigned to case #4983',
      user: 'Inspector Sharma'
    },
    {
      time: '3 days ago',
      description: 'Report #38 was approved',
      user: 'DSP Kumar'
    }
  ];
  
  // Quick actions
  const quickActions = [
    { title: 'New Case', icon: <CaseIcon /> },
    { title: 'Add Evidence', icon: <InventoryIcon /> },
    { title: 'Create Report', icon: <ReportIcon /> },
    { title: 'Assign Task', icon: <TaskIcon /> }
  ];
  
  return (
    <Box sx={{ py: 0 }}>
      {/* Welcome section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="500" gutterBottom>
          Welcome back, {userInfo ? userInfo.username : 'Officer'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening in your department today.
        </Typography>
      </Box>
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" fontWeight="600">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle1" fontWeight="500">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Main content area */}
      <Grid container spacing={3}>
        {/* Recent activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title="Recent Activity" 
              action={
                <IconButton aria-label="settings">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 0 }}>
              <List>
                {activityData.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {activity.user.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', fontWeight: 500 }}
                            >
                              {activity.user}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {activity.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < activityData.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  View all activity
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid size={{ xs: 6 }} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 120,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          mb: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="subtitle2" align="center">
                        {action.title}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Plugin widgets */}
        {pluginWidgets.map((widget) => (
          <Grid 
            size={{ xs: 12, md: widget.width }} 
            key={widget.id}
          >
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <CardHeader 
                title={widget.title} 
                subheader={`Provided by ${widget.pluginName}`}
                action={
                  <Tooltip title="More options">
                    <IconButton>
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                {/* Widget content would be rendered here */}
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    {widget.description || 'Widget content'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage; 