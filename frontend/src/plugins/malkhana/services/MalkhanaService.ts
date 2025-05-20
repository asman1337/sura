import { v4 as uuidv4 } from 'uuid';
import { 
  MalkhanaItem, 
  BlackInkRegistry, 
  RedInkRegistry, 
  MalkhanaItemStatus,
  MalkhanaStats
} from '../types';

/**
 * Service for managing Malkhana data
 */
class MalkhanaService {
  private blackInkKey = 'malkhana_black_ink';
  private redInkKey = 'malkhana_red_ink';
  
  /**
   * Get the current year's Black Ink registry
   */
  async getBlackInkRegistry(): Promise<BlackInkRegistry> {
    const currentYear = new Date().getFullYear();
    const storedRegistry = localStorage.getItem(this.blackInkKey);
    
    if (storedRegistry) {
      const registry = JSON.parse(storedRegistry) as BlackInkRegistry;
      
      // If the stored registry is for a previous year, transition to Red Ink
      if (registry.year < currentYear) {
        await this.transitionToNewYear(currentYear);
        return this.getBlackInkRegistry();
      }
      
      return registry;
    }
    
    // Initialize new Black Ink registry for current year
    const newRegistry: BlackInkRegistry = {
      year: currentYear,
      items: [],
      lastRegistryNumber: 0
    };
    
    localStorage.setItem(this.blackInkKey, JSON.stringify(newRegistry));
    return newRegistry;
  }
  
  /**
   * Get the Red Ink registry (historical items)
   */
  async getRedInkRegistry(): Promise<RedInkRegistry> {
    const storedRegistry = localStorage.getItem(this.redInkKey);
    
    if (storedRegistry) {
      return JSON.parse(storedRegistry) as RedInkRegistry;
    }
    
    // Initialize new Red Ink registry
    const newRegistry: RedInkRegistry = {
      items: [],
      lastRegistryNumber: 0
    };
    
    localStorage.setItem(this.redInkKey, JSON.stringify(newRegistry));
    return newRegistry;
  }
  
  /**
   * Add a new item to the Black Ink registry
   */
  async addItem(item: Omit<MalkhanaItem, 'id' | 'registryNumber' | 'registryType' | 'registryYear'>): Promise<MalkhanaItem> {
    const blackInk = await this.getBlackInkRegistry();
    const currentYear = new Date().getFullYear();
    
    // Create new item
    const newItem: MalkhanaItem = {
      ...item,
      id: uuidv4(),
      registryNumber: blackInk.lastRegistryNumber + 1,
      registryType: 'BLACK_INK',
      registryYear: currentYear,
      status: 'ACTIVE'
    };
    
    // Update registry
    blackInk.items.push(newItem);
    blackInk.lastRegistryNumber = newItem.registryNumber;
    
    // Save to storage
    localStorage.setItem(this.blackInkKey, JSON.stringify(blackInk));
    
    return newItem;
  }
  
  /**
   * Update an existing item in either registry
   */
  async updateItem(id: string, itemData: Partial<MalkhanaItem>): Promise<MalkhanaItem> {
    // First check Black Ink
    const blackInk = await this.getBlackInkRegistry();
    const blackInkIndex = blackInk.items.findIndex(i => i.id === id);
    
    if (blackInkIndex !== -1) {
      // Update item in Black Ink
      const existingItem = blackInk.items[blackInkIndex];
      const updatedItem = { ...existingItem, ...itemData };
      
      blackInk.items[blackInkIndex] = updatedItem;
      localStorage.setItem(this.blackInkKey, JSON.stringify(blackInk));
      
      return updatedItem;
    }
    
    // If not in Black Ink, check Red Ink
    const redInk = await this.getRedInkRegistry();
    const redInkIndex = redInk.items.findIndex(i => i.id === id);
    
    if (redInkIndex !== -1) {
      // Update item in Red Ink
      const existingItem = redInk.items[redInkIndex];
      const updatedItem = { ...existingItem, ...itemData };
      
      redInk.items[redInkIndex] = updatedItem;
      localStorage.setItem(this.redInkKey, JSON.stringify(redInk));
      
      return updatedItem;
    }
    
    throw new Error(`Item with ID ${id} not found in either registry`);
  }
  
  /**
   * Dispose an item (mark as disposed and update registry)
   */
  async disposeItem(
    itemId: string, 
    disposalInfo: { disposalDate: string; disposalReason: string; disposalApprovedBy: string }
  ): Promise<MalkhanaItem | null> {
    // Check Black Ink first
    const blackInk = await this.getBlackInkRegistry();
    let item = blackInk.items.find(i => i.id === itemId);
    let registry = 'BLACK_INK';
    
    // If not in Black Ink, check Red Ink
    if (!item) {
      const redInk = await this.getRedInkRegistry();
      item = redInk.items.find(i => i.id === itemId);
      registry = 'RED_INK';
    }
    
    if (!item) {
      return null;
    }
    
    // Update item with disposal information
    const updatedItem: MalkhanaItem = {
      ...item,
      status: 'DISPOSED',
      disposalDate: disposalInfo.disposalDate,
      disposalReason: disposalInfo.disposalReason,
      disposalApprovedBy: disposalInfo.disposalApprovedBy
    };
    
    // Update the registry
    if (registry === 'BLACK_INK') {
      const index = blackInk.items.findIndex(i => i.id === itemId);
      blackInk.items[index] = updatedItem;
      localStorage.setItem(this.blackInkKey, JSON.stringify(blackInk));
    } else {
      const redInk = await this.getRedInkRegistry();
      
      // Remove the disposed item
      const index = redInk.items.findIndex(i => i.id === itemId);
      redInk.items.splice(index, 1);
      
      // Renumber remaining items
      for (let i = index; i < redInk.items.length; i++) {
        redInk.items[i].registryNumber = i + 1;
      }
      
      // Update last registry number
      redInk.lastRegistryNumber = redInk.items.length;
      
      localStorage.setItem(this.redInkKey, JSON.stringify(redInk));
    }
    
    return updatedItem;
  }
  
  /**
   * Transition from one year to the next
   * Moves all active items from Black Ink to Red Ink
   */
  async transitionToNewYear(newYear: number): Promise<void> {
    const blackInk = await this.getBlackInkRegistry();
    const redInk = await this.getRedInkRegistry();
    
    // Filter active items from Black Ink
    const activeItems = blackInk.items.filter(item => item.status === 'ACTIVE');
    
    // Add these items to Red Ink with updated registry numbers
    activeItems.forEach(item => {
      redInk.lastRegistryNumber++;
      
      const updatedItem: MalkhanaItem = {
        ...item,
        registryNumber: redInk.lastRegistryNumber,
        registryType: 'RED_INK'
      };
      
      redInk.items.push(updatedItem);
    });
    
    // Create new Black Ink registry for the new year
    const newBlackInk: BlackInkRegistry = {
      year: newYear,
      items: [],
      lastRegistryNumber: 0
    };
    
    // Save both registries
    localStorage.setItem(this.redInkKey, JSON.stringify(redInk));
    localStorage.setItem(this.blackInkKey, JSON.stringify(newBlackInk));
  }
  
  /**
   * Get Malkhana statistics
   */
  async getStats(): Promise<MalkhanaStats> {
    const blackInk = await this.getBlackInkRegistry();
    const redInk = await this.getRedInkRegistry();
    
    const blackInkItems = blackInk.items.length;
    const redInkItems = redInk.items.length;
    
    // Count disposed items in both registries
    const disposedItems = 
      blackInk.items.filter(item => item.status === 'DISPOSED').length;
    
    // Count recently added items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyAddedItems = blackInk.items.filter(item => {
      const receivedDate = new Date(item.dateReceived);
      return receivedDate >= thirtyDaysAgo;
    }).length;
    
    return {
      totalItems: blackInkItems + redInkItems,
      blackInkItems,
      redInkItems,
      disposedItems,
      recentlyAddedItems
    };
  }
  
  /**
   * Search for items across both registries
   */
  async searchItems(query: string): Promise<MalkhanaItem[]> {
    const blackInk = await this.getBlackInkRegistry();
    const redInk = await this.getRedInkRegistry();
    
    const allItems = [...blackInk.items, ...redInk.items];
    const lowerQuery = query.toLowerCase();
    
    return allItems.filter(item => 
      item.caseNumber.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.receivedFrom.toLowerCase().includes(lowerQuery)
    );
  }
}

export const malkhanaService = new MalkhanaService(); 