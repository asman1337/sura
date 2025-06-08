import { IsEnum, IsUUID, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export enum RecordType {
  UD_CASE = 'ud_case',
  STOLEN_PROPERTY = 'stolen_property',
  GENERAL_DIARY = 'general_diary',
  FIR = 'fir',
  ARREST_MEMO = 'arrest_memo',
  PAPER_DISPATCH = 'paper_dispatch'
}

export enum RecordStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export class CreateRecordDto {
  @IsEnum(RecordType)
  type: RecordType;
  
  @IsEnum(RecordStatus)
  @IsOptional()
  status?: RecordStatus;
  
  @IsUUID()
  unitId: string;
  
  @IsUUID()
  @IsOptional()
  createdById?: string;
  
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