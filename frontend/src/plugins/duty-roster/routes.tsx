import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin } from '../../core/plugins';

// Main dashboard component - will serve as the entry point for all functionality
const DutyRosterDashboard = React.lazy(() => import('./components/DutyRosterDashboard'));
const RosterList = React.lazy(() => import('./components/RosterList'));
const RosterDetail = React.lazy(() => import('./components/RosterDetail'));
const RosterForm = React.lazy(() => import('./components/RosterForm'));
const ShiftManagement = React.lazy(() => import('./components/ShiftManagement'));
const ShiftForm = React.lazy(() => import('./components/ShiftForm'));
const AssignmentCalendar = React.lazy(() => import('./components/AssignmentCalendar'));
const OfficerDutyView = React.lazy(() => import('./components/OfficerDutyView'));
const AssignmentForm = React.lazy(() => import('./components/AssignmentForm'));

/**
 * Route extension point data interface
 */
interface RouteExtensionData {
  path: string;
  element: React.ReactNode;
}

/**
 * Routes for the Duty Roster module
 * Using a simplified approach with a central dashboard that provides navigation to all features
 */
const DutyRosterRoutes: RouteObject[] = [
  {
    path: '/duty-roster',
    element: <DutyRosterDashboard />
  },
  // We keep child routes for direct URL access but primary navigation is through dashboard
  {
    path: '/duty-roster/rosters',
    element: <RosterList />
  },
  {
    path: '/duty-roster/rosters/:id',
    element: <RosterDetail />
  },
  {
    path: '/duty-roster/rosters/create',
    element: <RosterForm />
  },
  {
    path: '/duty-roster/rosters/:id/edit',
    element: <RosterForm />
  },
  {
    path: '/duty-roster/shifts',
    element: <ShiftManagement />
  },
  {
    path: '/duty-roster/shifts/create',
    element: <ShiftForm />
  },
  {
    path: '/duty-roster/shifts/:id/edit',
    element: <ShiftForm />
  },
  {
    path: '/duty-roster/calendar',
    element: <AssignmentCalendar />
  },
  {
    path: '/duty-roster/officer/:id',
    element: <OfficerDutyView />
  },
  {
    path: '/duty-roster/assignments/create',
    element: <AssignmentForm />
  },
  {
    path: '/duty-roster/assignments/:id/edit',
    element: <AssignmentForm />
  }
];

/**
 * Plugin routes initialization
 */
const initialize = (plugin: Plugin) => {
  console.log('Duty Roster routes initialized');
  
  // Check if routes are already registered to avoid duplicates
  const existingRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  console.log(`Found ${existingRoutes.length} existing routes before registration`);
  
  // Get all existing paths to avoid duplicates
  const existingPaths = new Set(
    existingRoutes
      .map(route => route.data?.path)
      .filter((path): path is string => path !== undefined)
  );
  
  // Register each route as an extension point if not already registered
  let registeredCount = 0;
  
  DutyRosterRoutes.forEach((route: RouteObject) => {
    // Ensure path exists before proceeding
    if (!route.path) {
      console.warn('Route missing path property, skipping registration');
      return;
    }
    
    if (!existingPaths.has(route.path)) {
      console.log(`Registering Duty Roster route: ${route.path}`);
      
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
  console.log(`Total registered Duty Roster routes: ${registeredCount}, Total routes: ${registeredRoutes.length}`);
  
  return async () => {
    console.log('Cleaning up Duty Roster routes');
    // Any cleanup logic here
  };
};

export default { initialize }; 