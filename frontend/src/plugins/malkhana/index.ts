import { MalkhanaPluginManifest } from './manifest';
import { useMalkhanaApi } from './hooks';
import { MalkhanaDashboard, ItemDetail } from './components';
import { setGlobalApiInstance, getMalkhanaService } from './services';

/**
 * Malkhana Plugin Entry Point
 */
export default {
  manifest: MalkhanaPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('Malkhana plugin loaded - using real API data only');
  },
  
  onEnable: async () => {
    console.log('Malkhana plugin enabled - all data is realtime without caching');
  },
  
  onDisable: async () => {
    console.log('Malkhana plugin disabled');
    // Clean up any listeners, etc.
  },
};

// Export hooks and utilities for use in other parts of the application
export {
  useMalkhanaApi,
  MalkhanaDashboard,
  ItemDetail,
  setGlobalApiInstance,
  getMalkhanaService
}; 