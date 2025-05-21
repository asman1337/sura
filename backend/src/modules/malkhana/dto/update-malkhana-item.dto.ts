import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { MalkhanaItemStatus } from '../entities/malkhana-item.entity';

export class UpdateMalkhanaItemDto {
  @IsOptional()
  @IsString()
  caseNumber?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  category?: string;
  
  @IsOptional()
  dateReceived?: Date;
  
  @IsOptional()
  @IsString()
  receivedFrom?: string;
  
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