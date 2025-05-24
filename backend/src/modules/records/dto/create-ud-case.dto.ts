import { IsString, IsUUID, MaxLength, IsISO8601, IsOptional, IsEnum, ValidateNested, IsObject, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecordDto, RecordType } from './create-record.dto';

enum InvestigationStatus {
  PENDING = 'pending',
  INVESTIGATION = 'investigation',
  CLOSED = 'closed'
}

enum IdentificationStatus {
  IDENTIFIED = 'identified',
  UNIDENTIFIED = 'unidentified',
  PARTIAL = 'partial'
}

export class CreateUDCaseDto extends CreateRecordDto {
  @IsString()
  @MaxLength(20)
  caseNumber: string;
  
  @IsISO8601()
  dateOfOccurrence: string;
  
  @IsString()
  @MaxLength(150)
  @IsOptional()
  deceasedName?: string;
  
  @IsString()
  @MaxLength(500)
  @IsOptional()
  deceasedAddress?: string;
  
  @IsEnum(IdentificationStatus)
  @IsOptional()
  identificationStatus?: IdentificationStatus;
  
  @IsString()
  @MaxLength(150)
  informantName: string;
  
  @IsString()
  @MaxLength(500)
  informantAddress: string;
  
  @IsString()
  @MaxLength(15)
  @IsOptional()
  informantContact?: string;
  
  @IsString()
  @MaxLength(100)
  @IsOptional()
  informantRelation?: string;
  
  @IsString()
  @MaxLength(500)
  apparentCauseOfDeath: string;
  
  @IsString()
  @MaxLength(255)
  location: string;
  
  @IsUUID()
  assignedOfficerId: string;
  
  @IsISO8601()
  @IsOptional()
  postMortemDate?: string;
  
  @IsString()
  @MaxLength(100)
  @IsOptional()
  postMortemDoctor?: string;
  
  @IsString()
  @MaxLength(255)
  @IsOptional()
  postMortemHospital?: string;
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];
  
  @IsEnum(InvestigationStatus)
  @IsOptional()
  investigationStatus?: InvestigationStatus;
  
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;
  
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  additionalDetails?: Record<string, any>;
  
  constructor() {
    super();
    this.type = RecordType.UD_CASE;
  }
} 