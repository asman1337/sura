/**
 * Malkhana Module Types
 */

// Status of a Malkhana item
export type MalkhanaItemStatus = 'ACTIVE' | 'DISPOSED' | 'TRANSFERRED' | 'RELEASED';

// Type of registry (Black Ink = current year, Red Ink = historical)
export type RegistryType = 'BLACK_INK' | 'RED_INK';

// Nature of property
export type PropertyNature = 
  | 'STOLEN_PROPERTY'
  | 'INTESTATE_PROPERTY' 
  | 'UNCLAIMED_PROPERTY'
  | 'SUSPICIOUS_PROPERTY'
  | 'EXHIBITS_AND_OTHER_PROPERTY'
  | 'SAFE_CUSTODY_PROPERTY'
  | 'OTHERS';

// Historical Red Ink ID record
export interface RedInkHistoryEntry {
  id: string;
  year: number;
  redInkId: number;
}

// Shelf information for organizing items
export interface ShelfInfo {
  id: string;
  name: string;
  location: string;
  category?: string;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Base interface for a Malkhana item
export interface MalkhanaItem {
  id: string;
  // The current registry number (changes yearly for Red Ink items)
  registryNumber: number;
  // The permanent mother number that never changes (format: YYYY-NNNNN)
  motherNumber: string;
  caseNumber: string;
  // Additional case-related fields
  prNumber?: string;
  gdeNumber?: string;
  description: string;
  category: string;
  // Nature of property
  propertyNature?: PropertyNature;
  dateReceived: string;
  receivedFrom: string;
  // Address of the person from whom seized
  receivedFromAddress?: string;
  // Investigating Officer details
  investigatingOfficerName?: string;
  investigatingOfficerRank?: string;
  investigatingOfficerPhone?: string;
  investigatingOfficerUnit?: string;
  condition: string;
  status: MalkhanaItemStatus;
  disposalDate?: string;
  disposalReason?: string;
  disposalApprovedBy?: string;
  notes?: string;
  registryType: RegistryType;
  registryYear: number; // Year of registration (e.g., 2024)
  photos?: string[]; // URLs to photos
  // Shelf organization
  shelfId?: string;
  shelf?: ShelfInfo;
  // History of red ink IDs for this item
  redInkHistory?: RedInkHistoryEntry[];
  // Audit information
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Malkhana Item DTO for API requests
export interface CreateMalkhanaItemDto {
  caseNumber?: string;
  prNumber?: string;
  gdeNumber?: string;
  description?: string;
  category: string;
  propertyNature?: PropertyNature;
  dateReceived: Date;
  receivedFrom: string;
  receivedFromAddress?: string;
  investigatingOfficerName?: string;
  investigatingOfficerRank?: string;
  investigatingOfficerPhone?: string;
  investigatingOfficerUnit?: string;
  condition: string;
  notes?: string;
  photos?: string[];
  shelfId?: string;
}

// Update Malkhana Item DTO for API requests
export interface UpdateMalkhanaItemDto {
  caseNumber?: string;
  prNumber?: string;
  gdeNumber?: string;
  description?: string;
  category?: string;
  propertyNature?: PropertyNature;
  dateReceived?: Date;
  receivedFrom?: string;
  receivedFromAddress?: string;
  investigatingOfficerName?: string;
  investigatingOfficerRank?: string;
  investigatingOfficerPhone?: string;
  investigatingOfficerUnit?: string;
  condition?: string;
  status?: MalkhanaItemStatus;
  notes?: string;
  photos?: string[];
  shelfId?: string;
}

// Dispose Item DTO for API requests
export interface DisposeItemDto {
  disposalDate: Date;
  disposalReason: string;
  disposalApprovedBy: string;
}

// Create Shelf DTO for API requests
export interface CreateShelfDto {
  name: string;
  location: string;
  category?: string;
}

// Update Shelf DTO for API requests
export interface UpdateShelfDto {
  name?: string;
  location?: string;
  category?: string;
}

// Assign to Shelf DTO for API requests
export interface AssignToShelfDto {
  shelfId: string;
}

// Year Transition DTO for API requests
export interface YearTransitionDto {
  newYear: number;
}

// Year Transition Response DTO from API
export interface YearTransitionResponseDto {
  transitionedCount: number;
  newRedInkItems: MalkhanaItem[];
}

// Interface for Malkhana Dashboard stats
export interface MalkhanaStats {
  totalItems: number;
  blackInkItems: number;
  redInkItems: number;
  disposedItems: number;
  recentlyAddedItems: number;
  currentYear: number;
}

// Interface for shelf management
export interface ShelfRegistry {
  shelves: ShelfInfo[];
}

// Interface for Black Ink Registry (current year)
export interface BlackInkRegistry {
  year: number;
  items: MalkhanaItem[];
  lastRegistryNumber: number; // Last used registry number
}

// Interface for Red Ink Registry (historical)
export interface RedInkRegistry {
  items: MalkhanaItem[];
  lastRegistryNumber: number; // Last used registry number
} 