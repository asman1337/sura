import { PluginManifest } from '../../core/plugins';

export const DutyRosterPluginManifest: PluginManifest = {
  id: 'sura-duty-roster-plugin',
  name: 'Duty Roster Management',
  version: '1.0.0',
  description: 'Management of duty rosters, shifts, and assignments for officers',
  author: 'SURA Team',
  
  // Dependencies on other plugins
  dependencies: [], // No dependencies for this example
  
  // Module entry points
  entryPoints: {
    routes: () => import('./routes.tsx'),
    store: () => import('./store'),
    services: () => import('./services'),
    navigation: () => import('./extensions/navigation'),
    dashboardWidgets: () => import('./extensions/widgets'),
    permissions: () => import('./extensions/permissions'),
  },
  
  // Activation conditions
  requiredPermissions: ['DUTY_ROSTER:READ'],
  
  // Integration settings
  settings: {
    allowMultipleInstances: false,
    loadPriority: 10,
    autoEnable: true // Auto-enable for development
  }
}; 