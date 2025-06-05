import { PluginManifest } from '../../core/plugins';

export const GalleryPluginManifest: PluginManifest = {
  id: 'sura-gallery-plugin',
  name: 'Department Gallery',
  version: '1.0.0',
  description: 'Showcase department photos and achievements',
  author: 'SURA Team',
  
  // Dependencies on other plugins
  dependencies: [], // No dependencies for this plugin
  
  // Module entry points
  entryPoints: {
    routes: () => import('./routes'),
    navigation: () => import('./extensions/navigation'),
    permissions: () => import('./extensions/permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['GALLERY:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 5,
    autoEnable: true // Auto-enable for development
  }
};
