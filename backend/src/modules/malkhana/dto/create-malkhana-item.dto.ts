import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateMalkhanaItemDto {
  @IsOptional()
  @IsString()
  caseNumber?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsNotEmpty()
  @IsString()
  category: string;
  
  @IsNotEmpty()
  dateReceived: Date;
  
  @IsNotEmpty()
  @IsString()
  receivedFrom: string;
  
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