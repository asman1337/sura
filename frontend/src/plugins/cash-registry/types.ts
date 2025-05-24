/**
 * Cash Registry Module Types
 */

// Transaction types
export enum TransactionType {
  RECEIPT = 'RECEIPT',
  DISBURSEMENT = 'DISBURSEMENT'
}

// Sources of cash receipts
export enum CashSource {
  SEIZED = 'SEIZED',
  FROM_ACCUSED = 'FROM_ACCUSED',
  FINES = 'FINES',
  FEES = 'FEES',
  BAIL = 'BAIL',
  OTHER = 'OTHER'
}

// Purpose of cash disbursements
export enum DisbursementPurpose {
  TRAVEL_ALLOWANCE = 'TRAVEL_ALLOWANCE',
  RETURN_TO_OWNER = 'RETURN_TO_OWNER',
  TRANSFER_TO_TREASURY = 'TRANSFER_TO_TREASURY',
  COURT_DEPOSIT = 'COURT_DEPOSIT',
  EXPENSES = 'EXPENSES',
  OTHER = 'OTHER'
}

// Denomination details structure
export interface DenominationDetails {
  notes2000: number;
  notes500: number;
  notes200: number;
  notes100: number;
  notes50: number;
  notes20: number;
  notes10: number;
  coins: number;
}

// Base interface for a Cash Registry Entry
export interface CashRegistryEntry {
  id: string;
  transactionType: TransactionType;
  amount: number;
  
  // Receipt-specific fields
  source?: CashSource;
  
  // Disbursement-specific fields
  purpose?: DisbursementPurpose;
  
  // Common fields
  caseReference?: string;
  documentNumber: string;
  denominationDetails?: DenominationDetails;
  
  // Handler and attestation
  handledById: string;
  handledBy?: { 
    id: string;
    firstName: string;
    lastName: string;
    badgeNumber: string;
  };
  attestedById?: string;
  attestedBy?: { 
    id: string;
    firstName: string;
    lastName: string;
    badgeNumber: string;
  };
  attestedAt?: Date;
  
  notes?: string;
  isReconciled: boolean;
  reconciledAt?: Date;
  
  // Audit information
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Daily Cash Balance record
export interface CashRegistryDailyBalance {
  id: string;
  balanceDate: Date;
  openingBalance: number;
  receiptsTotal: number;
  disbursementsTotal: number;
  closingBalance: number;
  closingDenominationDetails: DenominationDetails;
  
  // Verification
  verifiedById: string;
  verifiedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    badgeNumber: string;
  };
  verifiedAt: Date;
  isBalanced: boolean;
  discrepancyNotes?: string;
  
  // Audit information
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Cash Entry DTO for API requests
export interface CreateCashEntryDto {
  transactionType: TransactionType;
  amount: number;
  source?: CashSource;
  purpose?: DisbursementPurpose;
  caseReference?: string;
  documentNumber: string;
  denominationDetails?: DenominationDetails;
  notes?: string;
  attestedById?: string;
}

// Update Cash Entry DTO for API requests
export interface UpdateCashEntryDto {
  transactionType?: TransactionType;
  amount?: number;
  source?: CashSource;
  purpose?: DisbursementPurpose;
  caseReference?: string;
  documentNumber?: string;
  denominationDetails?: DenominationDetails;
  notes?: string;
  attestedById?: string;
  isReconciled?: boolean;
}

// Create Daily Balance DTO for API requests
export interface CreateDailyBalanceDto {
  balanceDate: Date;
  openingBalance: number;
  closingDenominationDetails: DenominationDetails;
  isBalanced?: boolean;
  discrepancyNotes?: string;
}

// Verify Daily Balance DTO for API requests
export interface VerifyDailyBalanceDto {
  verifiedById: string;
  isBalanced: boolean;
  discrepancyNotes?: string;
}

// Cash Registry Statistics
export interface CashRegistryStats {
  currentBalance: number;
  receiptsToday: number;
  disbursementsToday: number;
  lastClosingBalance?: number;
  lastBalanceDate?: Date;
  isCurrentDayBalanced: boolean;
  isLastDayBalanced: boolean;
}

// Query Parameters for Cash Entries
export interface CashEntryQueryParams {
  transactionType?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  caseReference?: string;
  documentNumber?: string;
} 