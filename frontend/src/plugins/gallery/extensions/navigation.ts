import { Plugin, NavigationItem } from '../../../core/plugins';

// Navigation extension for Gallery plugin
const navigationExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Gallery navigation initialized for plugin:', plugin.id);
    
    // Check if this navigation item is already registered
    const existingNavItems = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    console.log(`Found ${existingNavItems.length} existing navigation items`);
    
    const navPath = '/gallery';
    const navId = 'gallery-main';
    
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
        title: 'Gallery',
        group: 'showcase',
        // We'll use the icon name and let the SidebarLayout handle rendering
        icon: 'PhotoLibrary',
        badgeCount: 0
      },
      { priority: 60 }
    );
    
    console.log('Gallery navigation registered with ID:', extensionId);
    
    // Optional cleanup function
    return async () => {
      console.log('Gallery navigation cleanup');
    };
  }
};

console.log('Gallery navigation extension module loaded');
export default navigationExtension;
