/**
 * Types for the Records plugin
 */

// Base Record interface
export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: RecordStatus;
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
  description: string;
  location: string;
  assignedOfficer: string;
  status: RecordStatus;
  remarks?: string;
}

// Stolen Property Record
export interface StolenPropertyRecord extends BaseRecord {
  type: 'stolen_property';
  propertyId: string;
  propertyType: string;
  description: string;
  estimatedValue: number;
  dateOfTheft: string;
  location: string;
  ownerName?: string;
  ownerContact?: string;
  status: RecordStatus;
  linkedCaseNumber?: string;
}

// Generic Record Type
export type RecordType = 'ud_case' | 'stolen_property' | 'general_diary' | 'fir' | 'arrest_memo';

// Union type for all record types
export type Record = UDCaseRecord | StolenPropertyRecord;

// Record form settings
export interface RecordFormConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: RecordType;
  fields: FieldConfig[];
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