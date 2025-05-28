import { PartialType } from '@nestjs/swagger';
import { CreateDutyShiftDto } from './create-duty-shift.dto';

export class UpdateDutyShiftDto extends PartialType(CreateDutyShiftDto) {} 