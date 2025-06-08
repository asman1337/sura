/**
 * Types for the Records plugin
 */

// Base Record interface
export interface BaseRecord {
  id: string;
  type: RecordType;
  createdAt: string;
  updatedAt: string;
  createdBy: Officer | string;
  lastModifiedBy?: Officer | string;
  status: RecordStatus;
  unitId: string;
  unit?: Unit;
  remarks?: string;
  notes?: string;
  isActive: boolean;
}

// Officer interface (simplified)
export interface Officer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  badgeNumber: string;
  gender?: string;
  userType?: string;
  profilePhotoUrl?: string;
  rank?: {
    id: string;
    name: string;
    abbreviation: string;
    level: number;
  };
  organization?: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  primaryUnit?: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  department?: {
    id: string;
    name: string;
  } | null;
}

// Unit interface (simplified)
export interface Unit {
  id: string;
  name: string;
  organization?: any;
}

// Record status types
export type RecordStatus = 'active' | 'archived' | 'deleted';

// Statistics interface
export interface RecordsStats {
  totalRecords: number;
  recordsByType: { [key: string]: number };
  recentlyAdded: number;
  archivedRecords: number;
}

// UD Case Record
export interface UDCaseRecord extends BaseRecord {
  type: 'ud_case';
  // Existing fields
  caseNumber: string;
  dateOfOccurrence: string;
  deceasedName?: string;
  deceasedAddress?: string;
  identificationStatus?: 'identified' | 'unidentified' | 'partial';
  informantName: string;
  informantAddress: string;
  informantContact?: string;
  informantRelation?: string;
  apparentCauseOfDeath: string;
  location: string;
  
  // Assigned Officer Information (simple fields)
  assignedOfficerName?: string;
  assignedOfficerBadgeNumber?: string;
  assignedOfficerContact?: string;
  assignedOfficerRank?: string;
  assignedOfficerDepartment?: string;
  
  postMortemDate?: string;
  postMortemDoctor?: string;
  postMortemHospital?: string;
  photoUrls?: string[];
  investigationStatus?: 'pending' | 'investigation' | 'closed';
  description?: string;
  additionalDetails?: { [key: string]: any };
  
  // New fields for sample data compatibility
  serialNumber?: string; // SL NO equivalent
  policeStationCode?: string; // PS code (e.g., "AUSGRAM PS")
  policeStationName?: string; // Full PS name
  
  // Enhanced autopsy/post-mortem information
  autopsyResults?: {
    cause_of_death?: string;
    manner_of_death?: 'natural' | 'accident' | 'suicide' | 'homicide' | 'undetermined';
    findings?: string;
    toxicology_results?: string;
    time_of_death_estimate?: string;
    injuries_description?: string;
  };
  
  // Final form status tracking
  finalFormStatus?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'closed';
  finalFormSubmissionDate?: string;
  finalFormReviewedBy?: string;
  finalFormApprovedBy?: string;
    // Additional deceased information
  deceasedAge?: number;
  deceasedGender?: 'male' | 'female' | 'other' | 'unknown';
  ageCategory?: 'adult' | 'child' | 'unknown';
  deceasedOccupation?: string;
  deceasedNationality?: string;
  deceasedReligion?: string;
  deceasedCaste?: string;
  
  // Identification details (separate from informant)
  identifiedByName?: string;
  identifiedByAddress?: string;
  identifiedByMobile?: string;
  identifiedByRelation?: string;
  
  // Enhanced location details
  exactLocation?: string; // More specific location within the area
  nearestLandmark?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

// Stolen Property Record
export interface StolenPropertyRecord extends BaseRecord {
  type: 'stolen_property';
  propertyId: string;
  propertySource?: 'stolen' | 'intestate' | 'unclaimed' | 'suspicious' | 'exhibits' | 'others';
  propertyType: string;
  description: string;
  estimatedValue: number;
  foundBy: string;
  dateOfTheft: string;
  location: string;
  ownerName?: string;
  ownerContact?: string;
  linkedCaseNumber?: string;
  dateOfReceipt: string;
  receivedBy?: string;
  recoveryStatus?: 'reported' | 'investigation' | 'recovered' | 'closed';
  recoveryDate?: string;
  isSold?: boolean;
  soldPrice?: number;
  dateOfRemittance?: string;
  disposalMethod?: string;
  photoUrls?: string[];
  additionalDetails?: { [key: string]: any };
}

// Paper Dispatch Record
export interface PaperDispatchRecord extends BaseRecord {
  type: 'paper_dispatch';
  serialNumber: string; // SL NO (1/2025) format: count/year
  serialCount: number; // The count part of serial number
  serialYear: number; // The year part of serial number
  dateOfReceive: string; // Date of Receive
  fromWhom: string; // From Whom
  memoNumber?: string; // Memo No. / ORG and DR No, GD, Case no etc
  purpose: string; // Purpose
  toWhom?: string; // To Whom (Endorsed)
  caseReference?: string; // Case Reference
  dateFixed?: string; // Date Fix (Before Remark) [Court expected date]
  remarks?: string; // Remarks
  closedStatus: 'open' | 'closed'; // Closed status
  attachmentUrls?: string[]; // Upload Photo/PDF attach (Receive/Sent)
  noExpectingReport: boolean; // No expecting report flag
  formType: 'part1' | 'part2' | 'part4'; // Form Type (Part 1, 2, 4)
  
  // Registry tracking (like malkhana black/red ink)
  registryType: 'BLACK_INK' | 'RED_INK';
  dateTransitionToRed?: string; // When it moved to red ink
  endorsedOfficerName?: string; // Officer who received the endorsement
  endorsedOfficerBadgeNumber?: string;
  
  // Additional tracking
  isOverdue: boolean; // Auto-calculated based on 7-day rule
  daysElapsed: number; // Days since dateOfReceive
  
  // Form type specific fields
  courtDetails?: {
    courtName?: string;
    caseNumber?: string;
    hearingDate?: string;
  };
  seniorOfficeDetails?: {
    officeName?: string;
    caseNumber?: string;
    officerName?: string;
  };
  publicPetitionDetails?: {
    petitionerName?: string;
    petitionNumber?: string;
    subject?: string;
  };
}

// Generic Record Type
export type RecordType = 'ud_case' | 'stolen_property' | 'general_diary' | 'fir' | 'arrest_memo' | 'paper_dispatch';

// Union type for all record types
export type RecordData = UDCaseRecord | StolenPropertyRecord | PaperDispatchRecord;

// Record form settings
export interface RecordFormConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: RecordType;
  fields: FieldConfig[];
  disabled?: boolean;
}

// Field configuration for dynamic forms
export interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  validation?: {
    pattern?: string;
    message?: string;
    min?: number;
    max?: number;
  };
}

// Record creation types
export interface CreateRecordBase {
  type: RecordType;
  unitId: string;
  status?: RecordStatus;
  remarks?: string;
  notes?: string;
}

export interface CreateUDCase extends CreateRecordBase {
  type: 'ud_case';
  caseNumber: string;
  dateOfOccurrence: string;
  deceasedName?: string;
  deceasedAddress?: string;
  identificationStatus?: 'identified' | 'unidentified' | 'partial';
  informantName: string;
  informantAddress: string;
  informantContact?: string;
  informantRelation?: string;
  apparentCauseOfDeath: string;
  location: string;
  
  // Assigned Officer Information (simple fields)
  assignedOfficerName?: string;
  assignedOfficerBadgeNumber?: string;
  assignedOfficerContact?: string;
  assignedOfficerRank?: string;
  assignedOfficerDepartment?: string;
  
  postMortemDate?: string;
  postMortemDoctor?: string;
  postMortemHospital?: string;
  photoUrls?: string[];
  investigationStatus?: 'pending' | 'investigation' | 'closed';
  description?: string;
  
  // New fields for sample data compatibility
  serialNumber?: string;
  policeStationCode?: string;
  policeStationName?: string;
  autopsyResults?: {
    cause_of_death?: string;
    manner_of_death?: 'natural' | 'accident' | 'suicide' | 'homicide' | 'undetermined';
    findings?: string;
    toxicology_results?: string;
    time_of_death_estimate?: string;
    injuries_description?: string;
  };
  finalFormStatus?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'closed';
  finalFormSubmissionDate?: string;
  finalFormReviewedBy?: string;
  finalFormApprovedBy?: string;  deceasedAge?: number;
  deceasedGender?: 'male' | 'female' | 'other' | 'unknown';
  ageCategory?: 'adult' | 'child' | 'unknown';
  deceasedOccupation?: string;
  deceasedNationality?: string;
  deceasedReligion?: string;
  deceasedCaste?: string;
  
  // Identification details (separate from informant)
  identifiedByName?: string;
  identifiedByAddress?: string;
  identifiedByMobile?: string;
  identifiedByRelation?: string;
  exactLocation?: string;
  nearestLandmark?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

export interface CreateStolenProperty extends CreateRecordBase {
  type: 'stolen_property';
  propertyId: string;
  propertySource?: 'stolen' | 'intestate' | 'unclaimed' | 'suspicious' | 'exhibits' | 'others';
  propertyType: string;
  description: string;
  estimatedValue: number;
  foundBy: string;
  dateOfTheft: string;
  location: string;
  ownerName?: string;
  ownerContact?: string;
  linkedCaseNumber?: string;
  dateOfReceipt: string;
  receivedBy?: string;
  recoveryStatus?: 'reported' | 'investigation' | 'recovered' | 'closed';
  recoveryDate?: string;
  isSold?: boolean;
  soldPrice?: number;
  dateOfRemittance?: string;
  disposalMethod?: string;
  photoUrls?: string[];
  disabled?: boolean;
}

export interface CreatePaperDispatch extends CreateRecordBase {
  type: 'paper_dispatch';
  dateOfReceive: string;
  fromWhom: string;
  memoNumber?: string;
  purpose: string;
  toWhom?: string;
  caseReference?: string;
  dateFixed?: string;
  remarks?: string;
  closedStatus?: 'open' | 'closed';
  attachmentUrls?: string[];
  noExpectingReport?: boolean;
  formType: 'part1' | 'part2' | 'part4';
  registryType?: 'BLACK_INK' | 'RED_INK';
  endorsedOfficerName?: string;
  endorsedOfficerBadgeNumber?: string;
  
  // Form type specific fields
  courtDetails?: {
    courtName?: string;
    caseNumber?: string;
    hearingDate?: string;
  };
  seniorOfficeDetails?: {
    officeName?: string;
    caseNumber?: string;
    officerName?: string;
  };
  publicPetitionDetails?: {
    petitionerName?: string;
    petitionNumber?: string;
    subject?: string;
  };
}

// Creation type union
export type CreateRecord = CreateUDCase | CreateStolenProperty | CreatePaperDispatch;