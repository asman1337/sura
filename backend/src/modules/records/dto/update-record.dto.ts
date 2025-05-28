import { IsEnum, IsUUID, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';
import { RecordStatus } from './create-record.dto';

export class UpdateRecordDto {
  @IsEnum(RecordStatus)
  @IsOptional()
  status?: RecordStatus;
  
  @IsUUID()
  @IsOptional()
  unitId?: string;
  
  @IsUUID()
  @IsOptional()
  lastModifiedById?: string;
  
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  remarks?: string;
  
  @IsString()
  @IsOptional()
  notes?: string;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 