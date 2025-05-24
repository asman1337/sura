import { PartialType } from '@nestjs/mapped-types';
import { CreateCashEntryDto } from './create-cash-entry.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateCashEntryDto extends PartialType(CreateCashEntryDto) {
  @IsUUID()
  @IsOptional()
  attestedById?: string;

  @IsBoolean()
  @IsOptional()
  isReconciled?: boolean;
} 