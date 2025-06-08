import { IsEnum, IsString, IsOptional, IsBoolean, IsDateString, IsArray, IsObject, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum FormType {
  PART1 = 'part1',
  PART2 = 'part2',
  PART4 = 'part4'
}

export enum ClosedStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export enum RegistryType {
  BLACK_INK = 'BLACK_INK',
  RED_INK = 'RED_INK'
}

export class CourtDetailsDto {
  @IsOptional()
  @IsString()
  courtName?: string;

  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsOptional()
  @IsDateString()
  hearingDate?: string;
}

export class SeniorOfficeDetailsDto {
  @IsOptional()
  @IsString()
  officeName?: string;

  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsOptional()
  @IsString()
  officerName?: string;
}

export class PublicPetitionDetailsDto {
  @IsOptional()
  @IsString()
  petitionerName?: string;

  @IsOptional()
  @IsString()
  petitionNumber?: string;

  @IsOptional()
  @IsString()
  subject?: string;
}

export class CreatePaperDispatchDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsDateString()
  dateOfReceive: string;

  @IsString()
  fromWhom: string;

  @IsOptional()
  @IsString()
  memoNumber?: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  toWhom?: string;

  @IsOptional()
  @IsString()
  caseReference?: string;

  @IsOptional()
  @IsDateString()
  dateFixed?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(ClosedStatus)
  closedStatus?: ClosedStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[];

  @IsOptional()
  @IsBoolean()
  noExpectingReport?: boolean;

  @IsEnum(FormType)
  formType: FormType;

  @IsOptional()
  @IsEnum(RegistryType)
  registryType?: RegistryType;

  @IsOptional()
  @IsString()
  endorsedOfficerName?: string;

  @IsOptional()
  @IsString()
  endorsedOfficerBadgeNumber?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CourtDetailsDto)
  courtDetails?: CourtDetailsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeniorOfficeDetailsDto)
  seniorOfficeDetails?: SeniorOfficeDetailsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PublicPetitionDetailsDto)
  publicPetitionDetails?: PublicPetitionDetailsDto;

  // Base record fields
  @IsString()
  unitId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
