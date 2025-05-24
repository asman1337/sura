import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin } from '../../core/plugins';

import RecordsDashboard from './components/RecordsDashboard';

/**
 * Route extension point data interface
 */
interface RouteExtensionData {
  path: string;
  element: React.ReactNode;
}

/**
 * Routes for the Records module
 */
const RecordsRoutes: RouteObject[] = [
  {
    path: '/records',
    element: <RecordsDashboard />
  },
  {
    path: '/records/create',
    element: <div>Create Record Page (Coming Soon)</div>
  },
  {
    path: '/records/type/:recordType',
    element: <div>Records by Type Page (Coming Soon)</div>
  },
  {
    path: '/records/view/:id',
    element: <div>View Record Details Page (Coming Soon)</div>
  },
  {
    path: '/records/edit/:id',
    element: <div>Edit Record Page (Coming Soon)</div>
  }
];

/**
 * Plugin routes initialization
 * 
 * IMPORTANT: This uses the 'routes' extension point type which matches
 * what the core Routes.tsx component expects.
 */
const initialize = (plugin: Plugin) => {
  console.log('Records routes initialized');
  
  // Check if routes are already registered to avoid duplicates
  const existingRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  console.log(`Found ${existingRoutes.length} existing routes before registration`);
  
  // Get all existing paths to avoid duplicates
  const existingPaths = new Set(
    existingRoutes
      .map(route => route.data?.path)
      .filter((path): path is string => path !== undefined)
  );
  console.log('Existing paths:', Array.from(existingPaths));
  
  // Register each route as an extension point if not already registered
  let registeredCount = 0;
  
  RecordsRoutes.forEach((route: RouteObject) => {
    // Ensure path exists before proceeding
    if (!route.path) {
      console.warn('Route missing path property, skipping registration');
      return;
    }
    
    if (!existingPaths.has(route.path)) {
      console.log(`Registering Records route: ${route.path}`);
      
      // IMPORTANT: Use 'routes' as the extension point type to match what Routes.tsx expects
      const extensionId = plugin.registerExtensionPoint<RouteExtensionData>('routes', {
        path: route.path,
        element: route.element
      });
      
      console.log(`Route registered with ID: ${extensionId}`);
      registeredCount++;
    } else {
      console.log(`Skipping duplicate route registration: ${route.path}`);
    }
  });
  
  // Log registered routes for debugging
  const registeredRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  console.log(`Total registered Records routes: ${registeredCount}, Total routes: ${registeredRoutes.length}`);
  
  return async () => {
    console.log('Cleaning up Records routes');
  };
};

export default { initialize }; 