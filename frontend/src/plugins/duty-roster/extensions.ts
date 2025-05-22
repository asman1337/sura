import { Plugin } from '../../core/plugins';
import { DutyRosterRepository } from './repositories/duty-roster-repository';
import { DutyShiftRepository } from './repositories/duty-shift-repository';
import { DutyAssignmentRepository } from './repositories/duty-assignment-repository';

/**
 * Register repository extensions
 * @param plugin The plugin instance
 * @param rosterRepository The DutyRosterRepository instance
 * @param shiftRepository The DutyShiftRepository instance
 * @param assignmentRepository The DutyAssignmentRepository instance
 */
export function registerRepositoryExtensions(
  plugin: Plugin,
  rosterRepository: DutyRosterRepository,
  shiftRepository: DutyShiftRepository,
  assignmentRepository: DutyAssignmentRepository
): void {
  console.log('🔍 Registering duty roster repositories for plugin:', plugin.id);
  
  // Register the duty roster repository extension
  console.log('🔍 Registering rosterRepository extension point');
  plugin.registerExtensionPoint('duty-roster:rosterRepository', rosterRepository);

  // Register the duty shift repository extension
  console.log('🔍 Registering shiftRepository extension point');
  plugin.registerExtensionPoint('duty-roster:shiftRepository', shiftRepository);

  // Register the duty assignment repository extension
  console.log('🔍 Registering assignmentRepository extension point');
  plugin.registerExtensionPoint('duty-roster:assignmentRepository', assignmentRepository);
  
  // Verify registrations
  const rosterExt = plugin.getExtensionPoints('duty-roster:rosterRepository');
  const shiftExt = plugin.getExtensionPoints('duty-roster:shiftRepository');
  const assignExt = plugin.getExtensionPoints('duty-roster:assignmentRepository');
  
  console.log('🔍 Verification after registration:');
  console.log('- Roster repository extensions:', rosterExt?.length || 0);
  console.log('- Shift repository extensions:', shiftExt?.length || 0);
  console.log('- Assignment repository extensions:', assignExt?.length || 0);
} 