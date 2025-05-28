import { CashRegistryPluginManifest } from './manifest';
import { getCashRegistryService, setGlobalApiInstance } from './services';
import { useCashRegistry, useDailyBalance } from './hooks';

/**
 * Cash Registry Plugin Entry Point
 */
export default {
  manifest: CashRegistryPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('Cash Registry plugin loaded');
  },
  
  onEnable: async () => {
    console.log('Cash Registry plugin enabled');
  },
  
  onDisable: async () => {
    console.log('Cash Registry plugin disabled');
    // Clean up any listeners, etc.
  },
};

// Export hooks and utilities for use in other parts of the application
export {
  useCashRegistry,
  useDailyBalance,
  getCashRegistryService,
  setGlobalApiInstance
}; 