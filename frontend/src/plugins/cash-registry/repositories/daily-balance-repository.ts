import { BaseRepository, RepositoryOptions } from '../../../core/data/base-repository';
import { ApiClient } from '../../../core/data/api-client';
import { CacheManager } from '../../../core/data/cache-manager';
import { SyncManager } from '../../../core/data/sync-manager';
import { StorageClient } from '../../../core/data/storage-client';
import { 
  CashRegistryDailyBalance, 
  CreateDailyBalanceDto, 
  VerifyDailyBalanceDto, 
  CashRegistryStats 
} from '../types';
import { getCashRegistryService } from '../services';

/**
 * Repository for cash registry daily balances
 */
export class DailyBalanceRepository extends BaseRepository<CashRegistryDailyBalance> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient,
    options: RepositoryOptions = {}
  ) {
    super(
      '/api/cash-registry/daily-balance',
      'cash-registry-daily-balances',
      api,
      cache,
      sync,
      storage,
      options
    );
  }

  /**
   * Get all daily balance records
   */
  async getBalances(limit?: number): Promise<CashRegistryDailyBalance[]> {
    const service = getCashRegistryService(this.api);
    const balances = await service.getAllBalances(limit);
    
    // Update cache with fetched balances
    if (this.options.cacheEnabled) {
      // Cache individual balances
      for (const balance of balances) {
        await this.cache.set(
          `${this.resourceName}:${balance.id}`, 
          balance, 
          this.options.cacheTTL
        );
      }
      
      // Cache the list with the specific limit
      const cacheKey = `${this.resourceName}:limit:${limit || 'all'}`;
      await this.cache.set(cacheKey, balances, this.options.cacheTTL);
    }
    
    return balances;
  }

  /**
   * Get a specific daily balance by ID or date string
   */
  async getBalance(idOrDate: string): Promise<CashRegistryDailyBalance> {
    // First try from cache
    if (this.options.cacheEnabled) {
      const cached = await this.cache.get<CashRegistryDailyBalance>(`${this.resourceName}:${idOrDate}`);
      if (cached) {
        return cached;
      }
      
      // If it's a date string, try to find by that date format as well
      if (idOrDate.includes('-')) {
        const cachedByDate = await this.cache.get<CashRegistryDailyBalance>(`${this.resourceName}:date:${idOrDate}`);
        if (cachedByDate) {
          return cachedByDate;
        }
      }
    }
    
    // If not found in cache, fetch from API
    const service = getCashRegistryService(this.api);
    const balance = await service.getBalance(idOrDate);
    
    // Cache the result
    if (this.options.cacheEnabled) {
      await this.cache.set(`${this.resourceName}:${balance.id}`, balance, this.options.cacheTTL);
      
      // Also cache by date for easier lookup
      const dateString = new Date(balance.balanceDate).toISOString().split('T')[0];
      await this.cache.set(`${this.resourceName}:date:${dateString}`, balance, this.options.cacheTTL);
    }
    
    return balance;
  }

  /**
   * Get balance for a specific date
   */
  async getBalanceForDate(date: Date): Promise<CashRegistryDailyBalance | null> {
    const dateString = date.toISOString().split('T')[0];
    
    // First try from cache
    if (this.options.cacheEnabled) {
      const cached = await this.cache.get<CashRegistryDailyBalance>(`${this.resourceName}:date:${dateString}`);
      if (cached) {
        return cached;
      }
    }
    
    // If not found in cache, fetch from API
    const service = getCashRegistryService(this.api);
    try {
      const balance = await service.getBalanceForDate(date);
      
      // Cache the result if found
      if (balance && this.options.cacheEnabled) {
        await this.cache.set(`${this.resourceName}:${balance.id}`, balance, this.options.cacheTTL);
        await this.cache.set(`${this.resourceName}:date:${dateString}`, balance, this.options.cacheTTL);
      }
      
      return balance;
    } catch (err) {
      return null;
    }
  }

  /**
   * Create a new daily balance record
   */
  async createBalance(balanceData: CreateDailyBalanceDto): Promise<CashRegistryDailyBalance> {
    const service = getCashRegistryService(this.api);
    const created = await service.createDailyBalance(balanceData);
    
    // Update cache with new balance
    if (this.options.cacheEnabled) {
      await this.cache.set(`${this.resourceName}:${created.id}`, created, this.options.cacheTTL);
      
      // Also cache by date for easier lookup
      const dateString = new Date(created.balanceDate).toISOString().split('T')[0];
      await this.cache.set(`${this.resourceName}:date:${dateString}`, created, this.options.cacheTTL);
      
      // Invalidate lists to force fresh fetch next time
      await this.cache.remove(`${this.resourceName}:all`);
    }
    
    return created;
  }

  /**
   * Verify a daily balance record
   */
  async verifyBalance(id: string, verifyData: VerifyDailyBalanceDto): Promise<CashRegistryDailyBalance> {
    const service = getCashRegistryService(this.api);
    const updated = await service.verifyBalance(id, verifyData);
    
    // Update cache with updated balance
    if (this.options.cacheEnabled) {
      await this.cache.set(`${this.resourceName}:${updated.id}`, updated, this.options.cacheTTL);
      
      // Also update date-based cache
      const dateString = new Date(updated.balanceDate).toISOString().split('T')[0];
      await this.cache.set(`${this.resourceName}:date:${dateString}`, updated, this.options.cacheTTL);
      
      // Invalidate lists to force fresh fetch next time
      await this.cache.remove(`${this.resourceName}:all`);
    }
    
    return updated;
  }

  /**
   * Get cash registry statistics
   */
  async getStats(): Promise<CashRegistryStats> {
    const cacheKey = `${this.resourceName}:stats`;
    
    // Try from cache first
    if (this.options.cacheEnabled) {
      const cached = await this.cache.get<CashRegistryStats>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Fetch from API
    const service = getCashRegistryService(this.api);
    const stats = await service.getStats();
    
    // Cache for a shorter period since stats change frequently
    if (this.options.cacheEnabled) {
      // Cache for 1 minute only
      await this.cache.set(cacheKey, stats, 60 * 1000);
    }
    
    return stats;
  }
}

// Singleton instance
let _repository: DailyBalanceRepository | null = null;

/**
 * Get the Daily Balance repository instance
 */
export function getDailyBalanceRepository(
  api: ApiClient,
  cache: CacheManager,
  sync: SyncManager,
  storage: StorageClient,
  options: RepositoryOptions = {}
): DailyBalanceRepository {
  if (!_repository) {
    _repository = new DailyBalanceRepository(api, cache, sync, storage, options);
  }
  return _repository;
} 