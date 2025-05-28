import { ApiClient } from '../../core/data/api-client';
import {
  CashRegistryEntry,
  CashRegistryDailyBalance,
  CashRegistryStats,
  CreateCashEntryDto,
  UpdateCashEntryDto,
  CreateDailyBalanceDto,
  VerifyDailyBalanceDto,
  TransactionType,
  CashEntryQueryParams
} from './types';

/**
 * Cash Registry API Service
 */
export class CashRegistryService {
  private readonly baseUrl = '/cash-registry';
  private readonly api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  // Cash Entry endpoints

  /**
   * Get all cash registry entries with optional filters
   */
  async getAllEntries(params?: CashEntryQueryParams): Promise<CashRegistryEntry[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.transactionType) {
        queryParams.append('transactionType', params.transactionType);
      }
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate.toISOString());
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate.toISOString());
      }
      
      if (params.caseReference) {
        queryParams.append('caseReference', params.caseReference);
      }
      
      if (params.documentNumber) {
        queryParams.append('documentNumber', params.documentNumber);
      }
    }
    
    const url = `${this.baseUrl}/entries?${queryParams.toString()}`;
    return this.api.get<CashRegistryEntry[]>(url);
  }

  /**
   * Get a cash registry entry by ID
   */
  async getEntryById(id: string): Promise<CashRegistryEntry> {
    return this.api.get<CashRegistryEntry>(`${this.baseUrl}/entries/${id}`);
  }

  /**
   * Create a new cash registry entry
   */
  async createEntry(entry: CreateCashEntryDto): Promise<CashRegistryEntry> {
    return this.api.post<CashRegistryEntry>(`${this.baseUrl}/entries`, entry);
  }

  /**
   * Update a cash registry entry
   */
  async updateEntry(id: string, updates: UpdateCashEntryDto): Promise<CashRegistryEntry> {
    return this.api.put<CashRegistryEntry>(`${this.baseUrl}/entries/${id}`, updates);
  }

  /**
   * Generate a new document number for a transaction
   */
  async generateDocumentNumber(type: TransactionType): Promise<string> {
    const response = await this.api.get<{ documentNumber: string }>(`${this.baseUrl}/generate-document-number?type=${type}`);
    return response.documentNumber;
  }

  // Daily Balance endpoints

  /**
   * Get all daily balance records
   */
  async getAllBalances(limit?: number): Promise<CashRegistryDailyBalance[]> {
    const url = limit 
      ? `${this.baseUrl}/daily-balance?limit=${limit}` 
      : `${this.baseUrl}/daily-balance`;
    return this.api.get<CashRegistryDailyBalance[]>(url);
  }

  /**
   * Get a daily balance record by ID or date
   */
  async getBalance(idOrDate: string): Promise<CashRegistryDailyBalance> {
    return this.api.get<CashRegistryDailyBalance>(`${this.baseUrl}/daily-balance/${idOrDate}`);
  }

  /**
   * Get a daily balance record for a specific date
   */
  async getBalanceForDate(date: Date): Promise<CashRegistryDailyBalance | null> {
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    try {
      return await this.api.get<CashRegistryDailyBalance>(`${this.baseUrl}/daily-balance/date/${dateString}`);
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new daily balance record
   */
  async createDailyBalance(balance: CreateDailyBalanceDto): Promise<CashRegistryDailyBalance> {
    return this.api.post<CashRegistryDailyBalance>(`${this.baseUrl}/daily-balance`, balance);
  }

  /**
   * Verify a daily balance
   */
  async verifyBalance(id: string, verifyData: VerifyDailyBalanceDto): Promise<CashRegistryDailyBalance> {
    return this.api.put<CashRegistryDailyBalance>(`${this.baseUrl}/daily-balance/${id}/verify`, verifyData);
  }

  // Stats endpoint

  /**
   * Get cash registry statistics
   */
  async getStats(): Promise<CashRegistryStats> {
    return this.api.get<CashRegistryStats>(`${this.baseUrl}/stats`);
  }
}

// Singleton instance
let _instance: CashRegistryService | null = null;

/**
 * Get the Cash Registry service instance
 */
export function getCashRegistryService(api: ApiClient): CashRegistryService {
  if (!_instance) {
    _instance = new CashRegistryService(api);
  }
  return _instance;
}

/**
 * Set a global API instance for testing or specialized scenarios
 */
export function setGlobalApiInstance(api: ApiClient): void {
  _instance = new CashRegistryService(api);
} 