import React from 'react';
import { Plugin } from '../../core/plugins';

// Lazy-loaded components
const MalkhanaHome = React.lazy(() => import('./components/MalkhanaHome'));
const MalkhanaDetail = React.lazy(() => import('./components/MalkhanaDetail'));

// Export a function that will be called by the plugin system
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana routes initialized');
    
    // Register routes
    plugin.registerExtensionPoint(
      'routes:main',
      {
        path: '/malkhana',
        component: MalkhanaHome,
        exact: true,
        permissions: ['malkhana:read']
      }
    );
    
    plugin.registerExtensionPoint(
      'routes:main',
      {
        path: '/malkhana/:id',
        component: MalkhanaDetail,
        exact: true,
        permissions: ['malkhana:read']
      }
    );
  }
}; 