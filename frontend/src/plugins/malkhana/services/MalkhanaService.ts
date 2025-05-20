import { v4 as uuidv4 } from 'uuid';
import { 
  MalkhanaItem, 
  BlackInkRegistry, 
  RedInkRegistry, 
  MalkhanaStats,
  ShelfInfo,
  ShelfRegistry,
  RedInkHistoryEntry
} from '../types';

/**
 * Service for managing Malkhana data
 */
class MalkhanaService {
  private blackInkKey = 'malkhana_black_ink';
  private redInkKey = 'malkhana_red_ink';
  private shelfRegistryKey = 'malkhana_shelves';
  
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
  async addItem(item: Omit<MalkhanaItem, 'id' | 'registryNumber' | 'registryType' | 'registryYear' | 'motherNumber' | 'redInkHistory'>): Promise<MalkhanaItem> {
    const blackInk = await this.getBlackInkRegistry();
    const currentYear = new Date().getFullYear();
    const newRegistryNumber = blackInk.lastRegistryNumber + 1;
    
    // Generate motherNumber - format: YYYY-NNNNN (zero-padded)
    const motherNumber = `${currentYear}-${newRegistryNumber.toString().padStart(5, '0')}`;
    
    // Create new item
    const newItem: MalkhanaItem = {
      ...item,
      id: uuidv4(),
      registryNumber: newRegistryNumber,
      motherNumber: motherNumber,
      registryType: 'BLACK_INK',
      registryYear: currentYear,
      status: 'ACTIVE',
      redInkHistory: [], // Initialize empty history for new item
    };
    
    // Generate QR code URL if needed
    if (!newItem.qrCodeUrl) {
      newItem.qrCodeUrl = await this.generateQRCode(newItem);
    }
    
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
      redInk.items[index] = updatedItem; // Keep the item but mark as disposed
      
      // Save the current state before renumbering
      const disposedYear = new Date().getFullYear();
      
      // For disposed Red Ink items, we don't remove them but keep them marked as disposed
      // This preserves the item's history while still showing it's been disposed
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
    let nextRegistryNumber = redInk.lastRegistryNumber + 1;
    
    for (const item of activeItems) {
      // Store previous red ink id in history if it's not the first transition
      if (item.registryType === 'RED_INK') {
        // Initialize history array if not exists
        if (!item.redInkHistory) {
          item.redInkHistory = [];
        }
        
        // Add previous ID to history
        const historyEntry: RedInkHistoryEntry = {
          year: item.registryYear,
          redInkId: item.registryNumber
        };
        
        item.redInkHistory.push(historyEntry);
      }
      
      // Update item for Red Ink
      const redInkItem: MalkhanaItem = {
        ...item,
        registryNumber: nextRegistryNumber++,
        registryType: 'RED_INK',
        registryYear: blackInk.year // Previous year (the year it was in black ink)
      };
      
      redInk.items.push(redInkItem);
    }
    
    // Update Red Ink registry
    redInk.lastRegistryNumber = nextRegistryNumber - 1;
    localStorage.setItem(this.redInkKey, JSON.stringify(redInk));
    
    // Create new Black Ink registry for new year
    const newBlackInk: BlackInkRegistry = {
      year: newYear,
      items: [],
      lastRegistryNumber: 0
    };
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
    const disposedItems = [
      ...blackInk.items.filter(item => item.status === 'DISPOSED'),
      ...redInk.items.filter(item => item.status === 'DISPOSED')
    ].length;
    
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
      item.receivedFrom.toLowerCase().includes(lowerQuery) ||
      (item.motherNumber && item.motherNumber.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Find an item by motherNumber
   */
  async findByMotherNumber(motherNumber: string): Promise<MalkhanaItem | null> {
    const blackInk = await this.getBlackInkRegistry();
    const redInk = await this.getRedInkRegistry();
    
    // First check Black Ink
    let item = blackInk.items.find(i => i.motherNumber === motherNumber);
    
    // If not found, check Red Ink
    if (!item) {
      item = redInk.items.find(i => i.motherNumber === motherNumber);
    }
    
    return item || null;
  }

  /**
   * Get shelf registry
   */
  async getShelfRegistry(): Promise<ShelfRegistry> {
    const storedRegistry = localStorage.getItem(this.shelfRegistryKey);
    
    if (storedRegistry) {
      return JSON.parse(storedRegistry) as ShelfRegistry;
    }
    
    // Initialize new shelf registry
    const newRegistry: ShelfRegistry = {
      shelves: []
    };
    
    localStorage.setItem(this.shelfRegistryKey, JSON.stringify(newRegistry));
    return newRegistry;
  }
  
  /**
   * Add a new shelf
   */
  async addShelf(shelf: Omit<ShelfInfo, 'id'>): Promise<ShelfInfo> {
    const registry = await this.getShelfRegistry();
    
    const newShelf: ShelfInfo = {
      ...shelf,
      id: uuidv4()
    };
    
    registry.shelves.push(newShelf);
    localStorage.setItem(this.shelfRegistryKey, JSON.stringify(registry));
    
    return newShelf;
  }
  
  /**
   * Get items by shelf ID
   */
  async getItemsByShelf(shelfId: string): Promise<MalkhanaItem[]> {
    const blackInk = await this.getBlackInkRegistry();
    const redInk = await this.getRedInkRegistry();
    
    const items = [
      ...blackInk.items,
      ...redInk.items
    ].filter(item => item.shelfId === shelfId);
    
    return items;
  }
  
  /**
   * Generate QR code for an item
   * In a real implementation, this would call an API to generate a QR code
   * For this example, we'll just return a mock URL
   */
  async generateQRCode(item: Partial<MalkhanaItem>): Promise<string> {
    // In a real implementation, call an API to generate QR code
    // For now, return a mock URL that encodes the motherNumber or ID
    const identifier = item.motherNumber || item.id;
    return `https://api.example.com/qr/malkhana/${identifier}`;
  }

  /**
   * Generate QR code for a shelf
   */
  async generateShelfQRCode(shelfId: string): Promise<string> {
    return `https://api.example.com/qr/shelf/${shelfId}`;
  }

  /**
   * Assign an item to a shelf
   */
  async assignItemToShelf(itemId: string, shelfId: string): Promise<MalkhanaItem> {
    // Get shelf info
    const shelfRegistry = await this.getShelfRegistry();
    const shelf = shelfRegistry.shelves.find(s => s.id === shelfId);
    
    if (!shelf) {
      throw new Error(`Shelf with ID ${shelfId} not found`);
    }
    
    // Update item with shelf info
    return this.updateItem(itemId, {
      shelfId: shelfId,
      shelfLocation: shelf.location
    });
  }
}

export const malkhanaService = new MalkhanaService(); 