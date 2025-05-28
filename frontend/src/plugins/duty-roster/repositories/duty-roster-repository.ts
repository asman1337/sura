import { BaseRepository } from '../../../core/data/base-repository';
import { ApiClient } from '../../../core/data/api-client';
import { CacheManager } from '../../../core/data/cache-manager';
import { SyncManager } from '../../../core/data/sync-manager';
import { StorageClient } from '../../../core/data/storage-client';
import { 
  DutyRoster, 
  CreateDutyRosterDto, 
  UpdateDutyRosterDto
} from '../types';
import { createCustomRepositoryHook } from '../../../core/data/repository-hooks';

/**
 * Repository for duty roster operations
 */
export class DutyRosterRepository extends BaseRepository<DutyRoster> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient
  ) {
    super(
      '/duty-roster',
      'duty-roster',
      api,
      cache,
      sync,
      storage,
      {
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        offlineEnabled: true,
        cacheEnabled: true,
        preferCache: false
      }
    );
  }

  /**
   * Ensure getById never returns null 
   */
  async getById(id: string): Promise<DutyRoster> {
    const roster = await super.getById(id);
    if (!roster) {
      throw new Error(`Duty roster with ID ${id} not found`);
    }
    return roster;
  }

  /**
   * Publish a duty roster
   */
  async publishRoster(id: string): Promise<DutyRoster> {
    return this.api.post<DutyRoster>(`${this.resourcePath}/${id}/publish`, {});
  }

  /**
   * Create a new duty roster with DTO
   * This overrides the standard create method to handle the DTO properly
   */
  async create(data: CreateDutyRosterDto): Promise<DutyRoster> {
    // Use direct API call to handle the DTO
    return this.api.post<DutyRoster>(this.resourcePath, data);
  }

  /**
   * Update an existing duty roster with DTO
   */
  async update(id: string, data: UpdateDutyRosterDto): Promise<DutyRoster> {
    // Use direct API call to handle the DTO
    return this.api.patch<DutyRoster>(`${this.resourcePath}/${id}`, data);
  }

  /**
   * Get all duty rosters, optionally filtered by unit ID
   */
  async getRostersByUnit(unitId?: string): Promise<DutyRoster[]> {
    const params = unitId ? { unitId } : undefined;
    return this.api.get<DutyRoster[]>(this.resourcePath, { params });
  }

  /**
   * Helper method to wrap delete and convert return type
   */
  async deleteRoster(id: string): Promise<void> {
    await super.delete(id);
    return;
  }
}

/**
 * Custom hook for duty roster operations
 */
export const useDutyRosterRepository = createCustomRepositoryHook<DutyRoster>((dataContext) => 
  new DutyRosterRepository(
    dataContext.api,
    dataContext.cache,
    dataContext.sync,
    dataContext.storage
  )
); 