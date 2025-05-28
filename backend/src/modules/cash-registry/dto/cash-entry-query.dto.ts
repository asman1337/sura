import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/cash-registry-entry.entity';

export class CashEntryQueryDto {
  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsOptional()
  caseReference?: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;
} 