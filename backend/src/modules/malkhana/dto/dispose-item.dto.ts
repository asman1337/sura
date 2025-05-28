import { IsNotEmpty, IsString } from 'class-validator';

export class DisposeItemDto {
  @IsNotEmpty()
  disposalDate: Date;
  
  @IsNotEmpty()
  @IsString()
  disposalReason: string;
  
  @IsNotEmpty()
  @IsString()
  disposalApprovedBy: string;
} 