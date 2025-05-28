import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateShelfDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsString()
  location: string;
  
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;
} 