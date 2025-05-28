import { Plugin } from '../../core/plugins';
import { DutyRosterRepository } from './repositories/duty-roster-repository';
import { DutyShiftRepository } from './repositories/duty-shift-repository';
import { DutyAssignmentRepository } from './repositories/duty-assignment-repository';
import { registerRepositoryExtensions } from './extensions';

// Initialize repositories and services
const services = {
  initialize: (plugin: Plugin) => {
    console.log('🚀 Initializing duty roster services for plugin:', plugin.id);
    
    // Get data services from core plugin extension points
    console.log('🔍 Looking for core:dataServices extension point');
    const dataServicesExt = plugin.getExtensionPoints('core:dataServices');
    console.log('🔍 Data services extension points found:', dataServicesExt?.length || 0);
    
    if (!dataServicesExt || dataServicesExt.length === 0) {
      console.error('❌ Core data services not found');
      return;
    }
    
    // Get data services - since we now expect the extension point to directly
    // contain the data services (not wrapped in a data property)
    const dataServices = dataServicesExt[0] as any;
    console.log('🔍 Data services retrieved:', dataServices ? 'yes' : 'no');
    
    if (!dataServices) {
      console.error('❌ Core data services not found');
      return;
    }
    
    console.log('🔍 Available data services:', Object.keys(dataServices));
    
    // Create repositories
    console.log('🔧 Creating roster repository');
    const rosterRepository = new DutyRosterRepository(
      dataServices.api,
      dataServices.cache,
      dataServices.sync,
      dataServices.storage
    );
    
    console.log('🔧 Creating shift repository');
    const shiftRepository = new DutyShiftRepository(
      dataServices.api,
      dataServices.cache,
      dataServices.sync,
      dataServices.storage
    );
    
    console.log('🔧 Creating assignment repository');
    const assignmentRepository = new DutyAssignmentRepository(
      dataServices.api,
      dataServices.cache,
      dataServices.sync,
      dataServices.storage
    );
    
    // Register repositories as extension points
    console.log('🔧 Registering repository extension points');
    registerRepositoryExtensions(
      plugin,
      rosterRepository,
      shiftRepository,
      assignmentRepository
    );
    
    console.log('✅ Duty roster services initialization complete');
    
    return async () => {
      console.log('🧹 Cleaning up duty roster services');
    };
  }
};

export default services; 