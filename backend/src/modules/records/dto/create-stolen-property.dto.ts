import { IsString, IsNumber, MaxLength, IsISO8601, IsOptional, IsEnum, ValidateNested, IsObject, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecordDto, RecordType } from './create-record.dto';
import { PropertySource } from '../entities/stolen-property.entity';

enum RecoveryStatus {
  REPORTED = 'reported',
  INVESTIGATION = 'investigation',
  RECOVERED = 'recovered',
  CLOSED = 'closed'
}

export class CreateStolenPropertyDto extends CreateRecordDto {
  @IsString()
  @MaxLength(20)
  propertyId: string;
  
  @IsEnum(['stolen', 'intestate', 'unclaimed', 'suspicious', 'exhibits', 'others'])
  @IsOptional()
  propertySource?: PropertySource;
  
  @IsString()
  @MaxLength(50)
  propertyType: string;
  
  @IsString()
  @MaxLength(500)
  description: string;
  
  @IsNumber()
  estimatedValue: number;
  
  @IsString()
  @MaxLength(150)
  foundBy: string;
  
  @IsISO8601()
  dateOfTheft: string;
  
  @IsString()
  @MaxLength(255)
  location: string;
  
  @IsString()
  @MaxLength(100)
  @IsOptional()
  ownerName?: string;
  
  @IsString()
  @MaxLength(20)
  @IsOptional()
  ownerContact?: string;
  
  @IsString()
  @MaxLength(30)
  @IsOptional()
  linkedCaseNumber?: string;
  
  @IsISO8601()
  dateOfReceipt: string;
  
  @IsString()
  @MaxLength(100)
  @IsOptional()
  receivedBy?: string;
  
  @IsEnum(RecoveryStatus)
  @IsOptional()
  recoveryStatus?: RecoveryStatus;
  
  @IsISO8601()
  @IsOptional()
  recoveryDate?: string;
  
  @IsBoolean()
  @IsOptional()
  isSold?: boolean;
  
  @IsNumber()
  @IsOptional()
  soldPrice?: number;
  
  @IsISO8601()
  @IsOptional()
  dateOfRemittance?: string;
  
  @IsString()
  @MaxLength(100)
  @IsOptional()
  disposalMethod?: string;
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];
  
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  additionalDetails?: Record<string, any>;
  
  constructor() {
    super();
    this.type = RecordType.STOLEN_PROPERTY;
  }
} 