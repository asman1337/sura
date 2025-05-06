import React from 'react';
import { Plugin, DashboardWidget } from '../../../core/plugins';

// Simple placeholder widget component
const MalkhanaWidget = () => (
  <div className="malkhana-widget">
    <h3>Malkhana Dashboard</h3>
    <p>Recent activity will appear here</p>
  </div>
);

// Placeholder for dashboard widgets extension points
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana widgets initialized');
    
    // Register a dashboard widget for the plugin
    plugin.registerExtensionPoint<DashboardWidget>(
      'dashboard:widgets',
      {
        component: MalkhanaWidget,
        width: 6, // Half width on desktop
        title: 'Malkhana Items'
      },
      { priority: 10 }
    );
    
    // Optional cleanup function
    return async () => {
      console.log('Malkhana widgets cleanup');
    };
  }
}; 