import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArrestRecordPart } from '../entities/arrest-record.entity';

export class CreateArrestRecordDto {
  @IsEnum(['part1', 'part2'])
  partType: ArrestRecordPart;

  // Accused Person Details
  @IsString()
  @MaxLength(200)
  accusedName: string;

  @IsString()
  accusedAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  accusedPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accusedPCN?: string;

  // Arrest Details
  @IsDateString()
  dateOfArrest: string;

  @IsString()
  @MaxLength(200)
  arrestingOfficerName: string;

  @IsOptional()
  @IsDateString()
  dateForwardedToCourt?: string;

  // Court Details
  @IsOptional()
  @IsString()
  @MaxLength(200)
  courtName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  courtAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  judgeNameOrCourtNumber?: string;

  // Case Reference
  @IsOptional()
  @IsString()
  @MaxLength(100)
  caseReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  trialResult?: string;

  // Criminal Identification Fields (mainly for Part 1)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(150)
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsString()
  identifyingMarks?: string;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  eyeColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  hairColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  complexion?: string;

  @IsOptional()
  @IsString()
  otherPhysicalFeatures?: string;

  // Photo attachments
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  // Additional fields
  @IsOptional()
  @IsString()
  arrestCircumstances?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  arrestLocation?: string;

  @IsDateString()
  recordDate: string;

  @IsOptional()
  @IsBoolean()
  isIdentificationRequired?: boolean;

  // Base record fields
  @IsString()
  unitId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
