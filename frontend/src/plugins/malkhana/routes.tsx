import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin } from '../../core/plugins';

import MalkhanaDashboard from './components/MalkhanaDashboard';
import BlackInkRegistry from './components/BlackInkRegistry';
import RedInkRegistry from './components/RedInkRegistry';
import AddItemForm from './components/AddItemForm';
import DisposeItemForm from './components/DisposeItemForm';
import ItemDetail from './components/ItemDetail';
import EditItemForm from './components/EditItemForm';
import ShelfManagement from './components/ShelfManagement';
import ShelfItems from './components/ShelfItems';

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
  },  {
    path: '/malkhana/add-item',
    element: <AddItemForm />
  },
  {
    path: '/malkhana/add-red-ink-item',
    element: <AddItemForm registryType={'RED_INK'} />
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
  },
  {
    path: '/malkhana/shelves',
    element: <ShelfManagement />
  },
  {
    path: '/malkhana/shelf/:shelfId',
    element: <ShelfItems />
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
  // Get all existing paths to avoid duplicates
  const existingPaths = new Set(
    existingRoutes
      .map(route => route.data?.path)
      .filter((path): path is string => path !== undefined)
  );
  
  // Register each route as an extension point if not already registered
  let registeredCount = 0;
  
  MalkhanaRoutes.forEach((route: RouteObject) => {
    // Ensure path exists before proceeding
    if (!route.path) {
      console.warn('Route missing path property, skipping registration');
      return;
    }
    
    if (!existingPaths.has(route.path)) {
      // IMPORTANT: Use 'routes' as the extension point type to match what Routes.tsx expects
      plugin.registerExtensionPoint<RouteExtensionData>('routes', {
        path: route.path,
        element: route.element
      });
      registeredCount++;
    }
  });
  
  // Log registered routes for debugging
  const registeredRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  // Verify routes are registered correctly
  if (registeredRoutes.length === 0) {
    console.warn('No routes were registered! Check extension point registration.');
  }
  
  return async () => {
    console.log('Cleaning up Malkhana routes');
  };
};

export default { initialize }; 