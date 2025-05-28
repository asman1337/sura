import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DutyRoster } from './entities/duty-roster.entity';
import { DutyShift } from './entities/duty-shift.entity';
import { DutyAssignment } from './entities/duty-assignment.entity';
import { DutyRosterService } from './services/duty-roster.service';
import { DutyShiftService } from './services/duty-shift.service';
import { DutyAssignmentService } from './services/duty-assignment.service';
import { DutyRosterController } from './controllers/duty-roster.controller';
import { DutyShiftController } from './controllers/duty-shift.controller';
import { DutyAssignmentController } from './controllers/duty-assignment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DutyRoster, DutyShift, DutyAssignment])
  ],
  controllers: [
    DutyRosterController,
    DutyShiftController,
    DutyAssignmentController
  ],
  providers: [
    DutyRosterService,
    DutyShiftService,
    DutyAssignmentService
  ],
  exports: [
    DutyRosterService,
    DutyShiftService,
    DutyAssignmentService
  ]
})
export class DutyRosterModule {} 