import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PluginManifest } from './types';
import { usePlugins } from './PluginContext';

interface PluginLoaderProps {
  plugins: { manifest: PluginManifest }[];
  onLoaded?: () => void;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component for loading and registering plugins
 */
export const PluginLoader: React.FC<PluginLoaderProps> = ({
  plugins,
  onLoaded,
  fallback = <div>Loading plugins...</div>,
  children,
}) => {
  const { registerPlugin } = usePlugins();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of which plugins have already been registered
  // This ref persists across renders without triggering re-renders
  const registeredPluginIds = useRef<Set<string>>(new Set());
  
  // Memoize the plugins array to prevent unnecessary re-renders
  const memoizedPlugins = useMemo(() => plugins, [
    // Only re-memoize if plugin IDs change (not on every render)
    plugins.map(plugin => plugin.manifest.id).join(',')
  ]);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        let newPluginsRegistered = false;
        
        // Register all plugins that haven't been registered yet
        for (const plugin of memoizedPlugins) {
          // Skip if we've already registered this plugin
          if (registeredPluginIds.current.has(plugin.manifest.id)) {
            console.log(`Plugin ${plugin.manifest.id} already registered, skipping.`);
            continue;
          }
          
          console.log(`Registering plugin: ${plugin.manifest.id}`);
          await registerPlugin(plugin.manifest);
          registeredPluginIds.current.add(plugin.manifest.id);
          newPluginsRegistered = true;
        }
        
        setLoading(false);
        
        // Only call onLoaded if we actually registered new plugins or this is the first load
        if (newPluginsRegistered && onLoaded) {
          onLoaded();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plugins');
        setLoading(false);
      }
    };

    loadPlugins();
    // We use memoizedPlugins instead of plugins to prevent unnecessary re-runs
  }, [memoizedPlugins, registerPlugin, onLoaded]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (error) {
    return <div className="plugin-loader-error">Error loading plugins: {error}</div>;
  }

  return <>{children}</>;
};

/**
 * Component for conditionally rendering content based on plugin availability
 */
interface IfPluginProps {
  pluginId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const IfPlugin: React.FC<IfPluginProps> = ({
  pluginId,
  children,
  fallback = null,
}) => {
  const { enabledPlugins } = usePlugins();
  const isEnabled = enabledPlugins.some(plugin => plugin.id === pluginId);

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}; 