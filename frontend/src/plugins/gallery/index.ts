import { GalleryPluginManifest } from './manifest';

/**
 * Gallery Plugin Entry Point
 */
export default {
  manifest: GalleryPluginManifest,
  
  // Lifecycle hooks
  onLoad: async () => {
    console.log('📸 Gallery plugin loaded');
  },
  
  onEnable: async () => {
    console.log('✅ Gallery plugin enabled');
  },
  
  onDisable: async () => {
    console.log('❌ Gallery plugin disabled');
    // Clean up any listeners, etc.
  },
};
