import { BaseRepository } from '../../../core/data/base-repository';
import { ApiClient } from '../../../core/data/api-client';
import { CacheManager } from '../../../core/data/cache-manager';
import { SyncManager } from '../../../core/data/sync-manager';
import { StorageClient } from '../../../core/data/storage-client';
import { createCustomRepositoryHook } from '../../../core/data/repository-hooks';
import { Officer } from '../types';

/**
 * Repository for officer operations
 */
export class OfficerRepository extends BaseRepository<Officer> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient
  ) {
    super(
      '/officers',
      'officers',
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
   * Get officers by unit ID
   */
  async getByUnitId(unitId: string): Promise<Officer[]> {
    return this.api.get<Officer[]>(this.resourcePath, { 
      params: { unitId } 
    });
  }

  /**
   * Get officers by organization ID
   */
  async getByOrganizationId(organizationId: string): Promise<Officer[]> {
    return this.api.get<Officer[]>(this.resourcePath, { 
      params: { organizationId } 
    });
  }

  /**
   * Get officers by department ID
   */
  async getByDepartmentId(departmentId: string): Promise<Officer[]> {
    return this.api.get<Officer[]>(this.resourcePath, { 
      params: { departmentId } 
    });
  }
}

/**
 * Custom hook for officer operations
 */
export const useOfficerRepository = createCustomRepositoryHook<Officer>((dataContext) => 
  new OfficerRepository(
    dataContext.api,
    dataContext.cache,
    dataContext.sync,
    dataContext.storage
  )
); 