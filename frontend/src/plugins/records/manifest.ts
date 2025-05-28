import { PluginManifest } from '../../core/plugins';

export const RecordsPluginManifest: PluginManifest = {
  id: 'sura-records-plugin',
  name: 'Police Records',
  version: '1.0.0',
  description: 'Management of various police department records and forms',
  author: 'SURA Team',
  
  // Dependencies on other plugins
  dependencies: [], // No dependencies for now
  
  // Module entry points
  entryPoints: {
    routes: () => import('./routes.tsx'),
    store: () => import('./store'),
    services: () => import('./services'),
    navigation: () => import('./extensions/navigation'),
    dashboardWidgets: () => import('./extensions/widgets.tsx'),
    permissions: () => import('./extensions/permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['RECORDS:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 15, // After malkhana (which is 10)
    autoEnable: true // Auto-enable for development
  }
}; 