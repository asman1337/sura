import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { CreatePaperDispatchDto } from './create-paper-dispatch.dto';

export class UpdatePaperDispatchDto extends PartialType(CreatePaperDispatchDto) {
  // Database-managed fields that frontend may send but should be ignored
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsNumber()
  serialCount?: number;

  @IsOptional()
  @IsNumber()
  serialYear?: number;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  lastModifiedById?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'deleted'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  daysElapsed?: number;

  @IsOptional()
  @IsBoolean()
  isOverdue?: boolean;
  @IsOptional()
  @IsDateString()
  dateTransitionToRed?: string;

  // Relationship fields that frontend may send but should be ignored
  @IsOptional()
  unit?: any;

  @IsOptional()
  createdBy?: any;

  @IsOptional()
  lastModifiedBy?: any;
}
