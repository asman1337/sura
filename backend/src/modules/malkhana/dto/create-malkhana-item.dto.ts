import { IsNotEmpty, IsString, IsOptional, IsArray, IsUUID, IsEnum, IsPhoneNumber, IsNumber, IsPositive } from 'class-validator';
import { PropertyNature, RegistryType } from '../entities/malkhana-item.entity';

export class CreateMalkhanaItemDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;
  @IsOptional()
  @IsString()
  caseNumber?: string;

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
  
  @IsOptional()
  @IsEnum(RegistryType)
  registryType?: RegistryType;

  // For Red Ink items - manual entry of mother number and year
  @IsOptional()
  @IsNumber()
  @IsPositive()
  motherNumber?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  registryYear?: number;
}