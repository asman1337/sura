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
    console.log('Malkhana widgets initialized for plugin:', plugin.id);
    
    // Check if this widget is already registered
    const existingWidgets = plugin.getExtensionPoints<DashboardWidget>('dashboard:widgets');
    const widgetTitle = 'Malkhana Items';
    
    const hasExistingWidget = existingWidgets.some(
      widget => widget.data.title === widgetTitle
    );
    
    if (hasExistingWidget) {
      console.log(`Widget "${widgetTitle}" already registered for plugin ${plugin.id}, skipping registration`);
      return;
    }
    
    // Register a dashboard widget for the plugin
    const widgetId = plugin.registerExtensionPoint<DashboardWidget>(
      'dashboard:widgets',
      {
        component: MalkhanaWidget,
        width: 6, // Half width on desktop
        title: widgetTitle
      },
      { priority: 10 }
    );
    
    console.log(`Registered widget with ID: ${widgetId}`);
    
    // Optional cleanup function
    return async () => {
      console.log('Malkhana widgets cleanup');
    };
  }
}; 