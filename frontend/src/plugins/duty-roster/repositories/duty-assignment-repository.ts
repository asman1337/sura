import { BaseRepository } from '../../../core/data/base-repository';
import { ApiClient } from '../../../core/data/api-client';
import { CacheManager } from '../../../core/data/cache-manager';
import { SyncManager } from '../../../core/data/sync-manager';
import { StorageClient } from '../../../core/data/storage-client';
import { 
  DutyAssignment, 
  CreateDutyAssignmentDto, 
  UpdateDutyAssignmentDto,
  BatchCreateDutyAssignmentsDto 
} from '../types';
import { createCustomRepositoryHook } from '../../../core/data/repository-hooks';

/**
 * Repository for duty assignment operations
 */
export class DutyAssignmentRepository extends BaseRepository<DutyAssignment> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient
  ) {
    super(
      '/duty-assignments',
      'duty-assignments',
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
   * Create a new duty assignment
   */
  async createAssignment(data: CreateDutyAssignmentDto): Promise<DutyAssignment> {
    return this.api.post<DutyAssignment>(this.resourcePath, data);
  }

  /**
   * Create multiple duty assignments at once
   */
  async createBatchAssignments(data: BatchCreateDutyAssignmentsDto): Promise<DutyAssignment[]> {
    return this.api.post<DutyAssignment[]>(`${this.resourcePath}/batch`, data);
  }

  /**
   * Update an existing duty assignment
   */
  async updateAssignment(id: string, data: UpdateDutyAssignmentDto): Promise<DutyAssignment> {
    return this.api.patch<DutyAssignment>(`${this.resourcePath}/${id}`, data);
  }

  /**
   * Get assignments by roster ID
   */
  async getAssignmentsByRoster(rosterId: string): Promise<DutyAssignment[]> {
    return this.api.get<DutyAssignment[]>(this.resourcePath, { 
      params: { rosterId } 
    });
  }

  /**
   * Get assignments by officer ID
   */
  async getAssignmentsByOfficer(officerId: string): Promise<DutyAssignment[]> {
    return this.api.get<DutyAssignment[]>(this.resourcePath, { 
      params: { officerId } 
    });
  }

  /**
   * Get assignments by roster ID
   */
  async getByRosterId(rosterId: string): Promise<DutyAssignment[]> {
    return this.api.get<DutyAssignment[]>(this.resourcePath, { 
      params: { rosterId } 
    });
  }

  /**
   * Get assignments by roster ID and officer ID
   */
  async getAssignmentsByRosterAndOfficer(rosterId: string, officerId: string): Promise<DutyAssignment[]> {
    return this.api.get<DutyAssignment[]>(this.resourcePath, { 
      params: { rosterId, officerId } 
    });
  }

  /**
   * Get assignments by officer ID
   */
  async getByOfficerId(officerId: string): Promise<DutyAssignment[]> {
    return this.api.get<DutyAssignment[]>(this.resourcePath, { 
      params: { officerId } 
    });
  }
}

/**
 * Custom hook for duty assignment operations
 */
export const useDutyAssignmentRepository = createCustomRepositoryHook<DutyAssignment>((dataContext) => 
  new DutyAssignmentRepository(
    dataContext.api,
    dataContext.cache,
    dataContext.sync,
    dataContext.storage
  )
); 