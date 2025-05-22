import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDutyShiftDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
} 