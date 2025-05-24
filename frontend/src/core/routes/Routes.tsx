import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import { useData } from '../data';
import { usePlugins } from '../plugins';
import { SidebarLayout } from '../components/layout';
import LoadingScreen from '../components/LoadingScreen';
import OfficersPage from '../pages/officers/OfficersPage';

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));

// Define plugin route type
interface PluginRoute {
  id: string;
  pluginId: string;
  data: {
    path: string;
    element: React.ReactNode;
  };
}

const Routes: React.FC = () => {
  const { auth } = useData();
  const { enabledPlugins, getExtensionPoints } = usePlugins();
  const [pluginRoutes, setPluginRoutes] = useState<PluginRoute[]>([]);
  
  // Check if user is authenticated
  const isAuthenticated = !!auth.getToken();
  
  // Collect plugin routes
  useEffect(() => {
    // Log enabled plugins for debugging
    console.log('Enabled plugins in Routes component:', enabledPlugins);
    
    // Check each plugin for routes
    enabledPlugins.forEach(plugin => {
      console.log(`Checking routes for plugin: ${plugin.id}`);
      const pluginRoutesExtPoints = plugin.getExtensionPoints('routes');
      console.log(`Plugin ${plugin.id} has ${pluginRoutesExtPoints.length} routes`);
    });
    
    // Directly use the getExtensionPoints hook to get all routes
    const routes = getExtensionPoints<{
      path: string;
      element: React.ReactNode;
    }>('routes');
    
    console.log(`Found ${routes.length} routes from all plugins`);
    setPluginRoutes(routes as PluginRoute[]);
    
    if (routes.length === 0) {
      console.warn("No plugin routes found. Check plugin initialization.");
    }
  }, [getExtensionPoints, enabledPlugins.length]);
  
  // Process plugin routes to ensure correct path format
  const processedPluginRoutes = pluginRoutes.map(route => {
    // Remove leading slash for nested routes
    const processedPath = route.data.path.replace(/^\//, '');
    return {
      ...route,
      processedPath
    };
  });
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes - wrapped in SidebarLayout */}
        <Route path="/*" element={
          isAuthenticated ? <SidebarLayout>
            <Suspense fallback={<LoadingScreen />}>
              <RouterRoutes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="officers" element={<OfficersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                
                {/* Plugin routes - if any were found */}
                {processedPluginRoutes.map((routeExt) => (
                  <Route 
                    key={routeExt.id}
                    path={routeExt.processedPath}
                    element={routeExt.data.element}
                  />
                ))}
                
                <Route path="*" element={<NotFoundPage />} />
              </RouterRoutes>
            </Suspense>
          </SidebarLayout> : <Navigate to="/login" />
        } />
        
        {/* Redirect root to dashboard if authenticated, otherwise to login */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFoundPage />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routes; 