import { v4 as uuidv4 } from 'uuid';
import { Plugin, PluginManifest, PluginStatus, ExtensionPoint } from './types';

/**
 * Plugin class implementation
 * Manages the lifecycle and extension points of a plugin
 */
export class PluginImpl implements Plugin {
  public id: string;
  public manifest: PluginManifest;
  public status: PluginStatus;
  
  private loadedModules: Record<string, any> = {};
  private extensionPoints: Map<string, ExtensionPoint> = new Map();
  private cleanupFunctions: Array<() => Promise<void>> = [];

  constructor(manifest: PluginManifest) {
    this.id = manifest.id;
    this.manifest = manifest;
    this.status = 'registered';
  }

  /**
   * Load all plugin entry points
   */
  async load(): Promise<void> {
    try {
      // Load all entry points
      const entryPoints = this.manifest.entryPoints;
      for (const [name, loader] of Object.entries(entryPoints)) {
        if (loader) {
          this.loadedModules[name] = await loader();
        }
      }
      this.status = 'loaded';
    } catch (error) {
      this.status = 'error';
      console.error(`Failed to load plugin ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Initialize plugin modules
   */
  async initialize(): Promise<void> {
    try {
      console.log(`Initializing plugin ${this.id}, loaded modules:`, Object.keys(this.loadedModules));
      
      // Initialize all modules
      for (const [name, module] of Object.entries(this.loadedModules)) {
        console.log(`Initializing module ${name} for plugin ${this.id}`, module);
        
        if (module.default && typeof module.default.initialize === 'function') {
          console.log(`Calling initialize on module ${name}.default`);
          const cleanup = await module.default.initialize(this);
          if (typeof cleanup === 'function') {
            this.cleanupFunctions.push(cleanup);
          }
        } else if (module.initialize) {
          console.log(`Calling initialize on module ${name}`);
          const cleanup = await module.initialize(this);
          if (typeof cleanup === 'function') {
            this.cleanupFunctions.push(cleanup);
          }
        } else {
          console.log(`Module ${name} has no initialize method`);
        }
      }
      
      this.status = 'initialized';
    } catch (error) {
      this.status = 'error';
      console.error(`Failed to initialize plugin ${this.id}:`, error);
      throw error;
    }
  }

  /**
   * Enable the plugin
   */
  async enable(): Promise<void> {
    // Execute any enable hooks
    if (this.loadedModules.lifecycle?.onEnable) {
      await this.loadedModules.lifecycle.onEnable();
    }
    
    this.status = 'enabled';
  }

  /**
   * Disable the plugin
   */
  async disable(): Promise<void> {
    // Execute any disable hooks
    if (this.loadedModules.lifecycle?.onDisable) {
      await this.loadedModules.lifecycle.onDisable();
    }
    
    this.status = 'disabled';
  }

  /**
   * Clean up plugin resources
   */
  async cleanup(): Promise<void> {
    // Execute all cleanup functions
    for (const cleanupFn of this.cleanupFunctions) {
      await cleanupFn();
    }
    this.cleanupFunctions = [];
    
    // Clear loaded modules
    this.loadedModules = {};
    
    // Clear extension points
    this.extensionPoints.clear();
    
    this.status = 'registered';
  }

  /**
   * Register an extension point for this plugin
   */
  registerExtensionPoint<T>(type: string, data: T, options: { priority?: number } = {}): string {
    const id = uuidv4();
    
    // Check for existing similar extension points
    const existingExtensionPoints = this.getExtensionPoints<T>(type);
    
    // Helper function for type-safe property access
    const getProperty = <P extends string>(obj: any, prop: P): any => {
      return obj && typeof obj === 'object' && prop in obj ? obj[prop] : undefined;
    };
    
    // Check if there's a functionally equivalent extension point already registered
    const hasDuplicate = existingExtensionPoints.some(ext => {
      // For routes, check the path
      if (type === 'routes') {
        const extPath = getProperty(ext.data, 'path');
        const dataPath = getProperty(data, 'path');
        return extPath && dataPath && extPath === dataPath;
      }
      // For navigation items, check the ID and path
      else if (type === 'navigation:main') {
        const extId = getProperty(ext.data, 'id');
        const dataId = getProperty(data, 'id');
        return extId && dataId && extId === dataId;
      }
      // For dashboard widgets, check the title
      else if (type === 'dashboard:widgets') {
        const extTitle = getProperty(ext.data, 'title');
        const dataTitle = getProperty(data, 'title');
        return extTitle && dataTitle && extTitle === dataTitle;
      }
      return false;
    });
    
    // If duplicate found, skip registration and return existing ID
    if (hasDuplicate) {
      console.log(`Skipping duplicate extension point registration for ${type} in plugin ${this.id}`);
      const existingExt = existingExtensionPoints.find(ext => {
        if (type === 'routes') {
          const extPath = getProperty(ext.data, 'path');
          const dataPath = getProperty(data, 'path');
          return extPath && dataPath && extPath === dataPath;
        }
        else if (type === 'navigation:main') {
          const extId = getProperty(ext.data, 'id');
          const dataId = getProperty(data, 'id');
          return extId && dataId && extId === dataId;
        }
        else if (type === 'dashboard:widgets') {
          const extTitle = getProperty(ext.data, 'title');
          const dataTitle = getProperty(data, 'title');
          return extTitle && dataTitle && extTitle === dataTitle;
        }
        return false;
      });
      
      return existingExt?.id || id;
    }
    
    // Create new extension point
    const extensionPoint: ExtensionPoint<T> = {
      id,
      pluginId: this.id,
      type,
      priority: options.priority ?? 10,
      data
    };
    
    this.extensionPoints.set(id, extensionPoint);
    return id;
  }

  /**
   * Unregister an extension point
   */
  unregisterExtensionPoint(id: string): void {
    this.extensionPoints.delete(id);
  }

  /**
   * Get all extension points of a specific type
   */
  getExtensionPoints<T>(type: string): ExtensionPoint<T>[] {
    const extensionPoints: ExtensionPoint<T>[] = [];
    
    for (const extensionPoint of this.extensionPoints.values()) {
      if (extensionPoint.type === type) {
        extensionPoints.push(extensionPoint as ExtensionPoint<T>);
      }
    }
    
    return extensionPoints;
  }

  /**
   * Get a loaded module by name
   */
  getModule(name: string): any {
    return this.loadedModules[name];
  }
} 