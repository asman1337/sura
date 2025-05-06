import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginRegistry } from './PluginRegistry';
import { Plugin, PluginManifest, ExtensionPoint } from './types';

interface PluginContextType {
  registry: PluginRegistry;
  isLoading: boolean;
  registeredPlugins: Plugin[];
  enabledPlugins: Plugin[];
  registerPlugin: (manifest: PluginManifest) => Promise<void>;
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => Promise<void>;
  getPlugin: (id: string) => Plugin | undefined;
  getExtensionPoints: <T>(type: string) => ExtensionPoint<T>[];
}

// Create the context with a default undefined value
const PluginContext = createContext<PluginContextType | undefined>(undefined);

interface PluginProviderProps {
  children: ReactNode;
}

/**
 * Provider component for plugin system
 */
export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
  const [registry] = useState(() => new PluginRegistry());
  const [isLoading, setIsLoading] = useState(true);
  const [registeredPlugins, setRegisteredPlugins] = useState<Plugin[]>([]);
  const [enabledPlugins, setEnabledPlugins] = useState<Plugin[]>([]);

  // Update plugin lists when they change
  useEffect(() => {
    const handlePluginChange = () => {
      setRegisteredPlugins(registry.getAllPlugins());
      setEnabledPlugins(registry.getEnabledPlugins());
    };

    // Add listener for plugin changes
    registry.addChangeListener(handlePluginChange);
    
    // Initial load of plugins (could fetch from API)
    const loadInitialPlugins = async () => {
      // Here we would normally load plugins from an API or local storage
      // For now, just marking as loaded
      setIsLoading(false);
    };
    
    loadInitialPlugins();
    
    return () => {
      registry.removeChangeListener(handlePluginChange);
    };
  }, [registry]);

  const value: PluginContextType = {
    registry,
    isLoading,
    registeredPlugins,
    enabledPlugins,
    registerPlugin: (manifest) => registry.registerPlugin(manifest),
    enablePlugin: (id) => registry.enablePlugin(id),
    disablePlugin: (id) => registry.disablePlugin(id),
    getPlugin: (id) => registry.getPlugin(id),
    getExtensionPoints: (type) => registry.getExtensionPoints(type),
  };

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
};

/**
 * Hook to use the plugin system
 */
export const usePlugins = (): PluginContextType => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

/**
 * Hook to use extension points of a specific type
 */
export function useExtensionPoints<T>(type: string): ExtensionPoint<T>[] {
  const { getExtensionPoints } = usePlugins();
  return getExtensionPoints<T>(type);
} 