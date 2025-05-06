import { MalkhanaPluginManifest } from './manifest';

/**
 * Malkhana Plugin Entry Point
 */
export default {
  manifest: MalkhanaPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('Malkhana plugin loaded');
  },
  
  onEnable: async () => {
    console.log('Malkhana plugin enabled');
  },
  
  onDisable: async () => {
    console.log('Malkhana plugin disabled');
    // Clean up any listeners, etc.
  },
}; 