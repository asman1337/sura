import { Plugin, PermissionDefinition } from '../../../core/plugins';

const permissionsExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Records permissions initialized for plugin:', plugin.id);
    
    // Define permissions for the records module
    const permissions: PermissionDefinition[] = [
      {
        id: 'records:read',
        resource: 'records',
        action: 'read',
        description: 'View police records'
      },
      {
        id: 'records:create',
        resource: 'records',
        action: 'create',
        description: 'Create new police records'
      },
      {
        id: 'records:update',
        resource: 'records',
        action: 'update',
        description: 'Update existing police records'
      },
      {
        id: 'records:delete',
        resource: 'records',
        action: 'delete',
        description: 'Delete police records'
      }
    ];
    
    // Register all permissions
    permissions.forEach(permission => {
      plugin.registerExtensionPoint<PermissionDefinition>(
        'permissions:definitions',
        permission
      );
    });
    
    // Optional cleanup function
    return async () => {
      console.log('Records permissions cleanup');
    };
  }
};

export default permissionsExtension; 