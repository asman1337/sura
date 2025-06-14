import { PartialType } from '@nestjs/mapped-types';
import { CreateArrestRecordDto } from './create-arrest-record.dto';

export class UpdateArrestRecordDto extends PartialType(CreateArrestRecordDto) {}
