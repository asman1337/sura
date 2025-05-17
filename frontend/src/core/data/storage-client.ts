/**
 * Interface for all storage providers
 */
export interface StorageProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * LocalStorage implementation of StorageProvider
 */
export class LocalStorageProvider implements StorageProvider {
  private prefix: string;
  
  constructor(prefix: string = 'sura_') {
    this.prefix = prefix;
  }
  
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  async getItem<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(this.getKey(key));
    if (value === null) {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error parsing stored value for key ${key}:`, error);
      return null;
    }
  }
  
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing value for key ${key}:`, error);
      throw error;
    }
  }
  
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }
  
  async clear(): Promise<void> {
    // Only clear items with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
}

/**
 * IndexedDB implementation of StorageProvider
 */
export class IndexedDBStorageProvider implements StorageProvider {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  
  constructor(dbName: string = 'sura_db', storeName: string = 'app_data') {
    this.dbName = dbName;
    this.storeName = storeName;
  }
  
  private async openDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => {
        reject(new Error('Could not open IndexedDB'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }
  
  async getItem<T>(key: string): Promise<T | null> {
    const db = await this.openDatabase();
    
    return new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => {
        reject(new Error(`Error retrieving value for key ${key}`));
      };
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value as T);
        } else {
          resolve(null);
        }
      };
    });
  }
  
  async setItem<T>(key: string, value: T): Promise<void> {
    const db = await this.openDatabase();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, value });
      
      request.onerror = () => {
        reject(new Error(`Error storing value for key ${key}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
  
  async removeItem(key: string): Promise<void> {
    const db = await this.openDatabase();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = () => {
        reject(new Error(`Error removing value for key ${key}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
  
  async clear(): Promise<void> {
    const db = await this.openDatabase();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => {
        reject(new Error('Error clearing storage'));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
}

/**
 * Main storage client that can use different storage providers
 */
export class StorageClient {
  private provider: StorageProvider;
  
  constructor(provider: StorageProvider) {
    this.provider = provider;
  }
  
  async getItem<T>(key: string): Promise<T | null> {
    return this.provider.getItem<T>(key);
  }
  
  async setItem<T>(key: string, value: T): Promise<void> {
    return this.provider.setItem(key, value);
  }
  
  async removeItem(key: string): Promise<void> {
    return this.provider.removeItem(key);
  }
  
  async clear(): Promise<void> {
    return this.provider.clear();
  }
} 