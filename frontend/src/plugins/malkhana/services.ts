import { Plugin } from '../../core/plugins';
import { ApiClient } from '../../core/data';
import { setItems, setLoading, setError, setSelectedItem } from './store';
import { 
  MalkhanaItem, 
  ShelfInfo, 
  MalkhanaStats 
} from './types';

// Single global API instance for use with the hook pattern
let globalApiInstance: ApiClient | null = null;

/**
 * Set the global API instance from a component using useData
 * This should be called from a component that has access to the DataContext
 */
export function setGlobalApiInstance(api: ApiClient) {
  if (!globalApiInstance) {
    console.log('Setting global API instance for Malkhana plugin');
    globalApiInstance = api;
  }
}

/**
 * Get the global API instance
 */
export function getGlobalApiInstance(): ApiClient | null {
  return globalApiInstance;
}

// Real API service for Malkhana
class MalkhanaService {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getStats(): Promise<MalkhanaStats> {
    try {
      return await this.api.get<MalkhanaStats>('/malkhana/stats');
    } catch (error) {
      console.error('Error fetching malkhana stats:', error);
      throw error;
    }
  }

  async getBlackInkItems(): Promise<MalkhanaItem[]> {
    try {
      return await this.api.get<MalkhanaItem[]>('/malkhana/black-ink');
    } catch (error) {
      console.error('Error fetching black ink items:', error);
      throw error;
    }
  }

  async getRedInkItems(): Promise<MalkhanaItem[]> {
    try {
      return await this.api.get<MalkhanaItem[]>('/malkhana/red-ink');
    } catch (error) {
      console.error('Error fetching red ink items:', error);
      throw error;
    }
  }

  async getItemById(id: string): Promise<MalkhanaItem> {
    try {
      return await this.api.get<MalkhanaItem>(`/malkhana/items/${id}`);
    } catch (error) {
      console.error(`Error fetching malkhana item ${id}:`, error);
      throw error;
    }
  }

  async searchItems(query: string): Promise<MalkhanaItem[]> {
    try {
      return await this.api.get<MalkhanaItem[]>(`/malkhana/search?query=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error searching malkhana items:', error);
      throw error;
    }
  }

  async findByMotherNumber(motherNumber: string): Promise<MalkhanaItem> {
    try {
      return await this.api.get<MalkhanaItem>(`/malkhana/mother-number/${motherNumber}`);
    } catch (error) {
      console.error(`Error finding item with mother number ${motherNumber}:`, error);
      throw error;
    }
  }

  async createItem(item: Omit<MalkhanaItem, 'id'>): Promise<MalkhanaItem> {
    try {
      return await this.api.post<MalkhanaItem>('/malkhana/items', item);
    } catch (error) {
      console.error('Error creating malkhana item:', error);
      throw error;
    }
  }

  async updateItem(id: string, updates: Partial<MalkhanaItem>): Promise<MalkhanaItem> {
    try {
      return await this.api.put<MalkhanaItem>(`/malkhana/items/${id}`, updates);
    } catch (error) {
      console.error(`Error updating malkhana item ${id}:`, error);
      throw error;
    }
  }

  async disposeItem(id: string, disposalData: { disposalDate: Date, disposalReason: string }): Promise<MalkhanaItem> {
    try {
      return await this.api.post<MalkhanaItem>(`/malkhana/items/${id}/dispose`, disposalData);
    } catch (error) {
      console.error(`Error disposing malkhana item ${id}:`, error);
      throw error;
    }
  }

  async generateQRCode(id: string): Promise<{ qrCodeUrl: string }> {
    try {
      return await this.api.post<{ qrCodeUrl: string }>(`/malkhana/items/${id}/qr-code`, {});
    } catch (error) {
      console.error(`Error generating QR code for item ${id}:`, error);
      throw error;
    }
  }

  async assignToShelf(id: string, shelfId: string): Promise<MalkhanaItem> {
    try {
      return await this.api.post<MalkhanaItem>(`/malkhana/items/${id}/assign-shelf`, { shelfId });
    } catch (error) {
      console.error(`Error assigning item ${id} to shelf:`, error);
      throw error;
    }
  }

  async performYearTransition(newYear: number): Promise<{ transitionedCount: number; newRedInkItems: MalkhanaItem[] }> {
    try {
      return await this.api.post<{ transitionedCount: number; newRedInkItems: MalkhanaItem[] }>('/malkhana/year-transition', { newYear });
    } catch (error) {
      console.error('Error performing year transition:', error);
      throw error;
    }
  }

  // Shelf related methods
  async getAllShelves(): Promise<ShelfInfo[]> {
    try {
      return await this.api.get<ShelfInfo[]>('/malkhana/shelves');
    } catch (error) {
      console.error('Error fetching shelves:', error);
      throw error;
    }
  }

  async getShelfById(id: string): Promise<ShelfInfo> {
    try {
      return await this.api.get<ShelfInfo>(`/malkhana/shelves/${id}`);
    } catch (error) {
      console.error(`Error fetching shelf ${id}:`, error);
      throw error;
    }
  }

  async createShelf(shelf: Omit<ShelfInfo, 'id'>): Promise<ShelfInfo> {
    try {
      return await this.api.post<ShelfInfo>('/malkhana/shelves', shelf);
    } catch (error) {
      console.error('Error creating shelf:', error);
      throw error;
    }
  }

  async updateShelf(id: string, updates: Partial<ShelfInfo>): Promise<ShelfInfo> {
    try {
      return await this.api.put<ShelfInfo>(`/malkhana/shelves/${id}`, updates);
    } catch (error) {
      console.error(`Error updating shelf ${id}:`, error);
      throw error;
    }
  }

  async deleteShelf(id: string): Promise<void> {
    try {
      await this.api.delete(`/malkhana/shelves/${id}`);
    } catch (error) {
      console.error(`Error deleting shelf ${id}:`, error);
      throw error;
    }
  }

  async getShelfItems(id: string): Promise<MalkhanaItem[]> {
    try {
      return await this.api.get<MalkhanaItem[]>(`/malkhana/shelves/${id}/items`);
    } catch (error) {
      console.error(`Error fetching items for shelf ${id}:`, error);
      throw error;
    }
  }

  async generateShelfQRCode(id: string): Promise<{ qrCodeUrl: string }> {
    try {
      return await this.api.post<{ qrCodeUrl: string }>(`/malkhana/shelves/${id}/qr-code`, {});
    } catch (error) {
      console.error(`Error generating QR code for shelf ${id}:`, error);
      throw error;
    }
  }
}

// Singleton instance of MalkhanaService
let malkhanaServiceInstance: MalkhanaService | null = null;

/**
 * Get the MalkhanaService instance
 * If the service doesn't exist yet, it will be created when setGlobalApiInstance is called
 */
export function getMalkhanaService(): MalkhanaService | null {
  // Create the service if the API is available but service hasn't been created yet
  if (!malkhanaServiceInstance && globalApiInstance) {
    malkhanaServiceInstance = new MalkhanaService(globalApiInstance);
  }
  return malkhanaServiceInstance;
}

// Export the service initialization
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana services dummy initialization - real initialization will happen in components');
    
    // Register API thunks that will use the global API instance when available
    registerThunks(plugin);
    
    // Return an empty object as we're using the global API pattern
    return { initialized: true };
  }
};

// Helper function to register all thunks
function registerThunks(plugin: Plugin) {
  plugin.registerExtensionPoint(
    'store:thunks',
    {
      name: 'fetchBlackInkItems',
      thunk: () => async (dispatch: any) => {
        dispatch(setLoading(true));
        try {
          const service = getMalkhanaService();
          if (!service) {
            throw new Error('Malkhana service not initialized yet');
          }
          const items = await service.getBlackInkItems();
          dispatch(setItems(items));
        } catch (error) {
          dispatch(setError((error as Error).message));
        } finally {
          dispatch(setLoading(false));
        }
      }
    }
  );
  
  plugin.registerExtensionPoint(
    'store:thunks',
    {
      name: 'fetchRedInkItems',
      thunk: () => async (dispatch: any) => {
        dispatch(setLoading(true));
        try {
          const service = getMalkhanaService();
          if (!service) {
            throw new Error('Malkhana service not initialized yet');
          }
          const items = await service.getRedInkItems();
          dispatch(setItems(items));
        } catch (error) {
          dispatch(setError((error as Error).message));
        } finally {
          dispatch(setLoading(false));
        }
      }
    }
  );
  
  plugin.registerExtensionPoint(
    'store:thunks',
    {
      name: 'fetchItemById',
      thunk: (id: string) => async (dispatch: any) => {
        dispatch(setLoading(true));
        try {
          const service = getMalkhanaService();
          if (!service) {
            throw new Error('Malkhana service not initialized yet');
          }
          const item = await service.getItemById(id);
          dispatch(setSelectedItem(item));
          dispatch(setLoading(false));
        } catch (error) {
          dispatch(setError((error as Error).message));
          dispatch(setLoading(false));
        }
      }
    }
  );
} 