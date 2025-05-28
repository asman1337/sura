import { IsNotEmpty, IsString, IsOptional, IsArray, IsUUID, IsEnum, IsPhoneNumber } from 'class-validator';
import { PropertyNature } from '../entities/malkhana-item.entity';

export class CreateMalkhanaItemDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;
  
  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsOptional()
  @IsString()
  prNumber?: string;

  @IsOptional()
  @IsString()
  gdeNumber?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(PropertyNature)
  propertyNature?: PropertyNature;
  
  @IsNotEmpty()
  dateReceived: Date;
  
  @IsNotEmpty()
  @IsString()
  receivedFrom: string;

  @IsOptional()
  @IsString()
  receivedFromAddress?: string;

  @IsOptional()
  @IsString()
  investigatingOfficerName?: string;

  @IsOptional()
  @IsString()
  investigatingOfficerRank?: string;

  @IsOptional()
  @IsString()
  investigatingOfficerPhone?: string;

  @IsOptional()
  @IsString()
  investigatingOfficerUnit?: string;
  
  @IsNotEmpty()
  @IsString()
  condition: string;
  
  @IsOptional()
  @IsString()
  notes?: string;
  
  @IsOptional()
  @IsArray()
  photos?: string[];
  
  @IsOptional()
  @IsString()
  shelfId?: string;
} 