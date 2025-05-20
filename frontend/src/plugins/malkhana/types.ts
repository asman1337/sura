/**
 * Malkhana Module Types
 */

// Status of a Malkhana item
export type MalkhanaItemStatus = 'ACTIVE' | 'DISPOSED' | 'TRANSFERRED' | 'RELEASED';

// Type of registry (Black Ink = current year, Red Ink = historical)
export type RegistryType = 'BLACK_INK' | 'RED_INK';

// Historical Red Ink ID record
export interface RedInkHistoryEntry {
  year: number;
  redInkId: number;
}

// Shelf information for organizing items
export interface ShelfInfo {
  id: string;
  name: string;
  location: string;
  category?: string;
}

// Base interface for a Malkhana item
export interface MalkhanaItem {
  id: string;
  // The current registry number (changes yearly for Red Ink items)
  registryNumber: number;
  // The permanent mother number that never changes (format: YYYY-NNNNN)
  motherNumber: string;
  caseNumber: string;
  description: string;
  category: string;
  dateReceived: string;
  receivedFrom: string;
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
  shelfLocation?: string;
  // QR code for the item
  qrCodeUrl?: string;
  // History of red ink IDs for this item
  redInkHistory?: RedInkHistoryEntry[];
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

// Interface for Malkhana Dashboard stats
export interface MalkhanaStats {
  totalItems: number;
  blackInkItems: number;
  redInkItems: number;
  disposedItems: number;
  recentlyAddedItems: number;
}

// Interface for shelf management
export interface ShelfRegistry {
  shelves: ShelfInfo[];
} 