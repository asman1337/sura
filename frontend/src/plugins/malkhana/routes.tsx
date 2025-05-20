import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin, ExtensionPoint } from '../../core/plugins';

import MalkhanaDashboard from './components/MalkhanaDashboard';
import BlackInkRegistry from './components/BlackInkRegistry';
import RedInkRegistry from './components/RedInkRegistry';
import AddItemForm from './components/AddItemForm';
import DisposeItemForm from './components/DisposeItemForm';
import ItemDetail from './components/ItemDetail';
import EditItemForm from './components/EditItemForm';

/**
 * Route extension point data interface
 */
interface RouteExtensionData {
  path: string;
  element: React.ReactNode;
}

/**
 * Routes for the Malkhana module
 */
const MalkhanaRoutes: RouteObject[] = [
  {
    path: '/malkhana',
    element: <MalkhanaDashboard />
  },
  {
    path: '/malkhana/black-ink',
    element: <BlackInkRegistry />
  },
  {
    path: '/malkhana/red-ink',
    element: <RedInkRegistry />
  },
  {
    path: '/malkhana/add-item',
    element: <AddItemForm />
  },
  {
    path: '/malkhana/item/:id',
    element: <ItemDetail />
  },
  {
    path: '/malkhana/edit/:id',
    element: <EditItemForm />
  },
  {
    path: '/malkhana/dispose/:id',
    element: <DisposeItemForm />
  }
];

/**
 * Plugin routes initialization
 * 
 * IMPORTANT: This uses the 'routes' extension point type which matches
 * what the core Routes.tsx component expects.
 */
const initialize = (plugin: Plugin) => {
  console.log('Malkhana routes initialized');
  
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
  
  MalkhanaRoutes.forEach((route: RouteObject) => {
    // Ensure path exists before proceeding
    if (!route.path) {
      console.warn('Route missing path property, skipping registration');
      return;
    }
    
    if (!existingPaths.has(route.path)) {
      console.log(`Registering Malkhana route: ${route.path}`);
      
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
  console.log(`Total registered Malkhana routes: ${registeredCount}, Total routes: ${registeredRoutes.length}`);
  
  // Verify routes are registered correctly
  if (registeredRoutes.length > 0) {
    registeredRoutes.forEach((route: ExtensionPoint<RouteExtensionData>) => {
      console.log(`Verified route: ${route.data.path} (ID: ${route.id})`);
    });
  } else {
    console.warn('No routes were registered! Check extension point registration.');
  }
  
  return async () => {
    console.log('Cleaning up Malkhana routes');
  };
};

export default { initialize }; 