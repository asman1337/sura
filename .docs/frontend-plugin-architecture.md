# SURA Frontend Plugin Architecture

## 1. Overview

The SURA frontend is designed with a modular, plugin-based architecture that allows for dynamic loading, enabling, and disabling of functional modules. This design enables:

- **Extensibility**: New modules can be added without modifying the core system
- **Customization**: Each police organization can enable only the modules they need
- **Maintainability**: Modules can be developed, tested, and updated independently
- **Feature toggling**: Modules can be enabled/disabled based on organizational needs or permissions
- **Reduced complexity**: The core system remains lean while functionality is extended via plugins

## 2. Core Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      SURA Core Framework                        │
├─────────────┬─────────────┬───────────────┬────────────────────┤
│ Plugin      │ Core State  │ Authentication│  Core UI           │
│ Registry    │ Management  │ & Access      │  Components        │
└─────────────┴─────────────┴───────────────┴────────────────────┘
                               ▲
                               │
                               │ Register/Use
                               │
          ┌───────────────────┴────────────────────────┐
          │                                            │
          ▼                                            ▼
┌─────────────────────┐                      ┌─────────────────────┐
│  Required Modules   │                      │   Optional Modules  │
├─────────────────────┤                      ├─────────────────────┤
│ - Organizations     │                      │ - Malkhana          │
│ - Units & Hierarchy │                      │ - Complaints        │
│ - Officers & Ranks  │                      │ - Vehicles          │
│ - User Management   │                      │ - Duty Roster       │
│ - Access Control    │                      │ - Case Management   │
└─────────────────────┘                      │ - Grievances        │
                                            │ - Visitor Management │
                                            │ - Intelligence       │
                                            │ - Custom Modules     │
                                            └─────────────────────┘
```

## 3. Plugin Registration System

### 3.1 Plugin Manifest

Each plugin is defined by a manifest file that describes the plugin's metadata, dependencies, and integration points:

```typescript
// Example: malkhana-plugin.manifest.ts
export const MalkhanaPluginManifest = {
  id: 'sura-malkhana-plugin',
  name: 'Malkhana Management',
  version: '1.0.0',
  description: 'Management of evidence items and case property',
  author: 'SURA Team',
  
  // Dependencies on other plugins 
  dependencies: ['sura-core', 'sura-officers'],
  
  // Module entry points
  entryPoints: {
    routes: () => import('./routes'),
    store: () => import('./store'),
    services: () => import('./services'),
    navigationItems: () => import('./navigation'),
    dashboardWidgets: () => import('./widgets'),
    permissions: () => import('./permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['MALKHANA:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 10
  }
};
```

### 3.2 Plugin Registry

The core system maintains a plugin registry that manages the loading, initialization, and lifecycle of all plugins:

```typescript
// Core plugin registry
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  
  async registerPlugin(manifest: PluginManifest): Promise<void> {
    // Check dependencies
    for (const dependency of manifest.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Missing dependency: ${dependency} for plugin ${manifest.id}`);
      }
    }
    
    // Create plugin instance
    const plugin = new Plugin(manifest);
    this.plugins.set(manifest.id, plugin);
    
    // If auto-enable or previously enabled, initialize the plugin
    if (this.shouldEnablePlugin(manifest.id)) {
      await this.enablePlugin(manifest.id);
    }
  }
  
  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    
    // Check permissions
    if (!this.hasRequiredPermissions(plugin.manifest.requiredPermissions)) {
      console.warn(`User lacks permissions to enable plugin: ${pluginId}`);
      return;
    }
    
    // Load and initialize the plugin
    await plugin.load();
    await plugin.initialize();
    
    this.enabledPlugins.add(pluginId);
    this.triggerPluginChangeEvent('plugin-enabled', pluginId);
  }
  
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.enabledPlugins.has(pluginId)) return;
    
    // Check if other enabled plugins depend on this one
    const dependents = this.findDependentPlugins(pluginId);
    if (dependents.length > 0) {
      throw new Error(`Cannot disable plugin ${pluginId}, it is required by: ${dependents.join(', ')}`);
    }
    
    // Shutdown the plugin
    await plugin.cleanup();
    
    this.enabledPlugins.delete(pluginId);
    this.triggerPluginChangeEvent('plugin-disabled', pluginId);
  }
  
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id))
      .filter(Boolean) as Plugin[];
  }
  
  // Additional methods for managing plugins...
}
```

## 4. Dynamic Module Loading

### 4.1 Lazy Loading

Plugins use dynamic imports for lazy loading, reducing the initial bundle size and loading modules only when needed:

```typescript
// Dynamic route loading
const PluginRoutes = () => {
  const { enabledPlugins } = usePluginRegistry();
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Core routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        
        {/* Plugin routes */}
        {enabledPlugins.map(plugin => (
          <Route 
            key={plugin.id}
            path={`/${plugin.baseRoutePath}/*`}
            element={<PluginRouteLoader pluginId={plugin.id} />} 
          />
        ))}
      </Routes>
    </Suspense>
  );
};

// Plugin-specific route loader
const PluginRouteLoader = ({ pluginId }) => {
  const { getPlugin } = usePluginRegistry();
  const plugin = getPlugin(pluginId);
  
  const LazyRoutes = useMemo(() => 
    React.lazy(() => plugin.entryPoints.routes()), [plugin]);
  
  return <LazyRoutes />;
};
```

### 4.2 Code Splitting

The build system is configured to generate separate chunks for each plugin, allowing for efficient loading:

```javascript
// webpack.config.js (example)
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Core vendor bundle
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        // Bundle for each plugin
        plugins: {
          test: /[\\/]src[\\/]plugins[\\/]([^\/]+)[\\/]/,
          name(module) {
            const pluginName = module.context.match(/[\\/]plugins[\\/](.*?)[\\/]/)[1];
            return `plugin-${pluginName}`;
          },
          chunks: 'all',
          priority: 5,
          enforce: true
        }
      }
    }
  }
};
```

## 5. State Management with Plugins

### 5.1 Modular Redux Structure

Each plugin manages its own state slice, with the core system combining them dynamically:

```typescript
// Core store configuration
const createRootReducer = (pluginReducers = {}) => {
  return combineReducers({
    // Core reducers
    auth: authReducer,
    config: configReducer,
    organization: organizationReducer,
    
    // Plugin reducers (dynamically injected)
    ...pluginReducers
  });
};

// Store creator with plugin support
export const configureStore = () => {
  // Initial store with just core reducers
  const store = createStore(
    createRootReducer(),
    applyMiddleware(thunk)
  );
  
  // Reducer registry
  const asyncReducers = {};
  
  // Method to inject reducer at runtime
  store.injectReducer = (key, reducer) => {
    asyncReducers[key] = reducer;
    store.replaceReducer(createRootReducer(asyncReducers));
  };
  
  return store;
};

// In plugin initialization
export function initializeStore(store) {
  // Inject plugin-specific reducer
  store.injectReducer('malkhana', malkhanaReducer);
}
```

### 5.2 Plugin State Persistence

Plugin state can be selectively persisted based on configuration:

```typescript
// Persistence configuration
const persistConfig = {
  key: 'sura-root',
  storage,
  whitelist: ['auth', 'config'], // Core states to persist
  transforms: [
    // Plugin states persistence
    createTransform(
      // Transform state before saving
      (inboundState, key) => {
        // Only persist enabled plugin states
        const enabledPluginIds = getEnabledPluginIds();
        return Object.fromEntries(
          Object.entries(inboundState).filter(([k]) => 
            enabledPluginIds.includes(k)
          )
        );
      },
      // Transform state loaded from storage
      (outboundState, key) => outboundState,
      { whitelist: ['plugins'] }
    )
  ]
};
```

## 6. Plugin UI Integration

### 6.1 Extension Points

The core UI provides multiple extension points where plugins can integrate:

```typescript
// Navigation integration
const MainNavigation = () => {
  const { getExtensionPoints } = usePluginSystem();
  const navigationItems = getExtensionPoints('navigation:main');
  
  return (
    <Sidebar>
      {/* Core navigation */}
      <NavItem to="/dashboard" icon={<DashboardIcon />}>Dashboard</NavItem>
      <NavItem to="/organizations" icon={<OrgIcon />}>Organizations</NavItem>
      
      {/* Plugin navigation items, sorted by priority */}
      {navigationItems
        .sort((a, b) => a.priority - b.priority)
        .map(item => (
          <NavItem 
            key={item.id}
            to={item.path}
            icon={item.icon}
            badge={item.badgeCount}
          >
            {item.label}
          </NavItem>
        ))}
    </Sidebar>
  );
};

// Dashboard widget integration
const DashboardGrid = () => {
  const { getExtensionPoints } = usePluginSystem();
  const widgets = getExtensionPoints('dashboard:widgets');
  
  return (
    <Grid container spacing={3}>
      {/* Core widgets */}
      <Grid item xs={12} md={6}>
        <OfficerSummaryWidget />
      </Grid>
      
      {/* Plugin widgets */}
      {widgets.map(widget => (
        <Grid item key={widget.id} xs={12} md={widget.width || 6}>
          <Suspense fallback={<WidgetSkeleton />}>
            <widget.component />
          </Suspense>
        </Grid>
      ))}
    </Grid>
  );
};
```

### 6.2 Theme Integration

Plugins can extend the theme with custom variables and components:

```typescript
// Core theme provider with plugin extensions
const ThemeProvider = ({ children }) => {
  const { getExtensionPoints } = usePluginSystem();
  const themeExtensions = getExtensionPoints('theme:extensions');
  
  // Build the theme with extensions
  const theme = useMemo(() => {
    const baseTheme = createTheme({
      // Base theme configuration
      palette: { /* ... */ },
      typography: { /* ... */ },
      components: { /* ... */ },
    });
    
    // Apply plugin theme extensions
    return themeExtensions.reduce((currentTheme, extension) => {
      return createTheme(currentTheme, extension.themeOverrides);
    }, baseTheme);
  }, [themeExtensions]);
  
  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
};
```

## 7. Plugin Lifecycle Management

```typescript
class Plugin {
  public id: string;
  public manifest: PluginManifest;
  private loadedModules: Record<string, any> = {};
  private status: 'registered' | 'loaded' | 'initialized' | 'enabled' | 'disabled' | 'error';
  private cleanupFunctions: Array<() => Promise<void>> = [];
  
  constructor(manifest: PluginManifest) {
    this.id = manifest.id;
    this.manifest = manifest;
    this.status = 'registered';
  }
  
  async load(): Promise<void> {
    try {
      // Load all entry points
      const entryPoints = this.manifest.entryPoints;
      for (const [name, loader] of Object.entries(entryPoints)) {
        this.loadedModules[name] = await loader();
      }
      this.status = 'loaded';
    } catch (error) {
      this.status = 'error';
      console.error(`Failed to load plugin ${this.id}:`, error);
      throw error;
    }
  }
  
  async initialize(): Promise<void> {
    try {
      // Initialize all modules
      for (const [name, module] of Object.entries(this.loadedModules)) {
        if (module.initialize) {
          const cleanup = await module.initialize();
          if (typeof cleanup === 'function') {
            this.cleanupFunctions.push(cleanup);
          }
        }
      }
      this.status = 'initialized';
    } catch (error) {
      this.status = 'error';
      console.error(`Failed to initialize plugin ${this.id}:`, error);
      throw error;
    }
  }
  
  async enable(): Promise<void> {
    // Register extension points
    this.registerExtensionPoints();
    
    // Execute any enable hooks
    if (this.loadedModules.lifecycle?.onEnable) {
      await this.loadedModules.lifecycle.onEnable();
    }
    
    this.status = 'enabled';
  }
  
  async disable(): Promise<void> {
    // Execute any disable hooks
    if (this.loadedModules.lifecycle?.onDisable) {
      await this.loadedModules.lifecycle.onDisable();
    }
    
    // Unregister extension points
    this.unregisterExtensionPoints();
    
    this.status = 'disabled';
  }
  
  async cleanup(): Promise<void> {
    // Execute all cleanup functions
    for (const cleanupFn of this.cleanupFunctions) {
      await cleanupFn();
    }
    this.cleanupFunctions = [];
    
    // Clear loaded modules
    this.loadedModules = {};
    
    this.status = 'registered';
  }
  
  // Additional methods for plugin operation
}
```

## 8. Plugin Management Interface

The system includes an administrator interface for managing plugins:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Plugin Management                                                     ⨯ │
├─────────┬─────────────────────┬──────────┬──────────────┬──────────────┤
│ Status  │ Plugin Name         │ Version  │ Dependencies │ Actions      │
├─────────┼─────────────────────┼──────────┼──────────────┼──────────────┤
│ ● Active│ Malkhana Management │ 1.0.0    │ Core, Users  │ ⚙️ Configure │
│         │                     │          │              │ ⭾ Disable    │
├─────────┼─────────────────────┼──────────┼──────────────┼──────────────┤
│ ● Active│ Complaints Module   │ 1.2.3    │ Core, Users  │ ⚙️ Configure │
│         │                     │          │              │ ⭾ Disable    │
├─────────┼─────────────────────┼──────────┼──────────────┼──────────────┤
│ ○ Off   │ Vehicle Management  │ 0.9.1    │ Core         │ ⚙️ Configure │
│         │                     │          │              │ ⭿ Enable     │
├─────────┼─────────────────────┼──────────┼──────────────┼──────────────┤
│ + Available Plugins                                                    │
├─────────┼─────────────────────┼──────────┼──────────────┼──────────────┤
│ ↓ Install│ Visitor Management │ 1.4.0    │ Core, Users  │ ℹ️ Details   │
├─────────┼─────────────────────┼──────────┼──────────────┼──────────────┤
│ ↓ Install│ Intelligence Module│ 2.1.0    │ Core, Users  │ ℹ️ Details   │
└─────────┴─────────────────────┴──────────┴──────────────┴──────────────┘
```

## 9. Plugin Configuration

Each plugin can provide configuration options through a standardized interface:

```typescript
// Plugin configuration definition
export interface MalkhanaPluginConfig {
  enableBarcodeScanning: boolean;
  evidenceCategories: string[];
  requirePhotoUpload: boolean;
  autoGenerateEvidenceNumbers: boolean;
  evidenceNumberPrefix: string;
}

// Default configuration
export const defaultConfig: MalkhanaPluginConfig = {
  enableBarcodeScanning: true,
  evidenceCategories: ['Weapons', 'Documents', 'Narcotics', 'Currency', 'Other'],
  requirePhotoUpload: true,
  autoGenerateEvidenceNumbers: true,
  evidenceNumberPrefix: 'EV'
};

// Configuration form component
export const MalkhanaConfigForm: React.FC<{
  config: MalkhanaPluginConfig, 
  onSave: (config: MalkhanaPluginConfig) => void
}> = ({ config, onSave }) => {
  // Form implementation...
};
```

## 10. Sample Plugin Structure

### 10.1 Directory Structure

```
/src
  /plugins
    /malkhana
      index.ts                 # Plugin entry point
      manifest.ts              # Plugin manifest
      /components              # UI components
      /store                   # Redux state management
        index.ts
        malkhanaSlice.ts
        selectors.ts
        thunks.ts
      /api                     # API services
        malkhanaService.ts
      /pages                   # Route components
        MalkhanaList.tsx
        MalkhanaDetail.tsx
        AddEvidenceForm.tsx
      /hooks                   # Custom hooks
      /utils                   # Helper functions
      /types                   # TypeScript types
      /extensions              # Extension point implementations
        navigation.ts
        dashboard.ts
        permissions.ts
        routes.ts
```

### 10.2 Plugin Entry Point

```typescript
// index.ts
import { MalkhanaPluginManifest } from './manifest';

export default {
  manifest: MalkhanaPluginManifest,
  
  // Plugin lifecycle hooks
  onLoad: async () => {
    console.log('Malkhana plugin loaded');
  },
  
  onEnable: async () => {
    console.log('Malkhana plugin enabled');
  },
  
  onDisable: async () => {
    console.log('Malkhana plugin disabled');
    // Clean up any listeners, etc.
  },
  
  // Entry points are referenced in manifest
};
```

## 11. Implementation Strategy

### 11.1 Development Process

1. **Core Framework**: Develop the plugin system as part of the core framework
2. **Required Modules**: Implement required modules (Organization, Units, Officers)
3. **Plugin Template**: Create a plugin template for consistent development
4. **First Plugins**: Develop the first few plugins (Malkhana, Complaints)
5. **Testing**: Comprehensive testing of plugin loading, unloading, and integration
6. **Documentation**: Create developer guides for plugin creation
7. **Marketplace**: Develop a plugin marketplace for sharing and installation

### 11.2 Best Practices

- **Isolation**: Plugins should be isolated and not directly modify core system behavior
- **Dependency Management**: Clearly define and validate dependencies between plugins
- **Versioning**: Use semantic versioning for plugins and their compatibility with the core
- **Error Handling**: Plugins should fail gracefully and not crash the entire application
- **Performance**: Lazy load plugin resources to minimize impact on initial load
- **Testing**: Each plugin should include its own test suite
- **Documentation**: Each plugin should include documentation on its features and configuration

## 12. Conclusion

The SURA frontend plugin architecture provides a flexible and scalable approach to building a complex police management system. By separating functionality into modular plugins, the system can adapt to different police organizations' needs while maintaining a consistent core experience.

This architecture allows for:

- Progressive enhancement of functionality based on organizational needs
- Rapid development and deployment of new features as plugins
- Customization without modifying the core system
- Improved maintainability through modular development
- Opt-in complexity where features are only added when needed 