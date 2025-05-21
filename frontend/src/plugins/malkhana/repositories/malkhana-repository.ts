import { 
  ApiClient, 
  DataContextValue
} from '../../../core/data';
import { 
  MalkhanaItem, 
  ShelfInfo, 
  MalkhanaStats,
  CreateMalkhanaItemDto,
  UpdateMalkhanaItemDto,
  DisposeItemDto,
  AssignToShelfDto,
  YearTransitionDto,
  YearTransitionResponseDto,
  CreateShelfDto,
  UpdateShelfDto
} from '../types';

/**
 * Repository for Malkhana evidence items - direct API implementation without caching
 */
export class MalkhanaRepository {
  private api: ApiClient;
  private basePath: string = '/malkhana';

  constructor(api: ApiClient) {
    this.api = api;
  }
  
  /**
   * Get statistics for Malkhana
   */
  async getStats(): Promise<MalkhanaStats> {
    return this.api.get<MalkhanaStats>(`${this.basePath}/stats`);
  }

  /**
   * Get all Black Ink (current year) items
   */
  async getBlackInkItems(): Promise<MalkhanaItem[]> {
    return this.api.get<MalkhanaItem[]>(`${this.basePath}/black-ink`);
  }

  /**
   * Get all Red Ink (historical) items
   */
  async getRedInkItems(): Promise<MalkhanaItem[]> {
    return this.api.get<MalkhanaItem[]>(`${this.basePath}/red-ink`);
  }

  /**
   * Get item by ID
   */
  async getItemById(id: string): Promise<MalkhanaItem> {
    return this.api.get<MalkhanaItem>(`${this.basePath}/items/${id}`);
  }

  /**
   * Search items by query
   */
  async searchItems(query: string): Promise<MalkhanaItem[]> {
    return this.api.get<MalkhanaItem[]>(`${this.basePath}/search?query=${encodeURIComponent(query)}`);
  }

  /**
   * Find item by mother number
   */
  async findByMotherNumber(motherNumber: string): Promise<MalkhanaItem> {
    return this.api.get<MalkhanaItem>(`${this.basePath}/mother-number/${motherNumber}`);
  }

  /**
   * Create a new item
   */
  async createItem(item: CreateMalkhanaItemDto): Promise<MalkhanaItem> {
    return this.api.post<MalkhanaItem>(`${this.basePath}/items`, item);
  }

  /**
   * Update an existing item
   */
  async updateItem(id: string, updates: UpdateMalkhanaItemDto): Promise<MalkhanaItem> {
    return this.api.put<MalkhanaItem>(`${this.basePath}/items/${id}`, updates);
  }

  /**
   * Dispose of an item
   */
  async disposeItem(id: string, disposalData: DisposeItemDto): Promise<MalkhanaItem> {
    return this.api.post<MalkhanaItem>(`${this.basePath}/items/${id}/dispose`, disposalData);
  }

  /**
   * Assign an item to a shelf
   */
  async assignToShelf(id: string, assignDto: AssignToShelfDto): Promise<MalkhanaItem> {
    return this.api.post<MalkhanaItem>(`${this.basePath}/items/${id}/assign-shelf`, assignDto);
  }

  /**
   * Perform year transition (Black Ink to Red Ink)
   */
  async performYearTransition(yearTransitionDto: YearTransitionDto): Promise<YearTransitionResponseDto> {
    return this.api.post<YearTransitionResponseDto>(`${this.basePath}/year-transition`, yearTransitionDto);
  }

  // Shelf related methods
  /**
   * Get all shelves
   */
  async getAllShelves(): Promise<ShelfInfo[]> {
    return this.api.get<ShelfInfo[]>(`${this.basePath}/shelves`);
  }

  /**
   * Get a shelf by ID
   */
  async getShelfById(id: string): Promise<ShelfInfo> {
    return this.api.get<ShelfInfo>(`${this.basePath}/shelves/${id}`);
  }

  /**
   * Create a new shelf
   */
  async createShelf(shelf: CreateShelfDto): Promise<ShelfInfo> {
    return this.api.post<ShelfInfo>(`${this.basePath}/shelves`, shelf);
  }

  /**
   * Update an existing shelf
   */
  async updateShelf(id: string, updates: UpdateShelfDto): Promise<ShelfInfo> {
    return this.api.put<ShelfInfo>(`${this.basePath}/shelves/${id}`, updates);
  }

  /**
   * Delete a shelf
   */
  async deleteShelf(id: string): Promise<void> {
    return this.api.delete(`${this.basePath}/shelves/${id}`);
  }

  /**
   * Get all items on a shelf
   */
  async getShelfItems(id: string): Promise<MalkhanaItem[]> {
    return this.api.get<MalkhanaItem[]>(`${this.basePath}/shelves/${id}/items`);
  }
}

/**
 * Create a repository factory function
 */
export const createMalkhanaRepository = (deps: DataContextValue): MalkhanaRepository => {
  return new MalkhanaRepository(deps.api);
};

/**
 * Create a custom hook for using the Malkhana repository
 */
export const useMalkhanaRepository = () => {
  // Assuming useData hook is available in the component that uses this hook
  // This hook needs to be called from within a component that has access to the DataContext
  // Import useData from '../../core/data'; in the component file
  return {
    repository: null as unknown as MalkhanaRepository,
    initialize: (api: ApiClient) => {
      return new MalkhanaRepository(api);
    }
  };
}; 