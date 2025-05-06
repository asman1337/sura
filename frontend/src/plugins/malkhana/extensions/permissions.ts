import { Plugin, PermissionDefinition } from '../../../core/plugins';

// Placeholder for permissions extension points
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana permissions initialized');
    
    // Define plugin permissions
    const permissions: PermissionDefinition[] = [
      {
        id: 'malkhana:read',
        resource: 'MALKHANA',
        action: 'READ',
        description: 'View malkhana items'
      },
      {
        id: 'malkhana:create',
        resource: 'MALKHANA',
        action: 'CREATE',
        description: 'Create new malkhana items'
      },
      {
        id: 'malkhana:update',
        resource: 'MALKHANA',
        action: 'UPDATE',
        description: 'Update existing malkhana items'
      },
      {
        id: 'malkhana:delete',
        resource: 'MALKHANA',
        action: 'DELETE',
        description: 'Delete malkhana items'
      }
    ];
    
    // Register each permission
    permissions.forEach(permission => {
      plugin.registerExtensionPoint(
        'permissions:definitions',
        permission,
        { priority: 10 }
      );
    });
    
    // Return permissions for reference elsewhere
    return { permissions };
  }
}; 