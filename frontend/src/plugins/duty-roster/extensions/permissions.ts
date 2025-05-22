import { Plugin, PermissionDefinition } from '../../../core/plugins';

/**
 * Permissions for the duty roster plugin
 */
const DUTY_ROSTER_PERMISSIONS: PermissionDefinition[] = [
  {
    id: 'DUTY_ROSTER:READ',
    resource: 'duty-roster',
    action: 'read',
    description: 'View duty rosters'
  },
  {
    id: 'DUTY_ROSTER:CREATE',
    resource: 'duty-roster',
    action: 'create',
    description: 'Create duty rosters'
  },
  {
    id: 'DUTY_ROSTER:UPDATE',
    resource: 'duty-roster',
    action: 'update',
    description: 'Update duty rosters'
  },
  {
    id: 'DUTY_ROSTER:DELETE',
    resource: 'duty-roster',
    action: 'delete',
    description: 'Delete duty rosters'
  },
  {
    id: 'DUTY_ROSTER:PUBLISH',
    resource: 'duty-roster',
    action: 'publish',
    description: 'Publish duty rosters'
  },
  {
    id: 'DUTY_SHIFT:MANAGE',
    resource: 'duty-shift',
    action: 'manage',
    description: 'Manage duty shifts'
  },
  {
    id: 'DUTY_ASSIGNMENT:MANAGE',
    resource: 'duty-assignment',
    action: 'manage',
    description: 'Manage duty assignments'
  }
];

/**
 * Permissions extension for duty roster plugin
 */
const permissionsExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Registering duty roster permissions');
    
    // Register each permission
    DUTY_ROSTER_PERMISSIONS.forEach(permission => {
      plugin.registerExtensionPoint<PermissionDefinition>(
        'permissions',
        permission,
        { priority: 10 }
      );
    });
    
    return async () => {
      console.log('Cleaning up duty roster permissions');
      // Any cleanup logic here
    };
  }
};

export default permissionsExtension; 