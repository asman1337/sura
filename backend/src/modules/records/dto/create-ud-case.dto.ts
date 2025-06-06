import { IsString, IsUUID, MaxLength, IsISO8601, IsOptional, IsEnum, ValidateNested, IsObject, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecordDto, RecordType } from './create-record.dto';

enum InvestigationStatus {
  PENDING = 'pending',
  INVESTIGATION = 'investigation',
  CLOSED = 'closed'
}

enum IdentificationStatus {
  IDENTIFIED = 'identified',
  UNIDENTIFIED = 'unidentified',
  PARTIAL = 'partial'
}

enum FinalFormStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  CLOSED = 'closed'
}

enum DeceasedGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}

enum AgeCategory {
  ADULT = 'adult',
  CHILD = 'child',
  UNKNOWN = 'unknown'
}

enum MannerOfDeath {
  NATURAL = 'natural',
  ACCIDENT = 'accident',
  SUICIDE = 'suicide',
  HOMICIDE = 'homicide',
  UNDETERMINED = 'undetermined'
}

class AutopsyResultsDto {
  @IsString()
  @IsOptional()
  cause_of_death?: string;

  @IsEnum(MannerOfDeath)
  @IsOptional()
  manner_of_death?: MannerOfDeath;

  @IsString()
  @IsOptional()
  findings?: string;

  @IsString()
  @IsOptional()
  toxicology_results?: string;

  @IsString()
  @IsOptional()
  time_of_death_estimate?: string;

  @IsString()
  @IsOptional()
  injuries_description?: string;
}

class CoordinatesDto {
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CreateUDCaseDto extends CreateRecordDto {
  @IsString()
  @MaxLength(100)
  caseNumber: string;
  
  @IsISO8601()
  dateOfOccurrence: string;
  
  @IsString()
  @MaxLength(150)
  @IsOptional()
  deceasedName?: string;
  
  @IsString()
  @MaxLength(500)
  @IsOptional()
  deceasedAddress?: string;
  
  @IsEnum(IdentificationStatus)
  @IsOptional()
  identificationStatus?: IdentificationStatus;
  
  @IsString()
  @MaxLength(150)
  informantName: string;
  
  @IsString()
  @MaxLength(500)
  informantAddress: string;
  
  @IsString()
  @MaxLength(15)
  @IsOptional()
  informantContact?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  informantRelation?: string;
  
  @IsString()
  @MaxLength(500)
  apparentCauseOfDeath: string;
  
  @IsString()
  @MaxLength(255)
  location: string;
  
  // Assigned Officer Information (simple fields)
  @IsString()
  @MaxLength(150)
  @IsOptional()
  assignedOfficerName?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  assignedOfficerBadgeNumber?: string;

  @IsString()
  @MaxLength(15)
  @IsOptional()
  assignedOfficerContact?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  assignedOfficerRank?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  assignedOfficerDepartment?: string;
  
  @IsISO8601()
  @IsOptional()
  postMortemDate?: string;
  
  @IsString()
  @MaxLength(100)
  @IsOptional()
  postMortemDoctor?: string;
  
  @IsString()
  @MaxLength(255)
  @IsOptional()
  postMortemHospital?: string;
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];
  
  @IsEnum(InvestigationStatus)
  @IsOptional()
  investigationStatus?: InvestigationStatus;
  
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;
  
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  additionalDetails?: Record<string, any>;

  // New fields for sample data compatibility
  @IsString()
  @MaxLength(50)
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  policeStationCode?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  policeStationName?: string;

  @ValidateNested()
  @Type(() => AutopsyResultsDto)
  @IsOptional()
  autopsyResults?: AutopsyResultsDto;

  @IsEnum(FinalFormStatus)
  @IsOptional()
  finalFormStatus?: FinalFormStatus;

  @IsISO8601()
  @IsOptional()
  finalFormSubmissionDate?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  finalFormReviewedBy?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  finalFormApprovedBy?: string;

  @IsString()
  @IsOptional()
  deceasedAge?: string;
  @IsEnum(DeceasedGender)
  @IsOptional()
  deceasedGender?: DeceasedGender;

  @IsEnum(AgeCategory)
  @IsOptional()
  ageCategory?: AgeCategory;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  deceasedOccupation?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  deceasedNationality?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  deceasedReligion?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  deceasedCaste?: string;

  // Identification details (separate from informant)
  @IsString()
  @MaxLength(150)
  @IsOptional()
  identifiedByName?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  identifiedByAddress?: string;

  @IsString()
  @MaxLength(15)
  @IsOptional()
  identifiedByMobile?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  identifiedByRelation?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  exactLocation?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  nearestLandmark?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
  
  constructor() {
    super();
    this.type = RecordType.UD_CASE;
  }
}