import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin } from '../../core/plugins';

import RecordsDashboard from './components/RecordsDashboard';
import UDCaseView from './components/ud-case/UDCaseView';
import StolenPropertyView from './components/stolen-property/StolenPropertyView';
import PaperDispatchView from './components/paper-dispatch/PaperDispatchView';
import RecordsList from './components/RecordsList';
import UDCaseForm from './components/ud-case/UDCaseForm';
import StolenPropertyForm from './components/stolen-property/StolenPropertyForm';
import PaperDispatchForm from './components/paper-dispatch/PaperDispatchForm';

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
    element: <RecordsDashboard />
  },
  {
    path: '/records/create/ud-case',
    element: <UDCaseForm />
  },
  {
    path: '/records/create/stolen-property',
    element: <StolenPropertyForm />
  },
  {
    path: '/records/create/paper-dispatch',
    element: <PaperDispatchForm />
  },
  {
    path: '/records/type/:recordType',
    element: <RecordsList />
  },
  {
    path: '/records/view/:id',
    element: <RecordsDashboard />
  },
  {
    path: '/records/ud-case/:id',
    element: <UDCaseView />
  },
  {
    path: '/records/stolen-property/:id',
    element: <StolenPropertyView />
  },
  {
    path: '/records/paper-dispatch/:id',
    element: <PaperDispatchView />
  },
  {
    path: '/records/edit/:id',
    element: <RecordsDashboard />
  },
  {
    path: '/records/edit/ud-case/:id',
    element: <UDCaseForm />
  },
  {
    path: '/records/edit/stolen-property/:id',
    element: <StolenPropertyForm />
  },
  {
    path: '/records/edit/paper-dispatch/:id',
    element: <PaperDispatchForm />
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
  // Get all existing paths to avoid duplicates
  const existingPaths = new Set(
    existingRoutes
      .map(route => route.data?.path)
      .filter((path): path is string => path !== undefined)
  );
  
  // Register each route as an extension point if not already registered
  let registeredCount = 0;
  
  RecordsRoutes.forEach((route: RouteObject) => {
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
  console.log(`Total registered Records routes: ${registeredCount}, Total routes: ${registeredRoutes.length}`);
  
  return async () => {
    console.log('Cleaning up Records routes');
  };
};

export default { initialize }; 