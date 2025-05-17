import { StorageClient } from './storage-client';
import { ApiClient } from './api-client';

/**
 * Definition of a pending operation to be synced
 */
interface PendingOperation {
  id: string;
  timestamp: number;
  resourceType: string;
  operation: 'create' | 'update' | 'delete';
  endpoint: string;
  payload?: any;
  retryCount: number;
}

/**
 * Options for the sync manager
 */
export interface SyncManagerOptions {
  /** Key for storing pending operations */
  storageKey?: string;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Auto-sync interval in milliseconds (0 to disable) */
  autoSyncInterval?: number;
}

/**
 * Manages offline operations and synchronization with the backend
 */
export class SyncManager {
  private storage: StorageClient;
  private api: ApiClient;
  private pendingOperations: PendingOperation[] = [];
  private options: Required<SyncManagerOptions>;
  private syncIntervalId: number | null = null;
  private isSyncing = false;
  
  constructor(
    storage: StorageClient, 
    api: ApiClient,
    options: SyncManagerOptions = {}
  ) {
    this.storage = storage;
    this.api = api;
    
    this.options = {
      storageKey: options.storageKey || 'pending_operations',
      maxRetries: options.maxRetries !== undefined ? options.maxRetries : 5,
      autoSyncInterval: options.autoSyncInterval !== undefined ? options.autoSyncInterval : 60000,
    };
    
    // Load any pending operations from storage
    this.loadPendingOperations();
    
    // Start auto-sync if enabled
    if (this.options.autoSyncInterval > 0) {
      this.startAutoSync();
    }
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());
  }
  
  /**
   * Queue a create operation for later synchronization
   */
  async queueCreate(resourceType: string, endpoint: string, payload: any): Promise<string> {
    const operationId = `${resourceType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const operation: PendingOperation = {
      id: operationId,
      timestamp: Date.now(),
      resourceType,
      operation: 'create',
      endpoint,
      payload,
      retryCount: 0
    };
    
    this.pendingOperations.push(operation);
    await this.savePendingOperations();
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncPendingOperations();
    }
    
    return operationId;
  }
  
  /**
   * Queue an update operation for later synchronization
   */
  async queueUpdate(resourceType: string, endpoint: string, payload: any): Promise<string> {
    const operationId = `${resourceType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const operation: PendingOperation = {
      id: operationId,
      timestamp: Date.now(),
      resourceType,
      operation: 'update',
      endpoint,
      payload,
      retryCount: 0
    };
    
    this.pendingOperations.push(operation);
    await this.savePendingOperations();
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncPendingOperations();
    }
    
    return operationId;
  }
  
  /**
   * Queue a delete operation for later synchronization
   */
  async queueDelete(resourceType: string, endpoint: string): Promise<string> {
    const operationId = `${resourceType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const operation: PendingOperation = {
      id: operationId,
      timestamp: Date.now(),
      resourceType,
      operation: 'delete',
      endpoint,
      retryCount: 0
    };
    
    this.pendingOperations.push(operation);
    await this.savePendingOperations();
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncPendingOperations();
    }
    
    return operationId;
  }
  
  /**
   * Get pending operations count by resource type
   */
  getPendingCount(resourceType?: string): number {
    if (resourceType) {
      return this.pendingOperations.filter(op => op.resourceType === resourceType).length;
    }
    return this.pendingOperations.length;
  }
  
  /**
   * Start the automatic synchronization process
   */
  startAutoSync(): void {
    if (this.syncIntervalId !== null) {
      return;
    }
    
    this.syncIntervalId = window.setInterval(() => {
      if (navigator.onLine && this.pendingOperations.length > 0) {
        this.syncPendingOperations();
      }
    }, this.options.autoSyncInterval);
  }
  
  /**
   * Stop the automatic synchronization process
   */
  stopAutoSync(): void {
    if (this.syncIntervalId !== null) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }
  
  /**
   * Force synchronization of pending operations
   */
  async forceSynchronization(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }
    
    return this.syncPendingOperations();
  }
  
  /**
   * Handle coming back online
   */
  private onOnline(): void {
    console.log('Device is back online. Attempting to sync pending operations...');
    this.syncPendingOperations();
  }
  
  /**
   * Handle going offline
   */
  private onOffline(): void {
    console.log('Device is offline. Synchronization paused.');
  }
  
  /**
   * Load pending operations from storage
   */
  private async loadPendingOperations(): Promise<void> {
    try {
      const stored = await this.storage.getItem<PendingOperation[]>(this.options.storageKey);
      if (stored) {
        this.pendingOperations = stored;
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  }
  
  /**
   * Save pending operations to storage
   */
  private async savePendingOperations(): Promise<void> {
    try {
      await this.storage.setItem(this.options.storageKey, this.pendingOperations);
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }
  
  /**
   * Synchronize pending operations with the backend
   */
  private async syncPendingOperations(): Promise<boolean> {
    if (this.isSyncing || this.pendingOperations.length === 0) {
      return false;
    }
    
    this.isSyncing = true;
    let success = true;
    
    // Sort by timestamp (oldest first)
    const sortedOperations = [...this.pendingOperations].sort((a, b) => a.timestamp - b.timestamp);
    
    for (const operation of sortedOperations) {
      try {
        switch (operation.operation) {
          case 'create':
            await this.api.post(operation.endpoint, operation.payload);
            break;
          case 'update':
            await this.api.put(operation.endpoint, operation.payload);
            break;
          case 'delete':
            await this.api.delete(operation.endpoint);
            break;
        }
        
        // Remove the operation if successful
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== operation.id);
      } catch (error) {
        success = false;
        console.error(`Error syncing operation ${operation.id}:`, error);
        
        // Increment retry count
        const opIndex = this.pendingOperations.findIndex(op => op.id === operation.id);
        if (opIndex !== -1) {
          this.pendingOperations[opIndex].retryCount++;
          
          // Remove if max retries reached
          if (this.pendingOperations[opIndex].retryCount > this.options.maxRetries) {
            console.warn(`Operation ${operation.id} has reached max retries and will be discarded`);
            this.pendingOperations.splice(opIndex, 1);
          }
        }
      }
    }
    
    // Save the updated pending operations list
    await this.savePendingOperations();
    
    this.isSyncing = false;
    return success;
  }
} 