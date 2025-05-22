import { Plugin, NavigationItem } from '../../../core/plugins';

/**
 * Navigation extension for duty roster plugin
 */
const navigationExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Duty Roster navigation initialized for plugin:', plugin.id);
    
    // Check if this navigation item is already registered
    const existingNavItems = plugin.getExtensionPoints<NavigationItem>('navigation:main');
    const navPath = '/duty-roster';
    
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
        id: 'duty-roster-main',
        path: navPath,
        title: 'Duty Roster',
        // We'll use the icon name and let the SidebarLayout handle rendering
        icon: 'EventNote',
        badgeCount: 0,
        group: 'management'
      },
      { priority: 30 }
    );
    
    console.log('Duty Roster navigation registered with ID:', extensionId);
    
    // Optional cleanup function
    return async () => {
      console.log('Duty Roster navigation cleanup');
      // Any cleanup logic here
    };
  }
};

export default navigationExtension; 