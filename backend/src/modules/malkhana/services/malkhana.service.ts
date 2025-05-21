import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { MalkhanaItem, MalkhanaItemStatus, RegistryType } from '../entities/malkhana-item.entity';
import { RedInkHistory } from '../entities/red-ink-history.entity';
import { Shelf } from '../entities/shelf.entity';
import { CreateMalkhanaItemDto } from '../dto/create-malkhana-item.dto';
import { UpdateMalkhanaItemDto } from '../dto/update-malkhana-item.dto';
import { DisposeItemDto } from '../dto/dispose-item.dto';
import { AssignToShelfDto } from '../dto/assign-to-shelf.dto';
import { MalkhanaStatsDto } from '../dto/malkhana-stats.dto';
import { YearTransitionResponseDto } from '../dto/year-transition.dto';
import { MalkhanaItemResponseDto } from '../dto/malkhana-item.response.dto';

@Injectable()
export class MalkhanaService {
  constructor(
    @InjectRepository(MalkhanaItem)
    private malkhanaItemRepository: Repository<MalkhanaItem>,
    
    @InjectRepository(RedInkHistory)
    private redInkHistoryRepository: Repository<RedInkHistory>,
    
    @InjectRepository(Shelf)
    private shelfRepository: Repository<Shelf>
  ) {}

  /**
   * Create a new item in the Black Ink registry
   */
  async createItem(createItemDto: CreateMalkhanaItemDto, userId?: string): Promise<MalkhanaItem> {
    const currentYear = new Date().getFullYear();
    
    // Get the last registry number used for Black Ink in the current year
    const lastItem = await this.malkhanaItemRepository.findOne({
      where: {
        registryType: RegistryType.BLACK_INK,
        registryYear: currentYear
      },
      order: { registryNumber: 'DESC' }
    });
    
    const newRegistryNumber = lastItem ? lastItem.registryNumber + 1 : 1;
    
    // Generate motherNumber (permanent ID)
    // Format: YYYY-NNNNN (zero-padded to 5 digits)
    const motherNumber = `${currentYear}-${newRegistryNumber.toString().padStart(5, '0')}`;
    
    // Create new item
    const newItem = this.malkhanaItemRepository.create({
      ...createItemDto,
      motherNumber,
      registryNumber: newRegistryNumber,
      registryType: RegistryType.BLACK_INK,
      registryYear: currentYear,
      status: MalkhanaItemStatus.ACTIVE,
      createdBy: userId
    });
    
    // If shelf ID is provided, verify it exists
    if (createItemDto.shelfId) {
      const shelf = await this.shelfRepository.findOne({
        where: { id: createItemDto.shelfId }
      });
      
      if (!shelf) {
        throw new NotFoundException(`Shelf with ID ${createItemDto.shelfId} not found`);
      }
    }
    
    // Save the new item
    return this.malkhanaItemRepository.save(newItem);
  }

  /**
   * Get all items in the Black Ink registry
   */
  async getBlackInkItems(): Promise<MalkhanaItem[]> {
    const currentYear = new Date().getFullYear();
    
    return this.malkhanaItemRepository.find({
      where: {
        registryType: RegistryType.BLACK_INK,
        registryYear: currentYear
      },
      relations: ['shelf', 'redInkHistory'],
      order: { registryNumber: 'ASC' }
    });
  }

  /**
   * Get all items in the Red Ink registry
   */
  async getRedInkItems(): Promise<MalkhanaItem[]> {
    return this.malkhanaItemRepository.find({
      where: {
        registryType: RegistryType.RED_INK
      },
      relations: ['shelf', 'redInkHistory'],
      order: { registryNumber: 'ASC' }
    });
  }

  /**
   * Get an item by ID
   */
  async getItemById(id: string): Promise<MalkhanaItem> {
    const item = await this.malkhanaItemRepository.findOne({
      where: { id },
      relations: ['shelf', 'redInkHistory']
    });
    
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    return item;
  }

  /**
   * Find an item by motherNumber (permanent ID)
   */
  async findByMotherNumber(motherNumber: string): Promise<MalkhanaItem | null> {
    return this.malkhanaItemRepository.findOne({
      where: { motherNumber },
      relations: ['shelf', 'redInkHistory']
    });
  }

  /**
   * Update an item by ID
   */
  async updateItem(id: string, updateItemDto: UpdateMalkhanaItemDto, userId?: string): Promise<MalkhanaItem> {
    const item = await this.getItemById(id);
    
    // If status is being changed to DISPOSED, don't allow through normal update
    if (updateItemDto.status === MalkhanaItemStatus.DISPOSED) {
      throw new BadRequestException('Use the disposeItem endpoint to dispose of an item');
    }
    
    // If shelf ID is provided, verify it exists
    if (updateItemDto.shelfId) {
      const shelf = await this.shelfRepository.findOne({
        where: { id: updateItemDto.shelfId }
      });
      
      if (!shelf) {
        throw new NotFoundException(`Shelf with ID ${updateItemDto.shelfId} not found`);
      }
    }
    
    // Update the item
    Object.assign(item, {
      ...updateItemDto,
      updatedBy: userId
    });
    
    return this.malkhanaItemRepository.save(item);
  }

  /**
   * Dispose an item
   */
  async disposeItem(id: string, disposeItemDto: DisposeItemDto, userId?: string): Promise<MalkhanaItem> {
    const item = await this.getItemById(id);
    
    // Check if item is already disposed
    if (item.status === MalkhanaItemStatus.DISPOSED) {
      throw new BadRequestException(`Item with ID ${id} is already disposed`);
    }
    
    // Update item with disposal information
    Object.assign(item, {
      ...disposeItemDto,
      status: MalkhanaItemStatus.DISPOSED,
      updatedBy: userId
    });
    
    // Save updated item
    const disposedItem = await this.malkhanaItemRepository.save(item);
    
    // If this is a Red Ink item, renumber all subsequent items
    if (item.registryType === RegistryType.RED_INK) {
      await this.renumberRedInkAfterDisposal(item.registryNumber);
    }
    
    return disposedItem;
  }

  /**
   * Renumber Red Ink items after a disposal
   * When a Red Ink item is disposed, all subsequent items should be renumbered
   */
  private async renumberRedInkAfterDisposal(disposedItemNumber: number): Promise<void> {
    // Find all Red Ink items with higher registry numbers
    const itemsToRenumber = await this.malkhanaItemRepository.find({
      where: {
        registryType: RegistryType.RED_INK,
        registryNumber: LessThan(disposedItemNumber),
        status: MalkhanaItemStatus.ACTIVE
      },
      order: { registryNumber: 'ASC' }
    });
    
    // No items to renumber
    if (itemsToRenumber.length === 0) {
      return;
    }
    
    // Create histories for all items before renumbering
    for (const item of itemsToRenumber) {
      const history = this.redInkHistoryRepository.create({
        itemId: item.id,
        year: new Date().getFullYear(),
        redInkId: item.registryNumber
      });
      await this.redInkHistoryRepository.save(history);
    }
    
    // Renumber items
    for (let i = 0; i < itemsToRenumber.length; i++) {
      const item = itemsToRenumber[i];
      item.registryNumber = disposedItemNumber + i;
      await this.malkhanaItemRepository.save(item);
    }
  }

  /**
   * Assign an item to a shelf
   */
  async assignToShelf(id: string, assignDto: AssignToShelfDto, userId: string): Promise<MalkhanaItem> {
    const item = await this.getItemById(id);
    const shelf = await this.shelfRepository.findOne({
      where: { id: assignDto.shelfId }
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${assignDto.shelfId} not found`);
    }
    
    // Update the item
    item.shelfId = shelf.id;
    item.updatedBy = userId;
    
    return this.malkhanaItemRepository.save(item);
  }

  /**
   * Perform the year-end transition from Black Ink to Red Ink
   * This will be manually triggered rather than automatic
   */
  async performYearTransition(newYear: number, userId?: string): Promise<YearTransitionResponseDto> {
    const currentYear = new Date().getFullYear();
    
    // Validate the new year
    if (newYear <= currentYear) {
      throw new BadRequestException('New year must be greater than the current year');
    }
    
    // Find all active items in the Black Ink registry
    const blackInkItems = await this.malkhanaItemRepository.find({
      where: {
        registryType: RegistryType.BLACK_INK,
        status: MalkhanaItemStatus.ACTIVE
      }
    });
    
    if (blackInkItems.length === 0) {
      return {
        success: true,
        message: 'No active items to transition',
        itemsTransitioned: 0,
        previousYear: currentYear,
        newYear
      };
    }
    
    // Find the highest Red Ink registry number
    const lastRedInkItem = await this.malkhanaItemRepository.findOne({
      where: { registryType: RegistryType.RED_INK },
      order: { registryNumber: 'DESC' }
    });
    
    let nextRedInkNumber = lastRedInkItem ? lastRedInkItem.registryNumber + 1 : 1;
    
    // Process each Black Ink item
    for (const item of blackInkItems) {
      // If item is already in Red Ink from a previous year, add to history
      if (item.registryType === RegistryType.RED_INK) {
        // Create a history entry
        const history = this.redInkHistoryRepository.create({
          itemId: item.id,
          year: item.registryYear,
          redInkId: item.registryNumber
        });
        await this.redInkHistoryRepository.save(history);
      }
      
      // Update the item for Red Ink
      item.registryType = RegistryType.RED_INK;
      item.registryNumber = nextRedInkNumber++;
      await this.malkhanaItemRepository.save(item);
    }
    
    return {
      success: true,
      message: `Transitioned ${blackInkItems.length} items from Black Ink to Red Ink`,
      itemsTransitioned: blackInkItems.length,
      previousYear: currentYear,
      newYear
    };
  }

  /**
   * Search for items across both registries
   */
  async searchItems(query: string): Promise<MalkhanaItem[]> {
    return this.malkhanaItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.shelf', 'shelf')
      .leftJoinAndSelect('item.redInkHistory', 'history')
      .where('item.motherNumber ILIKE :query', { query: `%${query}%` })
      .orWhere('item.caseNumber ILIKE :query', { query: `%${query}%` })
      .orWhere('item.description ILIKE :query', { query: `%${query}%` })
      .orWhere('item.category ILIKE :query', { query: `%${query}%` })
      .orWhere('item.receivedFrom ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  /**
   * Get Malkhana statistics
   */
  async getStats(): Promise<MalkhanaStatsDto> {
    const currentYear = new Date().getFullYear();
    
    // Count Black Ink items
    const blackInkItems = await this.malkhanaItemRepository.count({
      where: {
        registryType: RegistryType.BLACK_INK,
        registryYear: currentYear
      }
    });
    
    // Count Red Ink items
    const redInkItems = await this.malkhanaItemRepository.count({
      where: {
        registryType: RegistryType.RED_INK
      }
    });
    
    // Count disposed items
    const disposedItems = await this.malkhanaItemRepository.count({
      where: {
        status: MalkhanaItemStatus.DISPOSED
      }
    });
    
    // Count recently added items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyAddedItems = await this.malkhanaItemRepository.count({
      where: {
        createdAt: Between(thirtyDaysAgo, new Date())
      }
    });
    
    return {
      totalItems: blackInkItems + redInkItems,
      blackInkItems,
      redInkItems,
      disposedItems,
      recentlyAddedItems,
      currentYear
    };
  }
} 