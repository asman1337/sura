import React, { useEffect, useState } from 'react';
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
  const { registerPlugin, enabledPlugins } = usePlugins();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        // Register all plugins
        for (const plugin of plugins) {
          await registerPlugin(plugin.manifest);
        }
        
        setLoading(false);
        if (onLoaded) {
          onLoaded();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plugins');
        setLoading(false);
      }
    };

    loadPlugins();
  }, [plugins, registerPlugin, onLoaded]);

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