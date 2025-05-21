import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../data';
import { OfficerInfo } from '../../data/auth-service';
import { usePlugins } from '../../plugins';
import { Plugin, NavigationItem, NavigationChildItem } from '../../plugins/types';
import {
  Box,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

// Sidebar width
const drawerWidth = 260;
const collapsedDrawerWidth = 68; // Width when collapsed

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Interface for core navigation items
interface CoreNavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  group?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { auth, isInitialized } = useData();
  const { enabledPlugins } = usePlugins();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [userProfile, setUserProfile] = useState<OfficerInfo | null>(null);
  
  const isLoggedIn = !!auth.getToken();
  
  // Load user profile
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      const profile = auth.getCurrentUser();
      if (profile) {
        setUserProfile(profile);
      } else {
        // If not in memory, try to fetch from API
        auth.fetchUserProfile().then(profile => {
          if (profile) {
            setUserProfile(profile);
          }
        });
      }
    }
  }, [auth, isInitialized, isLoggedIn]);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };
  
  // Toggle nested menu items
  const toggleNestedItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Check if a path is active
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Core navigation items with groups
  const coreNavItems: CoreNavItem[] = [
    { 
      title: 'Dashboard', 
      path: '/dashboard', 
      icon: <DashboardIcon />, 
      requiresAuth: true,
      group: 'Core'
    },
    { 
      title: 'Profile', 
      path: '/profile', 
      icon: <PersonIcon />, 
      requiresAuth: true,
      group: 'Core'
    },
    { 
      title: 'Settings', 
      path: '/settings', 
      icon: <SettingsIcon />, 
      requiresAuth: true,
      group: 'Core'
    }
  ];
  
  // Public navigation items
  const publicNavItems: CoreNavItem[] = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'Login', path: '/login', icon: <LoginIcon /> }
  ];
  
  // Filter navigation items based on auth status
  const navItems = isLoggedIn 
    ? coreNavItems.filter(item => !item.requiresAuth || isLoggedIn)
    : publicNavItems;
    
  // Group navigation items
  const groupedNavItems = navItems.reduce<Record<string, CoreNavItem[]>>((acc, item) => {
    const group = item.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
  
  // Plugin navigation items
  const pluginNavItems: NavigationItem[] = [];
  
  // Collect navigation items from plugins
  enabledPlugins.forEach((plugin: Plugin) => {
    const navExtensions = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    if (navExtensions && navExtensions.length > 0) {
      navExtensions.forEach(ext => {
        pluginNavItems.push({
          ...ext.data,
          id: ext.id
        });
      });
    }
  });
  
  // Group plugin nav items
  const pluginNavItemsByGroup = pluginNavItems.reduce<Record<string, NavigationItem[]>>((acc, item) => {
    const group = item.group || 'Plugins';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
  
  // Add this function to render icons from string names
  const renderIcon = (icon: React.ReactNode | string) => {
    if (typeof icon === 'string') {
      // Handle common icon names
      switch (icon) {
        case 'Dashboard':
          return <DashboardIcon />;
        case 'Person':
          return <PersonIcon />;
        case 'Settings':
          return <SettingsIcon />;
        case 'Home':
          return <HomeIcon />;
        case 'Login':
          return <LoginIcon />;
        case 'Inventory':
          return <InventoryIcon />;
        default:
          return <DashboardIcon />; // Default icon
      }
    }
    
    return icon || <DashboardIcon />; // Return the icon or a default
  };
  
  // Sidebar content
  const sidebarContent = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and brand with toggle */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}
      >
        {sidebarOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/"
              sx={{ 
                fontWeight: 700, 
                textDecoration: 'none', 
                color: 'inherit',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              SURA
            </Typography>
          </Box>
        )}
        
        <IconButton 
          onClick={toggleSidebar} 
          sx={{ color: 'inherit' }}
          size="small"
        >
          {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* User profile section (if logged in) */}
      {isLoggedIn && sidebarOpen && (
        <>
          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: theme.palette.background.default
            }}
          >
            <Avatar 
              src={userProfile?.profilePhotoUrl} 
              alt={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.primary.main
              }}
            >
              {userProfile?.firstName?.charAt(0) || 'U'}
            </Avatar>
            
            <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...'}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {userProfile?.rank?.name || userProfile?.userType || 'Officer'}
                {userProfile?.primaryUnit && ` • ${userProfile.primaryUnit.name}`}
              </Typography>
            </Box>
          </Box>
          
          <Divider />
        </>
      )}
      
      {/* Icons-only view when collapsed */}
      {!sidebarOpen && isLoggedIn && (
        <Box sx={{ pt: 2, pb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            src={userProfile?.profilePhotoUrl} 
            alt={userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
            sx={{ 
              width: 40, 
              height: 40,
              mb: 1,
              bgcolor: theme.palette.primary.main
            }}
          >
            {userProfile?.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Divider sx={{ width: '100%', mt: 1 }} />
        </Box>
      )}
      
      {/* Navigation items */}
      <List sx={{ px: 1, flex: 1 }}>
        {/* Core navigation items by group */}
        {Object.entries(groupedNavItems).map(([group, items]) => (
          items.length > 0 && (
            <React.Fragment key={group}>
              {/* Group header - only show in expanded mode */}
              {sidebarOpen && (
                <Typography 
                  variant="overline" 
                  sx={{ 
                    px: 2, 
                    pt: 2, 
                    pb: 1, 
                    display: 'block', 
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {group}
                </Typography>
              )}
              
              {/* Group items */}
              {items.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    selected={isPathActive(item.path)}
                    sx={{
                      borderRadius: 1,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      px: sidebarOpen ? 2 : 0,
                      color: isPathActive(item.path) ? 'primary.main' : 'text.primary',
                      backgroundColor: isPathActive(item.path) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: isPathActive(item.path) ? 'primary.main' : 'inherit',
                        minWidth: sidebarOpen ? 36 : 'auto',
                        mr: sidebarOpen ? 2 : 0
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary={item.title} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </React.Fragment>
          )
        ))}
        
        {/* Plugin navigation items by group */}
        {isLoggedIn && Object.entries(pluginNavItemsByGroup).map(([group, items]) => (
          items.length > 0 && (
            <React.Fragment key={group}>
              <Divider sx={{ my: 1 }} />
              
              {/* Group header - only show in expanded mode */}
              {sidebarOpen && (
                <Typography 
                  variant="overline" 
                  sx={{ 
                    px: 2, 
                    pt: 2, 
                    pb: 1, 
                    display: 'block', 
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {group}
                </Typography>
              )}
              
              {/* Group items */}
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  {item.children?.length && sidebarOpen ? (
                    // Parent item with children - only show in expanded mode
                    <>
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => toggleNestedItem(item.id)}
                          sx={{
                            borderRadius: 1,
                            color: isPathActive(item.path) ? 'primary.main' : 'text.primary',
                            backgroundColor: isPathActive(item.path) ? 'action.selected' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                        >
                          <ListItemIcon sx={{ color: isPathActive(item.path) ? 'primary.main' : 'inherit' }}>
                            {renderIcon(item.icon)}
                          </ListItemIcon>
                          <ListItemText primary={item.title} />
                          {expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                      </ListItem>
                      
                      <Collapse in={expandedItems[item.id]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map((child: NavigationChildItem) => (
                            <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                              <ListItemButton 
                                component={RouterLink}
                                to={child.path}
                                selected={isPathActive(child.path)}
                                sx={{ 
                                  pl: 4,
                                  borderRadius: 1,
                                  color: isPathActive(child.path) ? 'primary.main' : 'text.primary',
                                  backgroundColor: isPathActive(child.path) ? 'action.selected' : 'transparent',
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ color: isPathActive(child.path) ? 'primary.main' : 'inherit' }}>
                                  {renderIcon(child.icon)}
                                </ListItemIcon>
                                <ListItemText primary={child.title} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  ) : (
                    // Single item - show with or without text depending on sidebar state
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        component={RouterLink}
                        to={item.path}
                        selected={isPathActive(item.path)}
                        sx={{
                          borderRadius: 1,
                          justifyContent: sidebarOpen ? 'flex-start' : 'center',
                          px: sidebarOpen ? 2 : 0,
                          color: isPathActive(item.path) ? 'primary.main' : 'text.primary',
                          backgroundColor: isPathActive(item.path) ? 'action.selected' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        <ListItemIcon 
                          sx={{ 
                            color: isPathActive(item.path) ? 'primary.main' : 'inherit',
                            minWidth: sidebarOpen ? 36 : 'auto',
                            mr: sidebarOpen ? 2 : 0
                          }}
                        >
                          {renderIcon(item.icon)}
                        </ListItemIcon>
                        {sidebarOpen && <ListItemText primary={item.title} />}
                      </ListItemButton>
                    </ListItem>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          )
        ))}
      </List>
      
      {/* Bottom actions */}
      {isLoggedIn && (
        <>
          <Divider />
          <List sx={{ px: 1 }}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 1,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  px: sidebarOpen ? 2 : 0,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'error.main',
                    minWidth: sidebarOpen ? 36 : 'auto',
                    mr: sidebarOpen ? 2 : 0
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary="Logout" sx={{ color: 'error.main' }} />}
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { md: sidebarOpen ? drawerWidth : collapsedDrawerWidth }, 
          flexShrink: { md: 0 } 
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={isMobile && sidebarOpen}
          onClose={toggleSidebar}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {sidebarContent}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%', 
            md: sidebarOpen 
              ? `calc(100% - ${drawerWidth}px)` 
              : `calc(100% - ${collapsedDrawerWidth}px)` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout; 