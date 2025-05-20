import { Injectable, NotFoundException } from '@nestjs/common';
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
   * Get all shelves with item counts
   */
  async getAllShelves(): Promise<ShelfResponseDto[]> {
    const shelves = await this.shelfRepository.find();
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
   * Get a shelf by ID with item counts
   */
  async getShelfById(id: string): Promise<ShelfResponseDto> {
    const shelf = await this.shelfRepository.findOne({
      where: { id }
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
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
   */
  async updateShelf(id: string, updateShelfDto: UpdateShelfDto): Promise<Shelf> {
    const shelf = await this.shelfRepository.findOne({
      where: { id }
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    // Update the shelf
    Object.assign(shelf, updateShelfDto);
    
    return this.shelfRepository.save(shelf);
  }

  /**
   * Delete a shelf
   */
  async deleteShelf(id: string): Promise<void> {
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
   */
  async getShelfItems(id: string): Promise<MalkhanaItem[]> {
    const shelf = await this.shelfRepository.findOne({
      where: { id }
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    return this.malkhanaItemRepository.find({
      where: { shelfId: id },
      relations: ['redInkHistory']
    });
  }

  /**
   * Generate a QR code for a shelf
   * In a real implementation, this would call an API to generate a QR code
   * For this example, we'll just return a mock URL
   */
  async generateQRCode(id: string): Promise<string> {
    const shelf = await this.shelfRepository.findOne({
      where: { id }
    });
    
    if (!shelf) {
      throw new NotFoundException(`Shelf with ID ${id} not found`);
    }
    
    // In a real implementation, call an API to generate QR code
    // For now, return a mock URL that encodes the shelf ID
    const qrCodeUrl = `https://api.example.com/qr/shelf/${id}`;
    
    // Update the shelf with the QR code URL
    shelf.qrCodeUrl = qrCodeUrl;
    await this.shelfRepository.save(shelf);
    
    return qrCodeUrl;
  }
} 