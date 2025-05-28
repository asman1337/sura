import { DutyRosterPluginManifest } from './manifest';

/**
 * Duty Roster Plugin Entry Point
 */
export default {
  manifest: DutyRosterPluginManifest,
  
  // Lifecycle hooks
  onLoad: async (plugin: any) => {
    console.log('🔌 Duty Roster plugin loaded with ID:', plugin.id);
    console.log('📚 Plugin manifest:', plugin.manifest);
  },
  
  onEnable: async (plugin: any) => {
    console.log('✅ Duty Roster plugin enabled with ID:', plugin.id);
    
    // List registered services
    console.log('🔍 Checking if services are properly initialized...');
    
    // After enabling, check for repository extension points
    setTimeout(() => {
      console.log('🔍 Checking for repository extension points after enabling:');
      const rosterExt = plugin.getExtensionPoints('duty-roster:rosterRepository');
      const shiftExt = plugin.getExtensionPoints('duty-roster:shiftRepository');
      const assignExt = plugin.getExtensionPoints('duty-roster:assignmentRepository');
      
      console.log('- Roster repository extensions:', rosterExt?.length || 0);
      console.log('- Shift repository extensions:', shiftExt?.length || 0);
      console.log('- Assignment repository extensions:', assignExt?.length || 0);
    }, 1000);
  },
  
  onDisable: async () => {
    console.log('❌ Duty Roster plugin disabled');
    // Clean up any listeners, etc.
  },
};

// Export hooks and utilities for use in other parts of the application
export {
  // These will be implemented and exported later
}; 