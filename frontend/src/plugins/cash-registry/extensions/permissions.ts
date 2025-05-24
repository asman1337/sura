import { Plugin, PermissionDefinition } from '../../../core/plugins';

// Permissions for Cash Registry module
const cashRegistryPermissions: PermissionDefinition[] = [
  {
    id: 'CASH_REGISTRY:READ',
    resource: 'cash-registry',
    action: 'read',
    description: 'View cash registry entries and balances'
  },
  {
    id: 'CASH_REGISTRY:WRITE',
    resource: 'cash-registry',
    action: 'write',
    description: 'Create and update cash registry entries'
  },
  {
    id: 'CASH_REGISTRY:BALANCE',
    resource: 'cash-registry',
    action: 'balance',
    description: 'Create and verify daily balance sheets'
  },
  {
    id: 'CASH_REGISTRY:ATTEST',
    resource: 'cash-registry',
    action: 'attest',
    description: 'Attest and approve entries and balances'
  },
  {
    id: 'CASH_REGISTRY:ADMIN',
    resource: 'cash-registry',
    action: 'admin',
    description: 'Full administrative access to cash registry'
  }
];

// Permissions extension for Cash Registry plugin
const permissionsExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Cash Registry permissions initialized for plugin:', plugin.id);
    
    // Register each permission as an extension point
    cashRegistryPermissions.forEach(permission => {
      plugin.registerExtensionPoint<PermissionDefinition>(
        'permissions:definitions',
        permission,
        { priority: 10 }
      );
    });
    
    console.log(`Registered ${cashRegistryPermissions.length} permissions for Cash Registry`);
    
    // Optional cleanup function
    return async () => {
      console.log('Cash Registry permissions cleanup');
    };
  }
};

console.log('Cash Registry permissions extension module loaded');
export default permissionsExtension; 