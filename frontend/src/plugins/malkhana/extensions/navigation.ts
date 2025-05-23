import { Plugin, NavigationItem } from '../../../core/plugins';

// Placeholder for navigation extension points
const navigationExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana navigation initialized for plugin:', plugin.id);
    
    // Check if this navigation item is already registered
    const existingNavItems = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    console.log(`Found ${existingNavItems.length} existing navigation items`);
    
    const navPath = '/malkhana';
    const navId = 'malkhana-main';
    
    // Check if navItem with this ID or path already exists
    const hasNavItem = existingNavItems.some(
      item => (item.data.id === navId || item.data.path === navPath)
    );
    
    if (hasNavItem) {
      console.log(`Navigation item for path "${navPath}" already registered for plugin ${plugin.id}, skipping registration`);
      return;
    }
    
    // Register a navigation item for the plugin
    console.log(`Registering navigation item for path "${navPath}" for plugin ${plugin.id}`);
    const extensionId = plugin.registerExtensionPoint<NavigationItem>(
      'navigation:main',
      {
        id: navId,
        path: navPath,
        title: 'Malkhana',
        group: 'management',
        // We'll use the icon name and let the SidebarLayout handle rendering
        icon: 'Inventory',
        badgeCount: 0
      },
      { priority: 20 }
    );
    
    console.log('Malkhana navigation registered with ID:', extensionId);
    
    // Optional cleanup function
    return async () => {
      console.log('Malkhana navigation cleanup');
    };
  }
};

console.log('Navigation extension module loaded');
export default navigationExtension; 