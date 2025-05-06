/**
 * Core Plugin System Types
 */

// Plugin status types
export type PluginStatus = 'registered' | 'loaded' | 'initialized' | 'enabled' | 'disabled' | 'error';

// Plugin entry points - functions that import plugin modules
export interface PluginEntryPoints {
  routes?: () => Promise<any>;
  store?: () => Promise<any>;
  services?: () => Promise<any>;
  navigationItems?: () => Promise<any>;
  dashboardWidgets?: () => Promise<any>;
  permissions?: () => Promise<any>;
  [key: string]: (() => Promise<any>) | undefined;
}

// Plugin manifest containing metadata and configuration
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  
  // Dependencies on other plugins
  dependencies: string[];
  
  // Entry points for lazy loading
  entryPoints: PluginEntryPoints;
  
  // Permissions required to enable this plugin
  requiredPermissions?: string[];
  
  // Integration settings
  settings: {
    allowMultipleInstances: boolean;
    loadPriority: number;
    autoEnable?: boolean;
  }
}

// Extension point for plugin UI integration
export interface ExtensionPoint<T = any> {
  id: string;
  pluginId: string;
  type: string;
  priority: number;
  data: T;
}

// Navigation extension point data
export interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

// Dashboard widget extension point data
export interface DashboardWidget {
  component: React.ComponentType;
  width?: number; // Grid width (1-12)
  height?: number;
  minHeight?: number;
  title: string;
}

// Permission definition
export interface PermissionDefinition {
  id: string;
  resource: string;
  action: string;
  description: string;
}

// Plugin interface
export interface Plugin {
  id: string;
  manifest: PluginManifest;
  status: PluginStatus;
  
  // Lifecycle methods
  load(): Promise<void>;
  initialize(): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  cleanup(): Promise<void>;
  
  // Extension point methods
  registerExtensionPoint<T>(type: string, data: T, options?: { priority?: number }): string;
  unregisterExtensionPoint(id: string): void;
  getExtensionPoints<T>(type: string): ExtensionPoint<T>[];
} 