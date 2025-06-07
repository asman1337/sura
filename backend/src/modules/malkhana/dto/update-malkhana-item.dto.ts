import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { MalkhanaItemStatus, PropertyNature } from '../entities/malkhana-item.entity';

export class UpdateMalkhanaItemDto {  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsOptional()
  @IsString()
  gdeNumber?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(PropertyNature)
  propertyNature?: PropertyNature;
  
  @IsOptional()
  dateReceived?: Date;
  
  @IsOptional()
  @IsString()
  receivedFrom?: string;

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
  
  @IsOptional()
  @IsString()
  condition?: string;
  
  @IsOptional()
  @IsEnum(MalkhanaItemStatus)
  status?: MalkhanaItemStatus;
  
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