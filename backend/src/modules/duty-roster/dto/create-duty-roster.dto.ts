import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DutyRosterStatus } from '../entities/duty-roster.entity';

export class CreateDutyRosterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(DutyRosterStatus)
  status?: DutyRosterStatus;

  @IsOptional()
  @IsString()
  notes?: string;
} 