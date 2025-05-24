import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CashSource, DisbursementPurpose, TransactionType } from '../entities/cash-registry-entry.entity';

export class DenominationDetailsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  notes2000: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  notes500: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  notes200: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  notes100: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  notes50: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  notes20: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  notes10: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  coins: number = 0;
}

export class CreateCashEntryDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  transactionType: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  // Receipt-specific fields
  @IsEnum(CashSource)
  @IsOptional()
  source?: CashSource;

  // Disbursement-specific fields
  @IsEnum(DisbursementPurpose)
  @IsOptional()
  purpose?: DisbursementPurpose;

  // Common fields
  @IsString()
  @IsOptional()
  caseReference?: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ValidateNested()
  @Type(() => DenominationDetailsDto)
  @IsOptional()
  denominationDetails?: DenominationDetailsDto;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  attestedById?: string;
} 