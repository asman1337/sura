import { BaseRepository } from '../base-repository';
import { ApiClient } from '../api-client';
import { CacheManager } from '../cache-manager';
import { SyncManager } from '../sync-manager';
import { StorageClient } from '../storage-client';
import { createCustomRepositoryHook } from '../repository-hooks';
import { Officer, OfficerFilters } from '../interfaces/officer.interface';
import { useData } from '../data-context';
import { useRef, useMemo } from 'react';

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
    const cacheKey = `officers:unit:${unitId}`;
    
    // Try to get from cache first if enabled and preferred
    if (this.options.cacheEnabled && this.options.preferCache) {
      const cachedItems = await this.cache.get<Officer[]>(cacheKey);
      if (cachedItems) {
        return cachedItems;
      }
    }
    
    try {
      // Fetch from API
      const officers = await this.api.get<Officer[]>(this.resourcePath, { 
        params: { unitId } 
      });
      
      // Cache the results if enabled
      if (this.options.cacheEnabled) {
        await this.cache.set(cacheKey, officers, this.options.cacheTTL);
      }
      
      return officers;
    } catch (error) {
      console.error('Error fetching officers by unit ID:', error);
      throw error;
    }
  }

  /**
   * Get officers by department ID
   */
  async getByDepartmentId(departmentId: string): Promise<Officer[]> {
    const cacheKey = `officers:department:${departmentId}`;
    
    // Try to get from cache first if enabled and preferred
    if (this.options.cacheEnabled && this.options.preferCache) {
      const cachedItems = await this.cache.get<Officer[]>(cacheKey);
      if (cachedItems) {
        return cachedItems;
      }
    }
    
    try {
      // Fetch from API
      const officers = await this.api.get<Officer[]>(this.resourcePath, { 
        params: { departmentId } 
      });
      
      // Cache the results if enabled
      if (this.options.cacheEnabled) {
        await this.cache.set(cacheKey, officers, this.options.cacheTTL);
      }
      
      return officers;
    } catch (error) {
      console.error('Error fetching officers by department ID:', error);
      throw error;
    }
  }

  /**
   * Get officers by organization ID
   */
  async getByOrganizationId(organizationId: string): Promise<Officer[]> {
    const cacheKey = `officers:organization:${organizationId}`;
    
    // Try to get from cache first if enabled and preferred
    if (this.options.cacheEnabled && this.options.preferCache) {
      const cachedItems = await this.cache.get<Officer[]>(cacheKey);
      if (cachedItems) {
        return cachedItems;
      }
    }
    
    try {
      // Fetch from API
      const officers = await this.api.get<Officer[]>(this.resourcePath, { 
        params: { organizationId } 
      });
      
      // Cache the results if enabled
      if (this.options.cacheEnabled) {
        await this.cache.set(cacheKey, officers, this.options.cacheTTL);
      }
      
      return officers;
    } catch (error) {
      console.error('Error fetching officers by organization ID:', error);
      throw error;
    }
  }

  /**
   * Get officers with filters
   */
  async getOfficersWithFilters(filters: OfficerFilters): Promise<Officer[]> {
    // Create a query params object based on the filters
    const params: Record<string, any> = {};
    
    // Add each filter to the params if it exists
    if (filters.unitId) params.unitId = filters.unitId;
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.organizationId) params.organizationId = filters.organizationId;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    
    try {
      // Fetch officers with the filters
      let officers = await this.api.get<Officer[]>(this.resourcePath, { params });
      
      // If search term is provided, filter client-side
      if (filters.search && officers.length > 0) {
        officers = this.filterBySearchTerm(officers, filters.search);
      }
      
      return officers;
    } catch (error) {
      console.error('Error fetching officers with filters:', error);
      throw error;
    }
  }
  
  /**
   * Filter officers by a search term (client-side)
   */
  private filterBySearchTerm(officers: Officer[], searchTerm: string): Officer[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return officers.filter(officer => {
      const fullName = `${officer.firstName} ${officer.lastName}`.toLowerCase();
      return (
        fullName.includes(lowerSearchTerm) ||
        officer.badgeNumber.toLowerCase().includes(lowerSearchTerm) ||
        officer.email.toLowerCase().includes(lowerSearchTerm) ||
        (officer.rank?.name?.toLowerCase().includes(lowerSearchTerm) || false)
      );
    });
  }
}

// Create a single repository factory function for use with the hook
const createOfficerRepository = (dataContext: ReturnType<typeof useData>) => 
  new OfficerRepository(
    dataContext.api,
    dataContext.cache,
    dataContext.sync,
    dataContext.storage
  );

/**
 * Custom hook for officer operations
 */
export const useOfficerRepository = () => {
  const dataContext = useData();
  
  // Use a ref to store the repository instance
  const repositoryRef = useRef<OfficerRepository | null>(null);
  
  // Create the repository instance if it doesn't exist yet
  if (!repositoryRef.current) {
    repositoryRef.current = createOfficerRepository(dataContext);
  }
  
  // Use the base repository hook but with loadOnMount set to false to prevent duplicate loads
  const baseRepo = createCustomRepositoryHook<Officer>(
    () => repositoryRef.current!
  )({ loadOnMount: false });
  
  // Memoize the combined repository to maintain stable references
  return useMemo(() => {
    const repo = repositoryRef.current!;
    
    return {
      ...baseRepo,
      // Bind custom methods to ensure 'this' context is preserved
      getByUnitId: repo.getByUnitId.bind(repo),
      getByDepartmentId: repo.getByDepartmentId.bind(repo),
      getByOrganizationId: repo.getByOrganizationId.bind(repo),
      getOfficersWithFilters: repo.getOfficersWithFilters.bind(repo),
      // Expose loading and error states
      isLoading: baseRepo.isLoading,
      error: baseRepo.error
    };
  }, [baseRepo]);
}; 