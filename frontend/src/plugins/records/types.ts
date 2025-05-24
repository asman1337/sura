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
  assignedOfficerId: string;
  assignedOfficer?: Officer;
  postMortemDate?: string;
  postMortemDoctor?: string;
  postMortemHospital?: string;
  photoUrls?: string[];
  investigationStatus?: 'pending' | 'investigation' | 'closed';
  description?: string;
  additionalDetails?: { [key: string]: any };
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

// Generic Record Type
export type RecordType = 'ud_case' | 'stolen_property' | 'general_diary' | 'fir' | 'arrest_memo';

// Union type for all record types
export type RecordData = UDCaseRecord | StolenPropertyRecord;

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
  assignedOfficerId: string;
  postMortemDate?: string;
  postMortemDoctor?: string;
  postMortemHospital?: string;
  photoUrls?: string[];
  investigationStatus?: 'pending' | 'investigation' | 'closed';
  description?: string;
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

// Creation type union
export type CreateRecord = CreateUDCase | CreateStolenProperty; 