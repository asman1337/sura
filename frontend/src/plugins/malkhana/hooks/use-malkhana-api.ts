import { useState, useEffect } from 'react';
import { useData } from '../../../core/data';
import { MalkhanaRepository } from '../repositories';
import { MalkhanaItem, ShelfInfo, MalkhanaStats } from '../types';
import { setGlobalApiInstance, getMalkhanaService } from '../services';

/**
 * Custom hook for using Malkhana API in components
 * Provides direct API access without caching for real-time data
 */
export function useMalkhanaApi() {
  const { api } = useData();
  const [repository, setRepository] = useState<MalkhanaRepository | null>(null);
  
  // Initialize repository and set global API instance
  useEffect(() => {
    if (api) {
      // Set the global API instance for the service singleton pattern
      setGlobalApiInstance(api);
      
      // Still create a repository instance for this component
      setRepository(new MalkhanaRepository(api));
    }
  }, [api]);
  
  // Get the global service instance
  const service = getMalkhanaService();
  
  return {
    // Expose all repository methods with null check safety
    
    // Stats
    getStats: async (): Promise<MalkhanaStats | null> => {
      // Try service first (preferred)
      if (service) {
        return service.getStats();
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.getStats();
    },
    
    // Items
    getBlackInkItems: async (): Promise<MalkhanaItem[]> => {
      // Try service first (preferred)
      if (service) {
        return service.getBlackInkItems();
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return [];
      return repository.getBlackInkItems();
    },
    
    getRedInkItems: async (): Promise<MalkhanaItem[]> => {
      // Try service first (preferred)
      if (service) {
        return service.getRedInkItems();
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return [];
      return repository.getRedInkItems();
    },
    
    getItemById: async (id: string): Promise<MalkhanaItem | null> => {
      try {
        // Try service first (preferred)
        if (service) {
          return await service.getItemById(id);
        }
        
        // Fallback to repository if service not ready yet
        if (!repository) return null;
        return await repository.getItemById(id);
      } catch (error) {
        console.error(`Error fetching item ${id}:`, error);
        return null;
      }
    },
    
    searchItems: async (query: string): Promise<MalkhanaItem[]> => {
      // Try service first (preferred)
      if (service) {
        return service.searchItems(query);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return [];
      return repository.searchItems(query);
    },
    
    findByMotherNumber: async (motherNumber: string): Promise<MalkhanaItem | null> => {
      try {
        // Try service first (preferred)
        if (service) {
          return await service.findByMotherNumber(motherNumber);
        }
        
        // Fallback to repository if service not ready yet
        if (!repository) return null;
        return await repository.findByMotherNumber(motherNumber);
      } catch (error) {
        console.error(`Error finding item with mother number ${motherNumber}:`, error);
        return null;
      }
    },
    
    createItem: async (item: Omit<MalkhanaItem, 'id'>): Promise<MalkhanaItem | null> => {
      // Try service first (preferred)
      if (service) {
        return service.createItem(item);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.createItem(item);
    },
    
    updateItem: async (id: string, updates: Partial<MalkhanaItem>): Promise<MalkhanaItem | null> => {
      // Try service first (preferred)
      if (service) {
        return service.updateItem(id, updates);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.updateItem(id, updates);
    },
    
    disposeItem: async (id: string, disposalData: { disposalDate: Date, disposalReason: string }): Promise<MalkhanaItem | null> => {
      // Try service first (preferred)
      if (service) {
        return service.disposeItem(id, disposalData);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.disposeItem(id, disposalData);
    },
    
    generateQRCode: async (id: string): Promise<{ qrCodeUrl: string } | null> => {
      // Try service first (preferred)
      if (service) {
        return service.generateQRCode(id);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.generateQRCode(id);
    },
    
    assignToShelf: async (id: string, shelfId: string): Promise<MalkhanaItem | null> => {
      // Try service first (preferred)
      if (service) {
        return service.assignToShelf(id, shelfId);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.assignToShelf(id, shelfId);
    },
    
    performYearTransition: async (newYear: number): Promise<{ transitionedCount: number; newRedInkItems: MalkhanaItem[] } | null> => {
      // Try service first (preferred)
      if (service) {
        return service.performYearTransition(newYear);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.performYearTransition(newYear);
    },
    
    // Shelves
    getAllShelves: async (): Promise<ShelfInfo[]> => {
      // Try service first (preferred)
      if (service) {
        return service.getAllShelves();
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return [];
      return repository.getAllShelves();
    },
    
    getShelfById: async (id: string): Promise<ShelfInfo | null> => {
      try {
        // Try service first (preferred)
        if (service) {
          return await service.getShelfById(id);
        }
        
        // Fallback to repository if service not ready yet
        if (!repository) return null;
        return await repository.getShelfById(id);
      } catch (error) {
        console.error(`Error fetching shelf ${id}:`, error);
        return null;
      }
    },
    
    createShelf: async (shelf: Omit<ShelfInfo, 'id'>): Promise<ShelfInfo | null> => {
      // Try service first (preferred)
      if (service) {
        return service.createShelf(shelf);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.createShelf(shelf);
    },
    
    updateShelf: async (id: string, updates: Partial<ShelfInfo>): Promise<ShelfInfo | null> => {
      // Try service first (preferred)
      if (service) {
        return service.updateShelf(id, updates);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.updateShelf(id, updates);
    },
    
    deleteShelf: async (id: string): Promise<boolean> => {
      try {
        // Try service first (preferred)
        if (service) {
          await service.deleteShelf(id);
          return true;
        }
        
        // Fallback to repository if service not ready yet
        if (!repository) return false;
        await repository.deleteShelf(id);
        return true;
      } catch (error) {
        console.error(`Error deleting shelf ${id}:`, error);
        return false;
      }
    },
    
    getShelfItems: async (id: string): Promise<MalkhanaItem[]> => {
      // Try service first (preferred)
      if (service) {
        return service.getShelfItems(id);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return [];
      return repository.getShelfItems(id);
    },
    
    generateShelfQRCode: async (id: string): Promise<{ qrCodeUrl: string } | null> => {
      // Try service first (preferred)
      if (service) {
        return service.generateShelfQRCode(id);
      }
      
      // Fallback to repository if service not ready yet
      if (!repository) return null;
      return repository.generateShelfQRCode(id);
    },
    
    // Repository status - consider it ready if either service or repository is ready
    isReady: !!repository || !!service
  };
} 