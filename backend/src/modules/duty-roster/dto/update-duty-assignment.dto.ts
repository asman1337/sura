import { PartialType } from '@nestjs/swagger';
import { CreateDutyAssignmentDto } from './create-duty-assignment.dto';

export class UpdateDutyAssignmentDto extends PartialType(CreateDutyAssignmentDto) {} 