import { PluginManifest } from '../../core/plugins';

export const CashRegistryPluginManifest: PluginManifest = {
  id: 'sura-cash-registry-plugin',
  name: 'Cash Registry Management',
  version: '1.0.0',
  description: 'Management of police station cash transactions and daily balances',
  author: 'SURA Team',
  
  // Dependencies on other plugins
  dependencies: [], // No dependencies for this plugin
  
  // Module entry points
  entryPoints: {
    routes: () => import('./routes.tsx'),
    store: () => import('./store'),
    services: () => import('./services'),
    navigation: () => import('./extensions/navigation'),
    permissions: () => import('./extensions/permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['CASH_REGISTRY:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 20, // Higher priority than Malkhana (10)
    autoEnable: true // Auto-enable for development
  }
}; 