import { Plugin, NavigationItem } from '../../../core/plugins';

// Placeholder for navigation extension points
const navigationExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana navigation initialized for plugin:', plugin.id);
    
    // Check if this navigation item is already registered
    const existingNavItems = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    const navPath = '/malkhana';
    
    const hasExistingNavItem = existingNavItems.some(
      item => item.data.path === navPath
    );
    
    if (hasExistingNavItem) {
      console.log(`Navigation item for path "${navPath}" already registered for plugin ${plugin.id}, skipping registration`);
      return;
    }
    
    // Register a navigation item for the plugin
    const extensionId = plugin.registerExtensionPoint<NavigationItem>(
      'navigation:main',
      {
        id: 'malkhana-main',
        path: navPath,
        title: 'Malkhana',
        // We'll use the icon name and let the SidebarLayout handle rendering
        icon: 'Inventory',
        badgeCount: 0
      },
      { priority: 20 }
    );
    
    console.log('Malkhana navigation registered with ID:', extensionId);
    
    // Check if the extension was registered successfully
    const extensions = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    console.log('Current navigation extensions for plugin:', extensions);
    
    // Optional cleanup function
    return async () => {
      console.log('Malkhana navigation cleanup');
    };
  }
};

console.log('Navigation extension module loaded');
export default navigationExtension; 