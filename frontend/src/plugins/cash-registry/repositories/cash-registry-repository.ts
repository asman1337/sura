import { BaseRepository, RepositoryOptions } from '../../../core/data/base-repository';
import { ApiClient } from '../../../core/data/api-client';
import { CacheManager } from '../../../core/data/cache-manager';
import { SyncManager } from '../../../core/data/sync-manager';
import { StorageClient } from '../../../core/data/storage-client';
import { 
  CashRegistryEntry, 
  CreateCashEntryDto, 
  UpdateCashEntryDto, 
  TransactionType,
  CashEntryQueryParams 
} from '../types';
import { getCashRegistryService } from '../services';

/**
 * Repository for cash registry entries
 */
export class CashRegistryRepository extends BaseRepository<CashRegistryEntry> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient,
    options: RepositoryOptions = {}
  ) {
    super(
      '/api/cash-registry/entries',
      'cash-registry-entries',
      api,
      cache,
      sync,
      storage,
      options
    );
  }

  /**
   * Get all entries with optional filtering
   */
  async getEntries(params?: CashEntryQueryParams): Promise<CashRegistryEntry[]> {
    const service = getCashRegistryService(this.api);
    const entries = await service.getAllEntries(params);
    
    // Update cache with fetched entries
    if (this.options.cacheEnabled) {
      // Cache individual entries
      for (const entry of entries) {
        await this.cache.set(
          `${this.resourceName}:${entry.id}`, 
          entry, 
          this.options.cacheTTL
        );
      }
      
      // Cache the filtered list
      const cacheKey = `${this.resourceName}:filtered:${JSON.stringify(params || {})}`;
      await this.cache.set(cacheKey, entries, this.options.cacheTTL);
    }
    
    return entries;
  }

  /**
   * Get entries by type (receipts or disbursements)
   */
  async getEntriesByType(type: TransactionType): Promise<CashRegistryEntry[]> {
    return this.getEntries({ transactionType: type });
  }

  /**
   * Get entries for a date range
   */
  async getEntriesForDateRange(startDate: Date, endDate: Date): Promise<CashRegistryEntry[]> {
    return this.getEntries({ startDate, endDate });
  }

  /**
   * Generate a new document number
   */
  async generateDocumentNumber(type: TransactionType): Promise<string> {
    const service = getCashRegistryService(this.api);
    return service.generateDocumentNumber(type);
  }

  /**
   * Create a new cash registry entry
   */
  async createEntry(entry: CreateCashEntryDto): Promise<CashRegistryEntry> {
    const service = getCashRegistryService(this.api);
    const created = await service.createEntry(entry);
    
    // Update cache with new entry
    if (this.options.cacheEnabled) {
      await this.cache.set(
        `${this.resourceName}:${created.id}`, 
        created, 
        this.options.cacheTTL
      );
      
      // Invalidate the "all" cache to force fresh fetch next time
      await this.cache.remove(`${this.resourceName}:all`);
    }
    
    return created;
  }

  /**
   * Update a cash registry entry
   */
  async updateEntry(id: string, updates: UpdateCashEntryDto): Promise<CashRegistryEntry> {
    const service = getCashRegistryService(this.api);
    const updated = await service.updateEntry(id, updates);
    
    // Update cache with updated entry
    if (this.options.cacheEnabled) {
      await this.cache.set(
        `${this.resourceName}:${updated.id}`, 
        updated, 
        this.options.cacheTTL
      );
      
      // Invalidate the "all" cache to force fresh fetch next time
      await this.cache.remove(`${this.resourceName}:all`);
    }
    
    return updated;
  }
}

// Singleton instance for the repository
let _repository: CashRegistryRepository | null = null;

/**
 * Get the Cash Registry repository instance
 */
export function getCashRegistryRepository(
  api: ApiClient,
  cache: CacheManager,
  sync: SyncManager,
  storage: StorageClient,
  options: RepositoryOptions = {}
): CashRegistryRepository {
  if (!_repository) {
    _repository = new CashRegistryRepository(api, cache, sync, storage, options);
  }
  return _repository;
} 