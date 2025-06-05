import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin } from '../../core/plugins';

// Main gallery component
const GalleryDashboard = React.lazy(() => import('./components/GalleryDashboard'));

/**
 * Route extension point data interface
 */
interface RouteExtensionData {
  path: string;
  element: React.ReactNode;
}

/**
 * Routes for the Gallery module
 */
const GalleryRoutes: RouteObject[] = [
  {
    path: '/gallery',
    element: <GalleryDashboard />
  }
];

/**
 * Plugin routes initialization
 */
const initialize = (plugin: Plugin) => {
  console.log('Gallery routes initialized');
  
  // Check if routes are already registered to avoid duplicates
  const existingRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  // Get all existing paths to avoid duplicates
  const existingPaths = new Set(
    existingRoutes
      .map(route => route.data?.path)
      .filter((path): path is string => path !== undefined)
  );
  
  // Register each route as an extension point if not already registered
  let registeredCount = 0;
  
  GalleryRoutes.forEach((route: RouteObject) => {
    // Ensure path exists before proceeding
    if (!route.path) {
      console.warn('Gallery route missing path property, skipping registration');
      return;
    }
    
    if (!existingPaths.has(route.path)) {
      plugin.registerExtensionPoint<RouteExtensionData>('routes', {
        path: route.path,
        element: route.element
      });
      registeredCount++;
    }
  });
  
  // Log registered routes for debugging
  const registeredRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  console.log(`Total registered Gallery routes: ${registeredCount}, Total routes: ${registeredRoutes.length}`);
  
  return async () => {
    console.log('Cleaning up Gallery routes');
    // Any cleanup logic here
  };
};

export default { initialize };
