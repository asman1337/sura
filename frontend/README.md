# SURA Frontend - Plugin-Based Architecture

This project implements a modular plugin-based frontend architecture for the SURA police management system, allowing for easy addition, removal, and toggling of non-core modules.

## Architecture Overview

The SURA frontend is built with a core/plugin architecture:

- **Core Framework**: Contains essential functionality like authentication, state management, and plugin system itself
- **Required Modules**: Core functionality that is always enabled
- **Optional Plugins**: Modules that can be enabled/disabled as needed

## Key Features

- **Plugin Registry**: Central system for managing plugin lifecycle
- **Dynamic Loading**: Lazy-loading of plugins for optimized performance
- **Runtime Registration**: Plugins can be registered at runtime
- **Extension Points**: Plugins can add UI elements to standard locations
- **Module Federation**: Plugins are separate code chunks to minimize bundle size
- **Plugin Management UI**: Admin interface for enabling/disabling plugins

## Folder Structure

```
/frontend
  /src
    /core            # Core framework
      /plugins       # Plugin system
      /store         # Redux store
      /components    # Shared UI components
    /plugins         # Plugin modules
      /malkhana      # Malkhana plugin
        index.ts     # Entry point
        manifest.ts  # Plugin metadata
        /components  # Plugin-specific components
        /store       # Plugin state management
        /api         # API services
        /pages       # Router pages
        /extensions  # Extension points
```

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Usage

### Adding a New Plugin

1. Create a new folder in `/src/plugins/{your-plugin-name}`
2. Create a manifest file that defines your plugin:

```typescript
// manifest.ts
import { PluginManifest } from '../../core/plugins';

export const YourPluginManifest: PluginManifest = {
  id: 'sura-your-plugin',
  name: 'Your Plugin Name',
  version: '1.0.0',
  description: 'Description of your plugin',
  author: 'Your Name',
  dependencies: [], // Other plugins this depends on
  entryPoints: {
    routes: () => import('./routes'),
    store: () => import('./store'),
    // other entry points
  },
  requiredPermissions: ['YOUR_PERMISSION'],
  settings: {
    allowMultipleInstances: false,
    loadPriority: 10,
    autoEnable: false
  }
};
```

3. Create an entry point file:

```typescript
// index.ts
import { YourPluginManifest } from './manifest';

export default {
  manifest: YourPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('Plugin loaded');
  },
  
  onEnable: async () => {
    console.log('Plugin enabled');
  },
  
  onDisable: async () => {
    console.log('Plugin disabled');
  },
};
```

4. Import and register your plugin in the application:

```typescript
// In App.tsx or a plugin loader
import YourPlugin from './plugins/your-plugin';

// Add to plugins list
const pluginsToLoad = [
  // ... other plugins
  YourPlugin,
];
```

### Extension Points

Plugins can extend the UI through extension points:

```typescript
// In your plugin's navigation.ts
import { NavigationItem } from '../../core/plugins';

export default {
  initialize: (plugin) => {
    // Register a navigation item
    plugin.registerExtensionPoint<NavigationItem>(
      'navigation:main', 
      {
        path: '/your-route',
        label: 'Your Feature',
        icon: YourIcon,
      },
      { priority: 20 }
    );
    
    // Return cleanup function (optional)
    return async () => {
      console.log('Navigation cleanup');
    };
  }
};
```

### Redux Integration

Plugins can add their own reducers to the global store:

```typescript
// In your plugin's store.ts
import { createSlice } from '@reduxjs/toolkit';

const yourSlice = createSlice({
  name: 'yourPlugin',
  initialState: {
    // Your state
  },
  reducers: {
    // Your reducers
  }
});

export default {
  initialize: (_, store) => {
    // Register reducer with the store
    store.injectReducer('yourPlugin', yourSlice.reducer);
    
    // Export actions for use elsewhere in your plugin
    return {
      actions: yourSlice.actions
    };
  }
};
```

## Plugin Management

The system includes a PluginManager component that allows administrators to:

- View all registered plugins
- See which plugins are currently enabled
- Enable/disable plugins at runtime
- View dependencies between plugins

## Contributing

1. Create a new plugin following the structure above
2. Test thoroughly in isolation
3. Submit a pull request with your plugin
