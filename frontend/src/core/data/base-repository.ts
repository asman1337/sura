import { ApiClient } from './api-client';
import { CacheManager } from './cache-manager';
import { SyncManager } from './sync-manager';
import { StorageClient } from './storage-client';

/**
 * Base repository interface for CRUD operations
 */
export interface Repository<T, ID = string | number> {
  getAll(): Promise<T[]>;
  getById(id: ID): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: ID, item: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

/**
 * Repository options
 */
export interface RepositoryOptions {
  /** Cache time to live in ms, null for no expiration */
  cacheTTL?: number | null;
  /** Whether to enable offline support */
  offlineEnabled?: boolean;
  /** Whether to cache API responses */
  cacheEnabled?: boolean;
  /** Whether to prefer cache over network for initial data */
  preferCache?: boolean;
}

/**
 * Base repository implementation
 */
export abstract class BaseRepository<T extends { id: ID }, ID = string | number> implements Repository<T, ID> {
  // Protected properties are accessible in derived classes
  protected readonly resourcePath: string;
  protected readonly resourceName: string;
  protected readonly api: ApiClient;
  protected readonly cache: CacheManager;
  protected readonly sync: SyncManager;
  protected readonly storage: StorageClient;
  protected readonly options: Required<RepositoryOptions>;
  
  /**
   * Create a new repository
   * @param resourcePath API resource path (e.g., '/api/malkhana')
   * @param resourceName Resource name for cache keys (e.g., 'malkhana')
   * @param api ApiClient instance
   * @param cache CacheManager instance
   * @param sync SyncManager for offline operations
   * @param storage StorageClient for persistent storage
   * @param options Repository options
   */
  constructor(
    resourcePath: string,
    resourceName: string,
    api: ApiClient,
    cache: CacheManager,
    sync: SyncManager,
    storage: StorageClient,
    options: RepositoryOptions = {}
  ) {
    this.resourcePath = resourcePath;
    this.resourceName = resourceName;
    this.api = api;
    this.cache = cache;
    this.sync = sync;
    this.storage = storage;
    
    // Set default options
    this.options = {
      cacheTTL: options.cacheTTL ?? 5 * 60 * 1000, // 5 minutes default
      offlineEnabled: options.offlineEnabled ?? true,
      cacheEnabled: options.cacheEnabled ?? true,
      preferCache: options.preferCache ?? true
    };
  }
  
  // Public getters for protected properties to make them accessible in TypeScript
  public get apiClient(): ApiClient {
    return this.api;
  }
  
  public get cacheManager(): CacheManager {
    return this.cache;
  }
  
  public get syncManager(): SyncManager {
    return this.sync;
  }
  
  public get storageClient(): StorageClient {
    return this.storage;
  }
  
  public get repositoryOptions(): Required<RepositoryOptions> {
    return this.options;
  }
  
  public get path(): string {
    return this.resourcePath;
  }
  
  public get name(): string {
    return this.resourceName;
  }
  
  /**
   * Get all items
   */
  async getAll(): Promise<T[]> {
    const cacheKey = `${this.resourceName}:all`;
    
    // Try to get from cache first if enabled and preferred
    if (this.options.cacheEnabled && this.options.preferCache) {
      const cachedItems = await this.cache.get<T[]>(cacheKey);
      if (cachedItems) {
        return cachedItems;
      }
    }
    
    // Check network connectivity
    if (!navigator.onLine && this.options.offlineEnabled) {
      // Get from storage if offline
      const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
      return storedItems;
    }
    
    try {
      // Fetch from API
      const items = await this.api.get<T[]>(this.resourcePath);
      
      // Cache the results if enabled
      if (this.options.cacheEnabled) {
        await this.cache.set(cacheKey, items, this.options.cacheTTL);
      }
      
      // Store for offline use if enabled
      if (this.options.offlineEnabled) {
        await this.storage.setItem(`${this.resourceName}:items`, items);
      }
      
      return items;
    } catch (error) {
      // If offline enabled and we have a stored version, use it
      if (this.options.offlineEnabled) {
        const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`);
        if (storedItems) {
          return storedItems;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Get item by ID
   */
  async getById(id: ID): Promise<T | null> {
    const cacheKey = `${this.resourceName}:${id}`;
    
    // Try to get from cache first if enabled and preferred
    if (this.options.cacheEnabled && this.options.preferCache) {
      const cachedItem = await this.cache.get<T>(cacheKey);
      if (cachedItem) {
        return cachedItem;
      }
    }
    
    // Check network connectivity
    if (!navigator.onLine && this.options.offlineEnabled) {
      // Try to get specific item from storage
      const storedItem = await this.storage.getItem<T>(`${this.resourceName}:item:${id}`);
      if (storedItem) {
        return storedItem;
      }
      
      // If not found as individual item, try to find in the collection
      const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`);
      if (storedItems) {
        const item = storedItems.find(item => item.id === id) || null;
        return item;
      }
      
      return null;
    }
    
    try {
      // Fetch from API
      const item = await this.api.get<T>(`${this.resourcePath}/${id}`);
      
      // Cache the result if enabled
      if (this.options.cacheEnabled) {
        await this.cache.set(cacheKey, item, this.options.cacheTTL);
      }
      
      // Store for offline use if enabled
      if (this.options.offlineEnabled) {
        await this.storage.setItem(`${this.resourceName}:item:${id}`, item);
      }
      
      return item;
    } catch (error) {
      // If API returns 404, return null
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      
      // If offline enabled and we have a stored version, use it
      if (this.options.offlineEnabled) {
        // Try to get specific item from storage
        const storedItem = await this.storage.getItem<T>(`${this.resourceName}:item:${id}`);
        if (storedItem) {
          return storedItem;
        }
        
        // If not found as individual item, try to find in the collection
        const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`);
        if (storedItems) {
          return storedItems.find(item => item.id === id) || null;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Create a new item
   */
  async create(item: Omit<T, 'id'>): Promise<T> {
    // Check network connectivity
    if (!navigator.onLine && this.options.offlineEnabled) {
      // Create a temporary ID for offline item
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const tempItem = { ...item, id: tempId as any } as T;
      
      // Queue for sync when online
      await this.sync.queueCreate(this.resourceName, this.resourcePath, item);
      
      // Store locally
      const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
      storedItems.push(tempItem);
      await this.storage.setItem(`${this.resourceName}:items`, storedItems);
      
      return tempItem;
    }
    
    try {
      // Create via API
      const createdItem = await this.api.post<T>(this.resourcePath, item);
      
      // Update cache if enabled
      if (this.options.cacheEnabled) {
        // Cache the new item
        await this.cache.set(`${this.resourceName}:${createdItem.id}`, createdItem, this.options.cacheTTL);
        
        // Invalidate the collection cache
        await this.cache.remove(`${this.resourceName}:all`);
      }
      
      // Update offline storage if enabled
      if (this.options.offlineEnabled) {
        // Store the new item
        await this.storage.setItem(`${this.resourceName}:item:${createdItem.id}`, createdItem);
        
        // Update the collection in storage
        const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
        storedItems.push(createdItem);
        await this.storage.setItem(`${this.resourceName}:items`, storedItems);
      }
      
      return createdItem;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update an existing item
   */
  async update(id: ID, updates: Partial<T>): Promise<T> {
    // Check network connectivity
    if (!navigator.onLine && this.options.offlineEnabled) {
      // Get the current item
      const currentItem = await this.getById(id);
      if (!currentItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      // Apply updates
      const updatedItem = { ...currentItem, ...updates };
      
      // Queue for sync when online
      await this.sync.queueUpdate(this.resourceName, `${this.resourcePath}/${id}`, updates);
      
      // Update locally
      const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
      const itemIndex = storedItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        storedItems[itemIndex] = updatedItem;
        await this.storage.setItem(`${this.resourceName}:items`, storedItems);
      }
      
      // Update individual item storage
      await this.storage.setItem(`${this.resourceName}:item:${id}`, updatedItem);
      
      return updatedItem;
    }
    
    try {
      // Update via API
      const updatedItem = await this.api.put<T>(`${this.resourcePath}/${id}`, updates);
      
      // Update cache if enabled
      if (this.options.cacheEnabled) {
        // Cache the updated item
        await this.cache.set(`${this.resourceName}:${id}`, updatedItem, this.options.cacheTTL);
        
        // Invalidate the collection cache
        await this.cache.remove(`${this.resourceName}:all`);
      }
      
      // Update offline storage if enabled
      if (this.options.offlineEnabled) {
        // Store the updated item
        await this.storage.setItem(`${this.resourceName}:item:${id}`, updatedItem);
        
        // Update the collection in storage
        const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
        const itemIndex = storedItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          storedItems[itemIndex] = updatedItem;
          await this.storage.setItem(`${this.resourceName}:items`, storedItems);
        }
      }
      
      return updatedItem;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete an item
   */
  async delete(id: ID): Promise<boolean> {
    // Check network connectivity
    if (!navigator.onLine && this.options.offlineEnabled) {
      // Queue for sync when online
      await this.sync.queueDelete(this.resourceName, `${this.resourcePath}/${id}`);
      
      // Delete locally
      const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
      const filteredItems = storedItems.filter(item => item.id !== id);
      await this.storage.setItem(`${this.resourceName}:items`, filteredItems);
      
      // Remove individual item
      await this.storage.removeItem(`${this.resourceName}:item:${id}`);
      
      return true;
    }
    
    try {
      // Delete via API
      await this.api.delete(`${this.resourcePath}/${id}`);
      
      // Update cache if enabled
      if (this.options.cacheEnabled) {
        // Remove the item from cache
        await this.cache.remove(`${this.resourceName}:${id}`);
        
        // Invalidate the collection cache
        await this.cache.remove(`${this.resourceName}:all`);
      }
      
      // Update offline storage if enabled
      if (this.options.offlineEnabled) {
        // Remove the item
        await this.storage.removeItem(`${this.resourceName}:item:${id}`);
        
        // Update the collection in storage
        const storedItems = await this.storage.getItem<T[]>(`${this.resourceName}:items`) || [];
        const filteredItems = storedItems.filter(item => item.id !== id);
        await this.storage.setItem(`${this.resourceName}:items`, filteredItems);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Create a repository hook for use in components
   */
  protected createRepositoryHook<T extends { id: ID }, ID = string | number>() {
    // This would be implemented in a derived class
    // to create React hooks for the repository
  }
} 