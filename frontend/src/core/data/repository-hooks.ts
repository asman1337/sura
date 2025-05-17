import { useCallback, useEffect, useState } from 'react';
import { useData } from './data-context';
import { BaseRepository } from './base-repository';

/**
 * Hook state for repository operations
 */
interface RepositoryState<T, ID> {
  items: T[];
  selectedItem: T | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
}

/**
 * Options for the useRepository hook
 */
export interface UseRepositoryOptions {
  autoLoad?: boolean;
  loadOnMount?: boolean;
}

/**
 * Create a hook for using a repository in React components
 */
export function createRepositoryHook<T extends { id: ID }, ID = string | number>(
  createRepository: (deps: ReturnType<typeof useData>) => BaseRepository<T, ID>
) {
  return function useRepository(options: UseRepositoryOptions = {}) {
    const { autoLoad = true, loadOnMount = true } = options;
    
    // Get data services
    const dataServices = useData();
    
    // Create repository instance
    const repository = createRepository(dataServices);
    
    // State for the repository
    const [state, setState] = useState<RepositoryState<T, ID>>({
      items: [],
      selectedItem: null,
      isLoading: false,
      isSubmitting: false,
      error: null
    });
    
    // Load all items
    const loadItems = useCallback(async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const items = await repository.getAll();
        setState(prev => ({ ...prev, items, isLoading: false }));
      } catch (error) {
        console.error('Error loading items:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error(String(error))
        }));
      }
    }, [repository]);
    
    // Load a specific item by ID
    const loadItem = useCallback(async (id: ID) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const item = await repository.getById(id);
        setState(prev => ({ ...prev, selectedItem: item, isLoading: false }));
        return item;
      } catch (error) {
        console.error(`Error loading item ${id}:`, error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error(String(error))
        }));
        return null;
      }
    }, [repository]);
    
    // Create a new item
    const createItem = useCallback(async (item: Omit<T, 'id'>) => {
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      try {
        const createdItem = await repository.create(item);
        
        // Update the items list if we have it loaded already
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false,
          items: autoLoad ? [...prev.items, createdItem] : prev.items,
          selectedItem: createdItem
        }));
        
        return createdItem;
      } catch (error) {
        console.error('Error creating item:', error);
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false, 
          error: error instanceof Error ? error : new Error(String(error))
        }));
        throw error;
      }
    }, [repository, autoLoad]);
    
    // Update an existing item
    const updateItem = useCallback(async (id: ID, updates: Partial<T>) => {
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      try {
        const updatedItem = await repository.update(id, updates);
        
        // Update the items list and selected item if loaded
        setState(prev => {
          // Create updated items list with the updated item
          const updatedItems = prev.items.map(item => 
            item.id === id ? updatedItem : item
          );
          
          return { 
            ...prev, 
            isSubmitting: false,
            items: autoLoad ? updatedItems : prev.items,
            selectedItem: prev.selectedItem?.id === id ? updatedItem : prev.selectedItem
          };
        });
        
        return updatedItem;
      } catch (error) {
        console.error(`Error updating item ${id}:`, error);
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false, 
          error: error instanceof Error ? error : new Error(String(error))
        }));
        throw error;
      }
    }, [repository, autoLoad]);
    
    // Delete an item
    const deleteItem = useCallback(async (id: ID) => {
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));
      
      try {
        const success = await repository.delete(id);
        
        // Update the items list and selected item if loaded
        setState(prev => {
          // Filter out the deleted item
          const filteredItems = prev.items.filter(item => item.id !== id);
          
          return { 
            ...prev, 
            isSubmitting: false,
            items: autoLoad ? filteredItems : prev.items,
            selectedItem: prev.selectedItem?.id === id ? null : prev.selectedItem
          };
        });
        
        return success;
      } catch (error) {
        console.error(`Error deleting item ${id}:`, error);
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false, 
          error: error instanceof Error ? error : new Error(String(error))
        }));
        throw error;
      }
    }, [repository, autoLoad]);
    
    // Reset the error state
    const resetError = useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, []);
    
    // Load items on mount if requested
    useEffect(() => {
      if (loadOnMount && autoLoad) {
        loadItems();
      }
    }, [loadOnMount, autoLoad, loadItems]);
    
    return {
      ...state,
      loadItems,
      loadItem,
      createItem,
      updateItem,
      deleteItem,
      resetError
    };
  };
}

/**
 * Repository factory function type
 */
export type RepositoryFactory<T extends { id: ID }, ID = string | number> = 
  (deps: ReturnType<typeof useData>) => BaseRepository<T, ID>;

/**
 * Create a custom repository hook with options
 */
export function createCustomRepositoryHook<T extends { id: ID }, ID = string | number>(
  repositoryFactory: RepositoryFactory<T, ID>
) {
  return createRepositoryHook<T, ID>(repositoryFactory);
} 