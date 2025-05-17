import { 
  ApiClient, 
  CacheManager, 
  SyncManager,
  StorageClient,
  BaseRepository, 
  createCustomRepositoryHook, 
  DataContextValue
} from '../../../core/data';

/**
 * Malkhana evidence item interface
 */
export interface MalkhanaItem {
  id: string;
  name: string;
  caseId: string;
  dateAdded: string;
  description?: string;
  category: string;
  location?: string;
  status: 'in-storage' | 'released' | 'destroyed' | 'transferred';
  addedBy: string;
  photoUrl?: string;
  barcodeId?: string;
  notes?: string;
}

/**
 * Repository for Malkhana evidence items
 */
export class MalkhanaRepository extends BaseRepository<MalkhanaItem> {
  constructor(
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient
  ) {
    super(
      '/api/malkhana',
      'malkhana',
      api,
      cache,
      sync,
      storage
    );
  }
  
  /**
   * Get items by case ID
   */
  async getItemsByCase(caseId: string): Promise<MalkhanaItem[]> {
    const cacheKey = `malkhana:case:${caseId}`;
    
    // Try cache first if enabled and preferred
    if (this.repositoryOptions.cacheEnabled && this.repositoryOptions.preferCache) {
      const cached = await this.cacheManager.get<MalkhanaItem[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      // Fetch from API with filter
      const items = await this.apiClient.get<MalkhanaItem[]>(`${this.path}?caseId=${caseId}`);
      
      // Cache the results if enabled
      if (this.repositoryOptions.cacheEnabled) {
        await this.cacheManager.set(cacheKey, items, this.repositoryOptions.cacheTTL);
      }
      
      return items;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Find items by barcode
   */
  async findByBarcode(barcode: string): Promise<MalkhanaItem | null> {
    try {
      const items = await this.apiClient.get<MalkhanaItem[]>(`${this.path}?barcode=${barcode}`);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Change the status of an item
   */
  async changeStatus(id: string, status: MalkhanaItem['status'], notes?: string): Promise<MalkhanaItem> {
    return this.update(id, { status, notes });
  }
  
  /**
   * Transfer an item to a new location
   */
  async transfer(id: string, location: string, notes?: string): Promise<MalkhanaItem> {
    return this.update(id, { location, notes });
  }
}

/**
 * Create a repository factory function
 */
export const createMalkhanaRepository = (deps: DataContextValue): MalkhanaRepository => {
  return new MalkhanaRepository(
    deps.api,
    deps.cache,
    deps.sync,
    deps.storage
  );
};

/**
 * Create a hook for using the Malkhana repository in components
 */
export const useMalkhanaRepository = createCustomRepositoryHook<MalkhanaItem>(createMalkhanaRepository); 