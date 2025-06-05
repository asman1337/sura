import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../data';
import { DashboardApi } from '../../data/dashboard-api';
import { usePlugins } from '../../plugins';
import { NavigationItem } from '../../plugins/types';
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
  useTheme,
  alpha
} from '@mui/material';
import {
  CasesOutlined as CaseIcon,
  InventoryOutlined as InventoryIcon,
  AssignmentOutlined as TaskIcon,
  DescriptionOutlined as ReportIcon,
  MoreVert as MoreIcon,
  ArrowForward as ArrowForwardIcon,
  DashboardOutlined as DashboardIcon,
  EventNoteRounded as EventNoteIcon,
  WorkHistoryRounded as RecordsIcon,
  AccountBalanceRounded as CashRegistryIcon
} from '@mui/icons-material';

interface UserInfo {
  username: string;
  role: string;
}

interface QuickAction {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { auth, api } = useData();
  const { enabledPlugins } = usePlugins();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user info
  useEffect(() => {
    // Simulate fetching user info
    setTimeout(() => {
      setUserInfo({
        username: auth.getCurrentUser()?.firstName || 'Officer',
        role: auth.getCurrentUser()?.rank?.abbreviation || 'Officer'
      });
    }, 500);
  }, [auth]);
  
  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create dashboard API instance inside useEffect to avoid loop
        const dashboardApi = new DashboardApi(api);
        const dashboardData = await dashboardApi.getDashboardData();
        
        // Transform stats data for UI
        const transformedStats = [
          { 
            title: 'Cases', 
            value: dashboardData.stats.cases, 
            subtitle: 'Active cases', 
            icon: <CaseIcon fontSize="large" />,
            color: theme.palette.primary.main
          },
          { 
            title: 'Evidence', 
            value: dashboardData.stats.evidence, 
            subtitle: 'Items in Malkhana', 
            icon: <InventoryIcon fontSize="large" />,
            color: theme.palette.success.main
          },
          { 
            title: 'Tasks', 
            value: dashboardData.stats.tasks, 
            subtitle: 'Pending tasks', 
            icon: <TaskIcon fontSize="large" />,
            color: theme.palette.warning.main
          },
          { 
            title: 'Reports', 
            value: dashboardData.stats.reports, 
            subtitle: 'Needs review', 
            icon: <ReportIcon fontSize="large" />,
            color: theme.palette.info.main
          }
        ];
        
        // Transform activity data for UI
        const transformedActivity = dashboardData.recentActivity.map((activity: any) => ({
          time: new Date(activity.timestamp).toLocaleDateString(),
          description: activity.description,
          user: activity.title,
          status: activity.status
        }));
        
        setStatsData(transformedStats);
        setActivityData(transformedActivity);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Using default values.');
        
        // Fallback to default data
        setStatsData([
          { 
            title: 'Cases', 
            value: 0, 
            subtitle: 'Active cases', 
            icon: <CaseIcon fontSize="large" />,
            color: theme.palette.primary.main
          },
          { 
            title: 'Evidence', 
            value: 0, 
            subtitle: 'Items in Malkhana', 
            icon: <InventoryIcon fontSize="large" />,
            color: theme.palette.success.main
          },
          { 
            title: 'Tasks', 
            value: 0, 
            subtitle: 'Pending tasks', 
            icon: <TaskIcon fontSize="large" />,
            color: theme.palette.warning.main
          },
          { 
            title: 'Reports', 
            value: 0, 
            subtitle: 'Needs review', 
            icon: <ReportIcon fontSize="large" />,
            color: theme.palette.info.main
          }
        ]);
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };
      fetchDashboardData();
  }, [api, theme.palette]);

  // Generate quick actions from enabled plugins
  useEffect(() => {
    const actions: QuickAction[] = [];
    
    // Helper function to render icons
    const renderIcon = (iconName: string) => {
      switch (iconName) {
        case 'Inventory':
          return <InventoryIcon />;
        case 'EventNote':
          return <EventNoteIcon />;
        case 'Records':
          return <RecordsIcon />;
        case 'CashRegistry':
          return <CashRegistryIcon />;
        default:
          return <DashboardIcon />;
      }
    };

    // Collect navigation items from enabled plugins
    enabledPlugins.forEach((plugin) => {
      const navExtensions = plugin.getExtensionPoints<NavigationItem>('navigation:main');
      if (navExtensions && navExtensions.length > 0) {
        navExtensions.forEach(ext => {
          actions.push({
            id: ext.id,
            title: ext.data.title,
            path: ext.data.path,
            icon: typeof ext.data.icon === 'string' ? renderIcon(ext.data.icon) : ext.data.icon || <DashboardIcon />
          });
        });
      }
    });    setQuickActions(actions);
  }, [enabledPlugins]);

  // Handle navigation to quick actions
  const handleQuickActionClick = (path: string) => {
    navigate(path);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 0 }}>      {/* Welcome section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="500" gutterBottom>
          Welcome back, {userInfo ? userInfo.username : 'Officer'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening in your department today.
        </Typography>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
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
                          {/* {activity?.user?.charAt(0) || 'X'} */}
                          {'X'} {/* Placeholder for user avatar */}
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
            <CardContent>              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid size={{ xs: 6 }} key={action.id}>
                    <Paper
                      elevation={0}
                      onClick={() => handleQuickActionClick(action.path)}
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
            </CardContent>          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 