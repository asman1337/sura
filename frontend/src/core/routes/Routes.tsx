import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import { useData } from '../data';
import { usePlugins } from '../plugins';
import { SidebarLayout } from '../components/layout';
import LoadingScreen from '../components/LoadingScreen';

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));

// Define plugin route type
interface PluginRoute {
  id: string;
  data: {
    path: string;
    element: React.ReactNode;
  };
}

const Routes: React.FC = () => {
  const { auth } = useData();
  const { enabledPlugins } = usePlugins();
  
  // Check if user is authenticated
  const isAuthenticated = !!auth.getToken();
  
  // Collect plugin routes
  const pluginRoutes = enabledPlugins.flatMap(plugin => {
    const routes = plugin.getExtensionPoints<{
      path: string;
      element: React.ReactNode;
    }>('routes') || [];
    return routes as PluginRoute[];
  });
  
  console.log("Plugin routes:", pluginRoutes);
  
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
                <Route path="profile" element={<div>Profile Page</div>} />
                <Route path="settings" element={<div>Settings Page</div>} />
                
                {/* Plugin routes */}
                {pluginRoutes.map((routeExt) => (
                  <Route 
                    key={routeExt.id}
                    path={routeExt.data.path.replace(/^\//, '')} // Remove leading slash if present
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