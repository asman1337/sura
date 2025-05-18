import { PluginManifest } from '../../core/plugins';

export const MalkhanaPluginManifest: PluginManifest = {
  id: 'sura-malkhana-plugin',
  name: 'Malkhana Management',
  version: '1.0.0',
  description: 'Management of evidence items and case property',
  author: 'SURA Team',
  
  // Dependencies on other plugins
  dependencies: [], // No dependencies for this example
  
  // Module entry points
  entryPoints: {
    routes: () => import('./routes'),
    store: () => import('./store'),
    services: () => import('./services'),
    navigation: () => import('./extensions/navigation'),
    dashboardWidgets: () => import('./extensions/widgets.tsx'),
    permissions: () => import('./extensions/permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['MALKHANA:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 10,
    autoEnable: true // Auto-enable for development
  }
}; 