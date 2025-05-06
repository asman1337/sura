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