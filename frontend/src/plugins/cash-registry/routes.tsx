import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin } from '../../core/plugins';

// Import actual components
import {
  CashRegistryDashboard,
  TransactionDetail,
  TransactionForm,
  ReceiptsList,
  DisbursementsList,
  DailyBalanceView,
  BalanceHistory
} from './components';

/**
 * Route extension point data interface
 */
interface RouteExtensionData {
  path: string;
  element: React.ReactNode;
}

/**
 * Routes for the Cash Registry module
 */
const CashRegistryRoutes: RouteObject[] = [
  {
    path: '/cash-registry',
    element: <CashRegistryDashboard />
  },
  {
    path: '/cash-registry/receipts',
    element: <ReceiptsList />
  },
  {
    path: '/cash-registry/disbursements',
    element: <DisbursementsList />
  },
  {
    path: '/cash-registry/add',
    element: <TransactionForm />
  },
  {
    path: '/cash-registry/edit/:id',
    element: <TransactionForm isEditing={true} />
  },
  {
    path: '/cash-registry/transaction/:id',
    element: <TransactionDetail />
  },
  {
    path: '/cash-registry/daily-balance',
    element: <DailyBalanceView />
  },
  {
    path: '/cash-registry/balance-history',
    element: <BalanceHistory />
  }
];

/**
 * Plugin routes initialization
 * 
 * IMPORTANT: This uses the 'routes' extension point type which matches
 * what the core Routes.tsx component expects.
 */
const initialize = (plugin: Plugin) => {
  console.log('Cash Registry routes initialized');
  
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
  
  CashRegistryRoutes.forEach((route: RouteObject) => {
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
  
  console.log(`Registered ${registeredCount} new routes for Cash Registry`);
  
  // Optional cleanup function
  return async () => {
    console.log('Cash Registry routes cleanup');
  };
};

export default { initialize }; 