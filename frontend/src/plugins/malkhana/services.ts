import { Plugin } from '../../core/plugins';
import { setItems, setLoading, setError } from './store';

// Mock API service for Malkhana
class MalkhanaService {
  async getItems() {
    try {
      // This would be a real API call in production
      return Promise.resolve([
        { id: 1, name: 'Evidence Item 1', caseId: 'FIR-2023-001', addedOn: '2023-01-01' },
        { id: 2, name: 'Evidence Item 2', caseId: 'FIR-2023-002', addedOn: '2023-01-02' },
        { id: 3, name: 'Evidence Item 3', caseId: 'FIR-2023-003', addedOn: '2023-01-03' },
      ]);
    } catch (error) {
      console.error('Error fetching malkhana items:', error);
      throw error;
    }
  }

  async getItemById(id: string | number) {
    try {
      // This would be a real API call in production
      return Promise.resolve({
        id,
        name: `Evidence Item ${id}`,
        caseId: `FIR-2023-00${id}`,
        addedOn: '2023-01-01',
        description: 'Sample evidence item description',
        location: 'Rack A, Shelf 2',
        status: 'In Storage'
      });
    } catch (error) {
      console.error(`Error fetching malkhana item ${id}:`, error);
      throw error;
    }
  }
}

// Export the service initialization
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana services initialized');
    
    // Create service instance
    const malkhanaService = new MalkhanaService();
    
    // Register the service for other plugins to use
    plugin.registerExtensionPoint(
      'services:register',
      {
        name: 'malkhanaService',
        service: malkhanaService
      }
    );
    
    // Create and register API thunks
    plugin.registerExtensionPoint(
      'store:thunks',
      {
        name: 'fetchMalkhanaItems',
        thunk: () => async (dispatch: any) => {
          dispatch(setLoading(true));
          try {
            const items = await malkhanaService.getItems();
            dispatch(setItems(items));
          } catch (error) {
            dispatch(setError((error as Error).message));
          }
        }
      }
    );
    
    // Return the service for other parts of the plugin to use
    return { malkhanaService };
  }
}; 