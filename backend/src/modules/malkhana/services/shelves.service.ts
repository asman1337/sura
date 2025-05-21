import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shelf } from '../entities/shelf.entity';
import { MalkhanaItem } from '../entities/malkhana-item.entity';
import { CreateShelfDto } from '../dto/create-shelf.dto';
import { UpdateShelfDto } from '../dto/update-shelf.dto';
import { ShelfResponseDto } from '../dto/shelf.response.dto';

@Injectable()
export class ShelvesService {
  constructor(
    @InjectRepository(Shelf)
    private shelfRepository: Repository<Shelf>,
    
    @InjectRepository(MalkhanaItem)
    private malkhanaItemRepository: Repository<MalkhanaItem>
  ) {}

  /**
   * Create a new shelf
   */
  async createShelf(createShelfDto: CreateShelfDto): Promise<Shelf> {
    const newShelf = this.shelfRepository.create(createShelfDto);
    return this.shelfRepository.save(newShelf);
  }

  /**
   * Get all shelves with item counts for a specific unit
   * For admin users, can get shelves across all units
   */
  async getAllShelves(unitId: string | null): Promise<ShelfResponseDto[]> {
    // Admin user without unit ID sees all shelves
    const shelves = unitId === null
      ? await this.shelfRepository.find({ relations: ['unit'] })
      : await this.shelfRepository.find({ where: { unitId } });
      
    const response: ShelfResponseDto[] = [];

    // Calculate item counts for each shelf
    for (const shelf of shelves) {
      const itemCount = await this.malkhanaItemRepository.count({
        where: { shelfId: shelf.id }
      });
      
      response.push({
        ...shelf,
        itemCount
      });
    }
    
    return response;
  }

  /**
   * Get a shelf by ID with item counts and verify it belongs to the user's unit
   * For admin users, can get any shelf
   */
  async getShelfById(id: string, unitId: string | null): Promise<ShelfResponseDto> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: unitId === null ? ['unit'] : []
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    // Verify shelf belongs to the user's unit (skip for admin users)
    if (unitId !== null && shelf.unitId !== unitId) {
      throw new ForbiddenException('You do not have access to this shelf');
    }
    
    const itemCount = await this.malkhanaItemRepository.count({
      where: { shelfId: id }
    });
    
    return {
      ...shelf,
      itemCount
    };
  }

  /**
   * Update a shelf
   * For admin users, can update any shelf
   */
  async updateShelf(id: string, updateShelfDto: UpdateShelfDto, unitId: string | null): Promise<Shelf> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: unitId === null ? ['unit'] : []
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    // Verify shelf belongs to the user's unit (skip for admin users)
    if (unitId !== null && shelf.unitId !== unitId) {
      throw new ForbiddenException('You do not have access to this shelf');
    }
    
    // Update the shelf
    Object.assign(shelf, updateShelfDto);
    
    return this.shelfRepository.save(shelf);
  }

  /**
   * Delete a shelf
   * For admin users, can delete any shelf
   */
  async deleteShelf(id: string, unitId: string | null): Promise<void> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: unitId === null ? ['unit'] : []
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    // Verify shelf belongs to the user's unit (skip for admin users)
    if (unitId !== null && shelf.unitId !== unitId) {
      throw new ForbiddenException('You do not have access to this shelf');
    }
    
    // Check if shelf has items
    const itemCount = await this.malkhanaItemRepository.count({
      where: { shelfId: id }
    });
    
    if (itemCount > 0) {
      throw new Error(`Cannot delete shelf with ID ${id} because it contains ${itemCount} items`);
    }
    
    const result = await this.shelfRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
  }

  /**
   * Get all items on a shelf
   * For admin users, can get items on any shelf
   */
  async getShelfItems(id: string, unitId: string | null): Promise<MalkhanaItem[]> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: unitId === null ? ['unit'] : []
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    // Verify shelf belongs to the user's unit (skip for admin users)
    if (unitId !== null && shelf.unitId !== unitId) {
      throw new ForbiddenException('You do not have access to this shelf');
    }
    
    return this.malkhanaItemRepository.find({
      where: { shelfId: id },
      relations: ['redInkHistory', ...(unitId === null ? ['unit'] : [])]
    });
  }
} 