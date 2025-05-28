import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { AssignmentType } from '../entities/duty-assignment.entity';

export class CreateDutyAssignmentDto {
  @IsNotEmpty()
  @IsUUID()
  dutyRosterId: string;

  @IsNotEmpty()
  @IsUUID()
  officerId: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsUUID()
  shiftId: string;

  @IsOptional()
  @IsEnum(AssignmentType)
  assignmentType?: AssignmentType;

  @IsOptional()
  @IsString()
  notes?: string;
} 