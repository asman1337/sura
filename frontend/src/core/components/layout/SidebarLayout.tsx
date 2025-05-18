import React, { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../data';
import { usePlugins } from '../../plugins';
import { Plugin, NavigationItem, NavigationChildItem } from '../../plugins/types';
import {
  AppBar,
  Avatar,
  Box,
  Button,
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
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
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
  NotificationsOutlined as NotificationIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

// Sidebar width
const drawerWidth = 260;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

// Interface for core navigation items
interface CoreNavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { auth } = useData();
  const { enabledPlugins } = usePlugins();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const isLoggedIn = !!auth.getToken();
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };
  
  // Handle profile menu
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
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
  
  // Core navigation items
  const coreNavItems: CoreNavItem[] = [
    { 
      title: 'Dashboard', 
      path: '/dashboard', 
      icon: <DashboardIcon />, 
      requiresAuth: true 
    },
    { 
      title: 'Profile', 
      path: '/profile', 
      icon: <PersonIcon />, 
      requiresAuth: true 
    },
    { 
      title: 'Settings', 
      path: '/settings', 
      icon: <SettingsIcon />, 
      requiresAuth: true 
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
  
  // Add this after the enabledPlugins line
  console.log("Enabled plugins:", enabledPlugins);
  
  // Plugin navigation items
  const pluginNavItems: NavigationItem[] = [];
  
  // Collect navigation items from plugins
  enabledPlugins.forEach((plugin: Plugin) => {
    console.log(`Checking plugin ${plugin.id} for navigation items`);
    const navExtensions = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    console.log(`Plugin ${plugin.id} navigation extensions:`, navExtensions);
    if (navExtensions && navExtensions.length > 0) {
      navExtensions.forEach(ext => {
        console.log(`Adding navigation item from plugin ${plugin.id}:`, ext.data);
        pluginNavItems.push({
          ...ext.data,
          id: ext.id
        });
      });
    }
  });
  
  // Deduplicate navigation items based on path
  const uniquePluginNavItems = pluginNavItems.reduce((acc: NavigationItem[], item: NavigationItem) => {
    // Check if we already have an item with this path
    const existingItem = acc.find(i => i.path === item.path);
    if (!existingItem) {
      acc.push(item);
    } else {
      console.log(`Skipping duplicate navigation item for path: ${item.path}`);
    }
    return acc;
  }, []);
  
  console.log(`Processed ${uniquePluginNavItems.length} unique navigation items from plugins`);
  
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
      {/* Logo and brand */}
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
        
        {isMobile && (
          <IconButton 
            onClick={toggleSidebar} 
            sx={{ color: 'inherit' }}
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      {/* User profile section (if logged in) */}
      {isLoggedIn && (
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
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.secondary.main
              }}
            >
              U
            </Avatar>
            <Box sx={{ ml: 2, overflow: 'hidden' }}>
              <Typography 
                variant="subtitle1" 
                noWrap 
                sx={{ fontWeight: 600 }}
              >
                User Name
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                noWrap
              >
                Officer
              </Typography>
            </Box>
          </Box>
          <Divider />
        </>
      )}
      
      {/* Core navigation items */}
      <List sx={{ pt: 0, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isPathActive(item.path)}
              sx={{
                py: 1,
                minHeight: 48,
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {renderIcon(item.icon)}
              </ListItemIcon>
              <ListItemText 
                primary={item.title} 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  fontWeight: isPathActive(item.path) ? 600 : 400
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Plugin navigation items */}
        {isLoggedIn && uniquePluginNavItems.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <Typography 
                variant="overline" 
                color="text.secondary"
                sx={{ 
                  fontSize: 11, 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  pl: 1
                }}
              >
                Modules
              </Typography>
            </ListItem>
            
            {uniquePluginNavItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={item.children ? 'div' : RouterLink}
                    to={item.children ? undefined : item.path}
                    onClick={item.children ? () => toggleNestedItem(item.id) : undefined}
                    selected={!item.children && isPathActive(item.path)}
                    sx={{
                      py: 1,
                      minHeight: 48,
                      px: 2.5,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        borderRight: `3px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        }
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {renderIcon(item.icon)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      primaryTypographyProps={{ 
                        fontSize: 14,
                        fontWeight: isPathActive(item.path) ? 600 : 400
                      }} 
                    />
                    {item.children && (
                      expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    )}
                  </ListItemButton>
                </ListItem>
                
                {/* Nested menu items */}
                {item.children && (
                  <Collapse 
                    in={expandedItems[item.id]} 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child: NavigationChildItem) => (
                        <ListItemButton
                          key={child.path}
                          component={RouterLink}
                          to={child.path}
                          selected={isPathActive(child.path)}
                          sx={{
                            py: 0.5,
                            minHeight: 40,
                            pl: 6,
                            '&.Mui-selected': {
                              backgroundColor: theme.palette.action.selected,
                              borderRight: `3px solid ${theme.palette.primary.main}`,
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              }
                            }
                          }}
                        >
                          <ListItemText 
                            primary={child.title} 
                            primaryTypographyProps={{ 
                              fontSize: 13,
                              fontWeight: isPathActive(child.path) ? 600 : 400
                            }} 
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </List>
      
      {/* Bottom actions */}
      {isLoggedIn && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      overflow: 'hidden' // Prevent any overflow that might cause scrollbars
    }}>
      <CssBaseline />
      
      {/* Top AppBar */}
      <AppBar 
        position="fixed" 
        color="default"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: '100%',
          ml: 0,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Desktop menu button (when sidebar is closed) */}
          {!isMobile && !sidebarOpen && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Page title - can be dynamic based on current route */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Dashboard
          </Typography>
          
          {/* Search button */}
          <Tooltip title="Search">
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
          
          {/* Help button */}
          <Tooltip title="Help">
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <HelpIcon />
            </IconButton>
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <NotificationIcon />
            </IconButton>
          </Tooltip>
          
          {/* Profile menu */}
          {isLoggedIn && (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={Boolean(profileMenuAnchor) ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(profileMenuAnchor) ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>U</Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={profileMenuAnchor}
                id="account-menu"
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    mt: 1.5,
                    width: 200,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem component={RouterLink} to="/profile">
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem component={RouterLink} to="/settings">
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarOpen ? drawerWidth : 0 },
          flexShrink: { md: 0 },
          m: 0,
          p: 0,
          display: 'flex'
        }}
      >
        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={toggleSidebar}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: `1px solid ${theme.palette.divider}`
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        )}
        
        {/* Desktop drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open={sidebarOpen}
            sx={{
              '& .MuiDrawer-paper': { 
                position: 'relative',
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: `1px solid ${theme.palette.divider}`,
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
              width: sidebarOpen ? drawerWidth : 0,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {sidebarContent}
          </Drawer>
        )}
      </Box>
      
      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          m: 0,
          overflow: 'auto',
          pt: '64px', // Account for AppBar height
          height: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout; 