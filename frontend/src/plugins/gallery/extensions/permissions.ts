import { Plugin, PermissionDefinition } from '../../../core/plugins';

// Permissions extension for Gallery plugin
export default {
  initialize: (plugin: Plugin) => {
    console.log('Gallery permissions initialized');
    
    // Define plugin permissions
    const permissions: PermissionDefinition[] = [
      {
        id: 'gallery:read',
        resource: 'GALLERY',
        action: 'READ',
        description: 'View gallery items'
      },
      {
        id: 'gallery:create',
        resource: 'GALLERY',
        action: 'CREATE',
        description: 'Upload new gallery items'
      },
      {
        id: 'gallery:update',
        resource: 'GALLERY',
        action: 'UPDATE',
        description: 'Update existing gallery items'
      },
      {
        id: 'gallery:delete',
        resource: 'GALLERY',
        action: 'DELETE',
        description: 'Delete gallery items'
      }
    ];
    
    // Register each permission
    permissions.forEach(permission => {
      plugin.registerExtensionPoint('permissions:definition', permission);
    });
    
    console.log(`Gallery registered ${permissions.length} permissions`);
    
    // Optional cleanup function
    return async () => {
      console.log('Gallery permissions cleanup');
    };
  }
};
