import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ApiClient } from './api-client';
import { AuthService } from './auth-service';
import { StorageClient, LocalStorageProvider, IndexedDBStorageProvider } from './storage-client';
import { CacheManager } from './cache-manager';
import { SyncManager } from './sync-manager';
import { usePlugins } from '../plugins';

/**
 * Data context configuration options
 */
export interface DataContextConfig {
  apiBaseUrl: string;
  usePersistentStorage: boolean;
  useIndexedDb: boolean;
  syncInterval: number;
}

/**
 * Data context interface
 */
export interface DataContextValue {
  api: ApiClient;
  auth: AuthService;
  storage: StorageClient;
  cache: CacheManager;
  sync: SyncManager;
  isInitialized: boolean;
}

// Create context with a null default value
const DataContext = createContext<DataContextValue | null>(null);

// Data services plugin manifest
const DATA_SERVICES_PLUGIN_ID = 'sura-core-data-services';

/**
 * Provider component for data services
 */
export const DataProvider: React.FC<{
  children: React.ReactNode;
  config: DataContextConfig;
}> = ({ children, config }) => {
  // Track initialization status
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create the storage provider based on configuration
  const storageProvider = useMemo(() => {
    if (!config.usePersistentStorage) {
      return new LocalStorageProvider('sura_');
    }
    
    if (config.useIndexedDb) {
      return new IndexedDBStorageProvider('sura_db', 'app_data');
    }
    
    return new LocalStorageProvider('sura_');
  }, [config.usePersistentStorage, config.useIndexedDb]);
  
  // Create the storage client
  const storage = useMemo(() => new StorageClient(storageProvider), [storageProvider]);
  
  // Create the auth service with storage
  const auth = useMemo(() => new AuthService(storage, config.apiBaseUrl), [storage, config.apiBaseUrl]);
  
  // Create the API client with auth service callbacks
  const api = useMemo(() => new ApiClient(
    config.apiBaseUrl,
    // Token provider function
    () => auth.getToken(),
    // Token refresher function
    async () => auth.refreshToken(),
    // Logout handler function
    async () => auth.logout()
  ), [config.apiBaseUrl, auth]);
  
  // Create the cache manager
  const cache = useMemo(() => new CacheManager(storage), [storage]);
  
  // Create the sync manager
  const sync = useMemo(() => new SyncManager(storage, api, {
    autoSyncInterval: config.syncInterval
  }), [storage, api, config.syncInterval]);
  
  // Get the plugin registry to register our data service as a plugin
  const { registry, getPlugin } = usePlugins();
  
  // Initialize auth service on mount
  useEffect(() => {
    const initializeAuth = async () => {
      await auth.initialize();
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, [auth]);
  
  // Register the data services plugin
  useEffect(() => {
    if (!registry || !isInitialized) return;
    
    const registerDataServicesPlugin = async () => {
      // Check if already registered
      if (getPlugin(DATA_SERVICES_PLUGIN_ID)) {
        return;
      }
      
      // Register the data services plugin
      await registry.registerPlugin({
        id: DATA_SERVICES_PLUGIN_ID,
        name: 'Data Services',
        version: '1.0.0',
        description: 'Provides core data access services',
        author: 'SURA Team',
        dependencies: [],
        entryPoints: {
          services: () => Promise.resolve({ api, auth, storage, cache, sync }),
        },
        requiredPermissions: [],
        settings: {
          allowMultipleInstances: false,
          loadPriority: 0, // Load first
          autoEnable: true
        }
      });
      
      // Make sure it's enabled
      await registry.enablePlugin(DATA_SERVICES_PLUGIN_ID);
    };
    
    registerDataServicesPlugin();
  }, [registry, getPlugin, api, auth, storage, cache, sync, isInitialized]);
  
  // Register core data services as extension points when the plugin is registered
  useEffect(() => {
    if (!registry || !isInitialized) return;
    
    // Check if our plugin is already registered
    const dataServicesPlugin = getPlugin(DATA_SERVICES_PLUGIN_ID);
    if (!dataServicesPlugin) return;
    
    // Register the extension points
    dataServicesPlugin.registerExtensionPoint('core:apiClient', api);
    dataServicesPlugin.registerExtensionPoint('core:authService', auth);
    dataServicesPlugin.registerExtensionPoint('core:storageClient', storage);
    dataServicesPlugin.registerExtensionPoint('core:cacheManager', cache);
    dataServicesPlugin.registerExtensionPoint('core:syncManager', sync);
    
    // Register a combined extension point for convenience
    dataServicesPlugin.registerExtensionPoint('core:dataServices', {
      api,
      auth,
      storage,
      cache,
      sync
    });
  }, [registry, getPlugin, api, auth, storage, cache, sync, isInitialized]);
  
  // Create the context value
  const contextValue = useMemo<DataContextValue>(() => ({
    api,
    auth,
    storage,
    cache,
    sync,
    isInitialized
  }), [api, auth, storage, cache, sync, isInitialized]);
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook to use data services
 */
export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 