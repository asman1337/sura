import { RecordsPluginManifest } from './manifest';

/**
 * Records Plugin Entry Point
 */
export default {
  manifest: RecordsPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('Records plugin loaded');
  },
  
  onEnable: async () => {
    console.log('Records plugin enabled');
  },
  
  onDisable: async () => {
    console.log('Records plugin disabled');
  },
};

// Export for use in other parts of the application
export * from './types'; 