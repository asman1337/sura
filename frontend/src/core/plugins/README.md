# SURA Plugin Development Guide

This guide explains how to develop plugins for the SURA platform.

## Plugin Structure

A typical plugin has the following structure:

```
/plugins
  /your-plugin-name
    index.ts               # Plugin entry point
    manifest.ts            # Plugin manifest
    routes.tsx             # Route definitions
    store.ts               # State management
    services.ts            # API services
    /components            # UI components
    /extensions            # Extension point implementations
      navigation.ts        # Navigation extensions
      widgets.tsx          # Dashboard widgets
      permissions.ts       # Permission definitions
```

## Creating a New Plugin

### 1. Create a manifest file (manifest.ts)

```typescript
import { PluginManifest } from '../../core/plugins';

export const YourPluginManifest: PluginManifest = {
  id: 'sura-your-plugin-id',
  name: 'Your Plugin Name',
  version: '1.0.0',
  description: 'Description of your plugin',
  author: 'Your Name',
  
  // List dependencies on other plugins if needed
  dependencies: [], 
  
  // Module entry points - IMPORTANT: Use .tsx extension for routes
  entryPoints: {
    routes: () => import('./routes.tsx'),
    store: () => import('./store'),
    services: () => import('./services'),
    navigation: () => import('./extensions/navigation'),
    dashboardWidgets: () => import('./extensions/widgets.tsx'),
    permissions: () => import('./extensions/permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['YOUR_PLUGIN:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 10,
    autoEnable: true // For development; set to false for production
  }
};
```

### 2. Create a plugin entry point (index.ts)

```typescript
import { YourPluginManifest } from './manifest';

export default {
  manifest: YourPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('Your plugin loaded');
  },
  
  onEnable: async () => {
    console.log('Your plugin enabled');
  },
  
  onDisable: async () => {
    console.log('Your plugin disabled');
  },
};
```

### 3. Define Routes (routes.tsx)

IMPORTANT: Use the 'routes' extension point type (not 'routes:main') to ensure compatibility with the core routing system.

```typescript
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Plugin, ExtensionPoint } from '../../core/plugins';

import YourComponent from './components/YourComponent';

// Route extension point data interface
interface RouteExtensionData {
  path: string;
  element: React.ReactNode;
}

// Define your routes
const YourPluginRoutes: RouteObject[] = [
  {
    path: '/your-plugin',
    element: <YourComponent />
  },
  // Add more routes as needed
];

// Plugin routes initialization
const initialize = (plugin: Plugin) => {
  console.log('Your plugin routes initialized');
  
  // Check if routes are already registered to avoid duplicates
  const existingRoutes = plugin.getExtensionPoints<RouteExtensionData>('routes');
  
  // Get all existing paths to avoid duplicates
  const existingPaths = new Set(
    existingRoutes
      .map(route => route.data?.path)
      .filter((path): path is string => path !== undefined)
  );
  
  // Register each route as an extension point if not already registered
  YourPluginRoutes.forEach((route: RouteObject) => {
    // Ensure path exists before proceeding
    if (!route.path) {
      console.warn('Route missing path property, skipping registration');
      return;
    }
    
    if (!existingPaths.has(route.path)) {
      // IMPORTANT: Use 'routes' as the extension point type
      plugin.registerExtensionPoint<RouteExtensionData>('routes', {
        path: route.path,
        element: route.element
      });
    }
  });
  
  return async () => {
    // Cleanup function if needed
  };
};

export default { initialize };
```

### 4. Create Navigation Extensions (extensions/navigation.ts)

```typescript
import { Plugin, NavigationItem } from '../../../core/plugins';

const navigationExtension = {
  initialize: (plugin: Plugin) => {
    // Register a navigation item for the plugin
    plugin.registerExtensionPoint<NavigationItem>(
      'navigation:main',
      {
        id: 'your-plugin-main',
        path: '/your-plugin',
        title: 'Your Plugin',
        icon: 'YourIcon',
      },
      { priority: 20 }
    );
    
    return async () => {
      // Cleanup function if needed
    };
  }
};

export default navigationExtension;
```

## Common Issues and Troubleshooting

### Routes not appearing

1. Make sure your manifest.ts file references routes.tsx (with the .tsx extension)
2. Ensure your routes use the 'routes' extension point type (not 'routes:main')
3. Check the console for route registration errors

### Plugin not loading

1. Check if your plugin has all required dependencies
2. Verify that your plugin has the required permissions
3. Make sure there are no errors during initialization
4. Check for duplicate plugin registrations

## Best Practices

1. Always use TypeScript for type safety
2. Follow the established naming conventions
3. Create reusable components within your plugin
4. Use extension points to integrate with the core system
5. Add proper logging for debugging
6. Implement cleanup functions to prevent memory leaks 