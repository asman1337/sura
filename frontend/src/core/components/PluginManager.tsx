import { useState } from 'react';
import { usePlugins } from '../plugins';
import type { Plugin } from '../plugins';

/**
 * Component for managing plugins
 */
export const PluginManager = () => {
  const { registeredPlugins, enabledPlugins, enablePlugin, disablePlugin } = usePlugins();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTogglePlugin = async (plugin: Plugin) => {
    setLoading(plugin.id);
    setError(null);
    
    try {
      const isEnabled = enabledPlugins.some(p => p.id === plugin.id);
      
      if (isEnabled) {
        await disablePlugin(plugin.id);
      } else {
        await enablePlugin(plugin.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(null);
    }
  };

  if (registeredPlugins.length === 0) {
    return <div className="plugin-manager-empty">No plugins registered</div>;
  }

  return (
    <div className="plugin-manager">
      <h2>Plugin Management</h2>
      
      {error && <div className="plugin-manager-error">{error}</div>}
      
      <table className="plugin-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Plugin Name</th>
            <th>Version</th>
            <th>Dependencies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registeredPlugins.map(plugin => {
            const isEnabled = enabledPlugins.some(p => p.id === plugin.id);
            const isLoading = loading === plugin.id;
            
            return (
              <tr key={plugin.id} className={isEnabled ? 'plugin-enabled' : 'plugin-disabled'}>
                <td>
                  <span className={`plugin-status ${isEnabled ? 'status-active' : 'status-inactive'}`}>
                    {isEnabled ? '● Active' : '○ Off'}
                  </span>
                </td>
                <td>
                  <div className="plugin-name">{plugin.manifest.name}</div>
                  <div className="plugin-description">{plugin.manifest.description}</div>
                </td>
                <td>{plugin.manifest.version}</td>
                <td>
                  {plugin.manifest.dependencies.length > 0 
                    ? plugin.manifest.dependencies.join(', ') 
                    : 'None'}
                </td>
                <td>
                  <button 
                    onClick={() => handleTogglePlugin(plugin)}
                    disabled={isLoading}
                    className="plugin-action-button"
                  >
                    {isLoading ? 'Processing...' : isEnabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 