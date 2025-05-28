import React from 'react';
import { Plugin, DashboardWidget } from '../../../core/plugins';

// Placeholder widget components - will be implemented in the components directory
const UpcomingDutiesWidget = React.lazy(() => import('../components/widgets/UpcomingDutiesWidget'));
const OfficerCoverageWidget = React.lazy(() => import('../components/widgets/OfficerCoverageWidget'));

/**
 * Widget extension for duty roster plugin
 */
const widgetsExtension = {
  initialize: (plugin: Plugin) => {
    console.log('Registering duty roster dashboard widgets');
    
    // Register the upcoming duties widget
    plugin.registerExtensionPoint<DashboardWidget>(
      'dashboard:widgets',
      {
        component: UpcomingDutiesWidget,
        width: 6,
        height: 4,
        title: 'Upcoming Duties'
      },
      { priority: 20 }
    );
    
    // Register the officer coverage widget
    plugin.registerExtensionPoint<DashboardWidget>(
      'dashboard:widgets',
      {
        component: OfficerCoverageWidget,
        width: 6,
        height: 4,
        title: 'Officer Coverage'
      },
      { priority: 30 }
    );
    
    return async () => {
      console.log('Cleaning up duty roster dashboard widgets');
    };
  }
};

export default widgetsExtension; 