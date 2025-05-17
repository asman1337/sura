import { StorageClient } from './storage-client';

/**
 * Type for cache entry with expiration
 */
interface CacheEntry<T> {
  value: T;
  expires: number | null; // Timestamp when cache expires, null means no expiration
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Key prefix for storage */
  prefix?: string;
  /** Default TTL in milliseconds, null means no expiration */
  defaultTTL?: number | null;
  /** Whether to use memory cache */
  useMemory?: boolean;
  /** Whether to use persistent storage */
  usePersistent?: boolean;
}

/**
 * Cache manager for efficiently storing and retrieving data
 */
export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private storage: StorageClient | null = null;
  private options: Required<CacheOptions>;
  
  constructor(
    storageClient?: StorageClient,
    options: CacheOptions = {}
  ) {
    this.options = {
      prefix: options.prefix || 'cache_',
      defaultTTL: options.defaultTTL !== undefined ? options.defaultTTL : 5 * 60 * 1000, // Default 5 minutes
      useMemory: options.useMemory !== undefined ? options.useMemory : true,
      usePersistent: options.usePersistent !== undefined ? options.usePersistent : true
    };
    
    // Set storage client if provided and persistent caching is enabled
    if (storageClient && this.options.usePersistent) {
      this.storage = storageClient;
    }
  }
  
  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(key);
    
    // Check memory cache first if enabled
    if (this.options.useMemory) {
      const memoryEntry = this.memoryCache.get(cacheKey);
      if (memoryEntry && this.isValid(memoryEntry)) {
        return memoryEntry.value as T;
      }
      
      // Remove expired entry
      if (memoryEntry) {
        this.memoryCache.delete(cacheKey);
      }
    }
    
    // Check persistent cache if enabled and available
    if (this.options.usePersistent && this.storage) {
      const persistentEntry = await this.storage.getItem<CacheEntry<T>>(cacheKey);
      if (persistentEntry && this.isValid(persistentEntry)) {
        // Refresh in memory cache if enabled
        if (this.options.useMemory) {
          this.memoryCache.set(cacheKey, persistentEntry);
        }
        return persistentEntry.value;
      }
      
      // Remove expired entry
      if (persistentEntry) {
        await this.storage.removeItem(cacheKey);
      }
    }
    
    return null;
  }
  
  /**
   * Store a value in the cache
   */
  async set<T>(key: string, value: T, ttl?: number | null): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    const expiresIn = ttl !== undefined ? ttl : this.options.defaultTTL;
    
    // Calculate expiration time
    const expires = expiresIn === null ? null : Date.now() + expiresIn;
    
    const entry: CacheEntry<T> = {
      value,
      expires
    };
    
    // Store in memory if enabled
    if (this.options.useMemory) {
      this.memoryCache.set(cacheKey, entry);
    }
    
    // Store in persistent storage if enabled
    if (this.options.usePersistent && this.storage) {
      await this.storage.setItem(cacheKey, entry);
    }
  }
  
  /**
   * Remove item from cache
   */
  async remove(key: string): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    
    // Remove from memory
    if (this.options.useMemory) {
      this.memoryCache.delete(cacheKey);
    }
    
    // Remove from persistent storage
    if (this.options.usePersistent && this.storage) {
      await this.storage.removeItem(cacheKey);
    }
  }
  
  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    // Clear memory cache
    if (this.options.useMemory) {
      this.memoryCache.clear();
    }
    
    // Clear persistent storage
    if (this.options.usePersistent && this.storage) {
      await this.storage.clear();
    }
  }
  
  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    const now = Date.now();
    
    // Clear expired memory cache entries
    if (this.options.useMemory) {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expires !== null && entry.expires < now) {
          this.memoryCache.delete(key);
        }
      }
    }
    
    // For persistent storage, we'd need to iterate over all entries
    // This could be expensive, so we don't do it automatically
    // Instead, we check expiration on get operations
  }
  
  /**
   * Get the full cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.options.prefix}${key}`;
  }
  
  /**
   * Check if a cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    if (entry.expires === null) {
      return true;
    }
    
    return entry.expires > Date.now();
  }
} 