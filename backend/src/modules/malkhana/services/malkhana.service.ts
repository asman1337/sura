import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, IsNull } from 'typeorm';
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
   */  async createItem(createItemDto: CreateMalkhanaItemDto, unitId: string | null, userId?: string): Promise<MalkhanaItem> {
    // For admin users without a unit, use the unitId from the DTO
    // For regular users, use their unitId
    const effectiveUnitId = unitId || createItemDto.unitId;
    
    if (!effectiveUnitId) {
      throw new BadRequestException('Unit ID is required. For admin users, please specify a unitId in the request.');
    }
    
    const currentYear = new Date().getFullYear();
    const registryType = createItemDto.registryType || RegistryType.BLACK_INK;
    
    let newRegistryNumber: number;
    let motherNumber: string;
    let registryYear: number;
      if (registryType === RegistryType.RED_INK) {
      // For Red Ink items, use manual entry if provided
      if (createItemDto.motherNumber && createItemDto.registryYear) {
        // Check if this motherNumber already exists ANYWHERE (across all registry types and units)
        const motherNumberToCheck = `${createItemDto.registryYear}-${createItemDto.motherNumber.toString().padStart(5, '0')}`;
        const existingItem = await this.malkhanaItemRepository.findOne({
          where: {
            motherNumber: motherNumberToCheck
          }
        });
        
        if (existingItem) {
          throw new BadRequestException(`Mother number ${motherNumberToCheck} already exists in the system`);
        }
        
        newRegistryNumber = createItemDto.motherNumber;
        registryYear = createItemDto.registryYear;
        motherNumber = motherNumberToCheck;
      } else {
        throw new BadRequestException('Mother number and registry year are required for Red Ink items');
      }
    } else {
      // For Black Ink items, auto-generate by finding the highest existing number across ALL types for the current year
      // This ensures we don't conflict with existing mother numbers
      const lastItemAnyType = await this.malkhanaItemRepository
        .createQueryBuilder('item')
        .where('item.unitId = :unitId', { unitId: effectiveUnitId })
        .andWhere('item.motherNumber LIKE :pattern', { pattern: `${currentYear}-%` })
        .orderBy('CAST(SUBSTRING(item.motherNumber FROM 6) AS INTEGER)', 'DESC')
        .getOne();
        let nextNumber = 1;
      if (lastItemAnyType) {
        // Extract the number part from the mother number (e.g., "2025-00003" -> 3)
        const numberPart = lastItemAnyType.motherNumber.split('-')[1];
        nextNumber = parseInt(numberPart, 10) + 1;
      }
      
      newRegistryNumber = nextNumber;
      registryYear = currentYear;
      motherNumber = `${registryYear}-${newRegistryNumber.toString().padStart(5, '0')}`;
    }
    
    // Create new item
    const newItem = this.malkhanaItemRepository.create({
      ...createItemDto,
      unitId: effectiveUnitId, // Set the unitId from the parameter or DTO
      motherNumber,
      registryNumber: newRegistryNumber,
      registryType: registryType,
      registryYear: registryYear,
      status: MalkhanaItemStatus.ACTIVE,
      createdBy: userId
    });
    
    // If shelf ID is provided, verify it exists and belongs to this unit
    if (createItemDto.shelfId) {
      const shelf = await this.shelfRepository.findOne({
        where: { id: createItemDto.shelfId }
      });
      
      if (!shelf) {
        throw new NotFoundException(`Shelf with ID ${createItemDto.shelfId} not found`);
      }
      
      // Ensure shelf belongs to the same unit (skip for admin users)
      if (unitId !== null && shelf.unitId !== effectiveUnitId) {
        throw new ForbiddenException(`Shelf with ID ${createItemDto.shelfId} does not belong to your unit`);
      }
    }
    
    // Save the new item
    return this.malkhanaItemRepository.save(newItem);
  }

  /**
   * Get all items in the Black Ink registry for a specific unit
   * For admin users, can return items across all units
   */
  async getBlackInkItems(unitId: string | null): Promise<MalkhanaItem[]> {
    const currentYear = new Date().getFullYear();
    
    // Admin user without unit sees all items
    if (unitId === null) {
      return this.malkhanaItemRepository.find({
        where: {
          registryType: RegistryType.BLACK_INK,
          registryYear: currentYear
        },
        relations: ['shelf', 'redInkHistory', 'unit'],
        order: { registryNumber: 'ASC' }
      });
    }
    
    // Regular user sees only their unit's items
    return this.malkhanaItemRepository.find({
      where: {
        unitId,
        registryType: RegistryType.BLACK_INK,
        registryYear: currentYear
      },
      relations: ['shelf', 'redInkHistory'],
      order: { registryNumber: 'ASC' }
    });
  }

  /**
   * Get all items in the Red Ink registry for a specific unit
   * For admin users, can return items across all units
   */
  async getRedInkItems(unitId: string | null): Promise<MalkhanaItem[]> {
    // Admin user without unit sees all items
    if (unitId === null) {
      return this.malkhanaItemRepository.find({
        where: {
          registryType: RegistryType.RED_INK
        },
        relations: ['shelf', 'redInkHistory', 'unit'],
        order: { registryNumber: 'ASC' }
      });
    }
    
    // Regular user sees only their unit's items
    return this.malkhanaItemRepository.find({
      where: {
        unitId,
        registryType: RegistryType.RED_INK
      },
      relations: ['shelf', 'redInkHistory'],
      order: { registryNumber: 'ASC' }
    });
  }

  /**
   * Get an item by ID and verify it belongs to the user's unit
   * For admin users, can return any item
   */
  async getItemById(id: string, unitId: string | null): Promise<MalkhanaItem> {
    const item = await this.malkhanaItemRepository.findOne({
      where: { id },
      relations: ['shelf', 'redInkHistory', 'unit']
    });
    
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    
    // Verify item belongs to the user's unit (skip for admin users)
    if (unitId !== null && item.unitId !== unitId) {
      throw new ForbiddenException('You do not have access to this item');
    }
    
    return item;
  }

  /**
   * Find an item by motherNumber (permanent ID) for a specific unit
   * For admin users, can find any item
   */
  async findByMotherNumber(motherNumber: string, unitId: string | null): Promise<MalkhanaItem | null> {
    // Admin user without unit can find any item
    if (unitId === null) {
      return this.malkhanaItemRepository.findOne({
        where: { motherNumber },
        relations: ['shelf', 'redInkHistory', 'unit']
      });
    }
    
    // Regular user can only find items in their unit
    return this.malkhanaItemRepository.findOne({
      where: { 
        motherNumber,
        unitId
      },
      relations: ['shelf', 'redInkHistory']
    });
  }

  /**
   * Update an item by ID
   * For admin users, can update any item
   */
  async updateItem(id: string, updateItemDto: UpdateMalkhanaItemDto, unitId: string | null, userId?: string): Promise<MalkhanaItem> {
    const item = await this.getItemById(id, unitId);
    
    // If status is being changed to DISPOSED, don't allow through normal update
    if (updateItemDto.status === MalkhanaItemStatus.DISPOSED) {
      throw new BadRequestException('Use the disposeItem endpoint to dispose of an item');
    }
    
    // If shelf ID is provided, verify it exists and belongs to the same unit
    if (updateItemDto.shelfId) {
      const shelf = await this.shelfRepository.findOne({
        where: { id: updateItemDto.shelfId }
      });
      
      if (!shelf) {
        throw new NotFoundException(`Shelf with ID ${updateItemDto.shelfId} not found`);
      }
      
      // Ensure shelf belongs to the same unit (skip for admin users)
      if (unitId !== null && shelf.unitId !== item.unitId) {
        throw new ForbiddenException(`Shelf with ID ${updateItemDto.shelfId} does not belong to the item's unit`);
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
  async disposeItem(id: string, disposeItemDto: DisposeItemDto, unitId: string, userId?: string): Promise<MalkhanaItem> {
    const item = await this.getItemById(id, unitId);
    
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
      await this.renumberRedInkAfterDisposal(item.registryNumber, unitId);
    }
    
    return disposedItem;
  }

  /**
   * Renumber Red Ink items after a disposal
   * When a Red Ink item is disposed, all subsequent items should be renumbered
   */
  private async renumberRedInkAfterDisposal(disposedItemNumber: number, unitId: string): Promise<void> {
    // Find all Red Ink items with higher registry numbers IN THE SAME UNIT
    const itemsToRenumber = await this.malkhanaItemRepository.find({
      where: {
        unitId,
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
  async assignToShelf(id: string, assignDto: AssignToShelfDto, unitId: string, userId: string): Promise<MalkhanaItem> {
    const item = await this.getItemById(id, unitId);
    const shelf = await this.shelfRepository.findOne({
      where: { id: assignDto.shelfId }
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${assignDto.shelfId} not found`);
    }
    
    // Ensure shelf belongs to the same unit
    if (shelf.unitId !== unitId) {
      throw new ForbiddenException(`Shelf with ID ${assignDto.shelfId} does not belong to your unit`);
    }
    
    // Update the item
    item.shelfId = shelf.id;
    item.updatedBy = userId;
    
    return this.malkhanaItemRepository.save(item);
  }

  /**
   * Perform the year-end transition from Black Ink to Red Ink for a specific unit
   * This will be manually triggered rather than automatic
   */  async performYearTransition(unitId: string, newYear: number, userId?: string): Promise<YearTransitionResponseDto> {
    const currentYear = new Date().getFullYear();
    const transitionYear = newYear - 1; // The year we're transitioning FROM
    
    // Validate the transition - we're transitioning FROM transitionYear TO Red Ink
    // The transition year should be <= current year (we can transition current or past years)
    if (transitionYear > currentYear) {
      throw new BadRequestException('Cannot transition items from a future year');
    }
    
    // Find all active items in the Black Ink registry FOR THIS UNIT from the transition year
    const blackInkItems = await this.malkhanaItemRepository.find({
      where: {
        unitId,
        registryType: RegistryType.BLACK_INK,
        registryYear: transitionYear,
        status: MalkhanaItemStatus.ACTIVE
      }
    });
    
    if (blackInkItems.length === 0) {
      return {
        success: true,
        message: 'No active items to transition',
        itemsTransitioned: 0,
        previousYear: transitionYear,
        newYear
      };
    }
    
    // Find the highest Red Ink registry number FOR THIS UNIT
    const lastRedInkItem = await this.malkhanaItemRepository.findOne({
      where: { 
        unitId,
        registryType: RegistryType.RED_INK 
      },
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
    }    return {
      success: true,
      message: `Transitioned ${blackInkItems.length} items from Black Ink to Red Ink`,
      itemsTransitioned: blackInkItems.length,
      previousYear: transitionYear,
      newYear
    };
  }

  /**
   * Search for items across both registries within a specific unit
   */
  async searchItems(query: string, unitId: string): Promise<MalkhanaItem[]> {
    return this.malkhanaItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.shelf', 'shelf')
      .leftJoinAndSelect('item.redInkHistory', 'history')
      .where('item.unitId = :unitId', { unitId })
      .andWhere(
        '(item.motherNumber ILIKE :query OR ' +
        'item.caseNumber ILIKE :query OR ' +
        'item.description ILIKE :query OR ' +
        'item.category ILIKE :query OR ' +
        'item.receivedFrom ILIKE :query)',
        { query: `%${query}%` }
      )
      .getMany();
  }

  /**
   * Get Malkhana statistics
   * For admin users, can get stats across all units
   */
  async getStats(unitId: string | null): Promise<MalkhanaStatsDto> {
    const currentYear = new Date().getFullYear();
    const whereClause = unitId ? { unitId } : {};
    
    // Count Black Ink items
    const blackInkItems = await this.malkhanaItemRepository.count({
      where: {
        ...whereClause,
        registryType: RegistryType.BLACK_INK,
        registryYear: currentYear
      }
    });
    
    // Count Red Ink items
    const redInkItems = await this.malkhanaItemRepository.count({
      where: {
        ...whereClause,
        registryType: RegistryType.RED_INK
      }
    });
    
    // Count disposed items
    const disposedItems = await this.malkhanaItemRepository.count({
      where: {
        ...whereClause,
        status: MalkhanaItemStatus.DISPOSED
      }
    });
    
    // Count recently added items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyAddedItems = await this.malkhanaItemRepository.count({
      where: {
        ...whereClause,
        createdAt: Between(thirtyDaysAgo, new Date())
      }
    });
    
    return {
      totalItems: blackInkItems + redInkItems,
      blackInkItems,
      redInkItems,
      disposedItems,
      recentlyAddedItems,
      currentYear,
      unitId
    };
  }

  /**
   * Get count of all items for a specific unit
   */
  async getItemCount(unitId: string): Promise<number> {
    return this.malkhanaItemRepository.count({
      where: { unitId }
    });
  }

  /**
   * Get recent items for a specific unit
   */
  async getRecentItems(unitId: string, limit: number = 5) {
    return this.malkhanaItemRepository.find({
      where: { unitId },
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'description', 'createdAt', 'createdBy']
    });
  }
}