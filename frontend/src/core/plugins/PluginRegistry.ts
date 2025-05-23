import { Plugin, PluginManifest, ExtensionPoint } from './types';
import { PluginImpl } from './Plugin';

type PluginChangeEventType = 'plugin-registered' | 'plugin-enabled' | 'plugin-disabled' | 'plugin-error';

interface PluginChangeEvent {
  type: PluginChangeEventType;
  pluginId: string;
}

type PluginChangeListener = (event: PluginChangeEvent) => void;

/**
 * Registry for managing plugins and their lifecycle
 */
export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private pluginPreferences: Map<string, boolean> = new Map(); // Stores user preferences for plugin enabling
  private listeners: PluginChangeListener[] = [];

  /**
   * Register a new plugin
   */
  async registerPlugin(manifest: PluginManifest): Promise<void> {
    // Check if plugin is already registered
    if (this.plugins.has(manifest.id)) {
      console.warn(`Plugin ${manifest.id} is already registered. This might indicate a duplicate registration attempt.`);
      
      // If it's already registered but not enabled, try to enable it
      if (!this.enabledPlugins.has(manifest.id) && this.shouldEnablePlugin(manifest.id)) {
        console.log(`Enabling previously registered plugin: ${manifest.id}`);
        await this.enablePlugin(manifest.id);
      }
      
      return;
    }

    console.log(`Registering new plugin: ${manifest.id} (${manifest.name} v${manifest.version})`);

    // Check dependencies
    for (const dependency of manifest.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Missing dependency: ${dependency} for plugin ${manifest.id}`);
      }
    }
    
    // Create plugin instance
    const plugin = new PluginImpl(manifest);
    this.plugins.set(manifest.id, plugin);
    
    this.triggerPluginChangeEvent('plugin-registered', manifest.id);
    
    // If auto-enable or previously enabled, initialize the plugin
    if (this.shouldEnablePlugin(manifest.id)) {
      await this.enablePlugin(manifest.id);
    }
  }

  /**
   * Check if a plugin should be automatically enabled
   */
  private shouldEnablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    
    // Check user preferences first
    if (this.pluginPreferences.has(pluginId)) {
      return this.pluginPreferences.get(pluginId) as boolean;
    }
    
    // If no preference, check auto-enable setting
    return plugin.manifest.settings.autoEnable ?? false;
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Cannot enable plugin ${pluginId}: not found.`);
      return;
    }
    
    // Skip if already enabled
    if (this.enabledPlugins.has(pluginId)) {
      console.log(`Plugin ${pluginId} is already enabled, skipping.`);
      return;
    }
    
    // Check required permissions (simplified, would normally check against user permissions)
    if (plugin.manifest.requiredPermissions?.length && !this.hasRequiredPermissions(plugin.manifest.requiredPermissions)) {
      console.warn(`User lacks permissions to enable plugin: ${pluginId}`);
      this.triggerPluginChangeEvent('plugin-error', pluginId);
      return;
    }
    
    try {
      // Ensure dependencies are enabled
      for (const dependency of plugin.manifest.dependencies) {
        if (!this.enabledPlugins.has(dependency)) {
          await this.enablePlugin(dependency);
        }
      }
      
      // Load and initialize the plugin if not already done
      if (plugin.status === 'registered') {
        await plugin.load();
      }
      
      if (plugin.status === 'loaded') {
        await plugin.initialize();
      }
      
      // Enable the plugin only if not already enabled
      if (plugin.status !== 'enabled') {
        await plugin.enable();
      }
      
      // Mark as enabled
      this.enabledPlugins.add(pluginId);
      this.pluginPreferences.set(pluginId, true);
      
      this.triggerPluginChangeEvent('plugin-enabled', pluginId);
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      this.triggerPluginChangeEvent('plugin-error', pluginId);
      throw error;
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.enabledPlugins.has(pluginId)) {
      return;
    }
    
    try {
      // Check if other enabled plugins depend on this one
      const dependents = this.findDependentPlugins(pluginId);
      if (dependents.length > 0) {
        throw new Error(`Cannot disable plugin ${pluginId}, it is required by: ${dependents.join(', ')}`);
      }
      
      // Disable the plugin
      await plugin.disable();
      
      // Mark as disabled
      this.enabledPlugins.delete(pluginId);
      this.pluginPreferences.set(pluginId, false);
      
      this.triggerPluginChangeEvent('plugin-disabled', pluginId);
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      this.triggerPluginChangeEvent('plugin-error', pluginId);
      throw error;
    }
  }

  /**
   * Find plugins that depend on the specified plugin
   */
  private findDependentPlugins(pluginId: string): string[] {
    const dependents: string[] = [];
    
    for (const [id, plugin] of this.plugins.entries()) {
      if (this.enabledPlugins.has(id) && plugin.manifest.dependencies.includes(pluginId)) {
        dependents.push(id);
      }
    }
    
    return dependents;
  }

  /**
   * Check if user has required permissions (simplified)
   */
  private hasRequiredPermissions(permissions: string[]): boolean {
    // In a real application, this would check against the user's permissions
    // For now, just return true
    return true;
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id))
      .filter(Boolean) as Plugin[];
  }

  /**
   * Get all registered extension points of a specific type
   */
  getExtensionPoints<T>(type: string): ExtensionPoint<T>[] {
    const allExtensionPoints: ExtensionPoint<T>[] = [];
    
    for (const plugin of this.plugins.values()) {
      if (this.enabledPlugins.has(plugin.id)) {
        const extensionPoints = plugin.getExtensionPoints<T>(type);
        allExtensionPoints.push(...extensionPoints);
      }
    }
    
    // Sort by priority (higher priority first)
    return allExtensionPoints.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Add a listener for plugin change events
   */
  addChangeListener(listener: PluginChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeChangeListener(listener: PluginChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Trigger a plugin change event
   */
  private triggerPluginChangeEvent(type: PluginChangeEventType, pluginId: string): void {
    const event: PluginChangeEvent = { type, pluginId };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in plugin change listener:', error);
      }
    }
  }
} 