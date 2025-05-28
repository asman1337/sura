import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DenominationDetailsDto } from './create-cash-entry.dto';

export class CreateDailyBalanceDto {
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  balanceDate: Date;

  @IsNumber()
  @IsNotEmpty()
  openingBalance: number;

  @ValidateNested()
  @Type(() => DenominationDetailsDto)
  closingDenominationDetails: DenominationDetailsDto;

  @IsBoolean()
  @IsOptional()
  isBalanced?: boolean = true;

  @IsString()
  @IsOptional()
  discrepancyNotes?: string;
}

export class VerifyDailyBalanceDto {
  @IsUUID()
  @IsNotEmpty()
  verifiedById: string;

  @IsBoolean()
  @IsNotEmpty()
  isBalanced: boolean;

  @IsString()
  @IsOptional()
  discrepancyNotes?: string;
}

export class DailyBalanceResponseDto {
  id: string;
  balanceDate: Date;
  openingBalance: number;
  receiptsTotal: number;
  disbursementsTotal: number;
  closingBalance: number;
  closingDenominationDetails: any;
  isBalanced: boolean;
  verifiedBy: any;
  verifiedAt: Date;
  createdAt: Date;
} 