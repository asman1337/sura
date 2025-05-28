import { PartialType } from '@nestjs/mapped-types';
import { CreateDutyRosterDto } from './create-duty-roster.dto';

export class UpdateDutyRosterDto extends PartialType(CreateDutyRosterDto) {} 