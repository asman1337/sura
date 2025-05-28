import { BaseRepository } from '../../../core/data/base-repository';
import { ApiClient } from '../../../core/data/api-client';
import { CacheManager } from '../../../core/data/cache-manager';
import { SyncManager } from '../../../core/data/sync-manager';
import { StorageClient } from '../../../core/data/storage-client';
import { DutyShift, CreateDutyShiftDto, UpdateDutyShiftDto } from '../types';
import { createCustomRepositoryHook } from '../../../core/data/repository-hooks';

/**
 * Repository for duty shift operations
 */
export class DutyShiftRepository extends BaseRepository<DutyShift> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient
  ) {
    super(
      '/duty-shifts',
      'duty-shifts',
      api,
      cache,
      sync,
      storage,
      {
        cacheTTL: 15 * 60 * 1000, // 15 minutes
        offlineEnabled: true,
        cacheEnabled: true,
        preferCache: true
      }
    );
  }

  /**
   * Seed default shifts
   */
  async seedDefaultShifts(): Promise<void> {
    await this.api.post<void>(`${this.resourcePath}/seed-defaults`, {});
  }

  /**
   * Create a new shift
   */
  async createShift(data: CreateDutyShiftDto): Promise<DutyShift> {
    return this.api.post<DutyShift>(this.resourcePath, data);
  }

  /**
   * Update an existing shift
   */
  async updateShift(id: string, data: UpdateDutyShiftDto): Promise<DutyShift> {
    return this.api.patch<DutyShift>(`${this.resourcePath}/${id}`, data);
  }

  /**
   * Get shifts by roster ID
   */
  async getByRosterId(rosterId: string): Promise<DutyShift[]> {
    return this.api.get<DutyShift[]>(`${this.resourcePath}`, { params: { rosterId } });
  }
}

/**
 * Custom hook for duty shift operations
 */
export const useDutyShiftRepository = createCustomRepositoryHook<DutyShift>((dataContext) => 
  new DutyShiftRepository(
    dataContext.api,
    dataContext.cache,
    dataContext.sync,
    dataContext.storage
  )
); 