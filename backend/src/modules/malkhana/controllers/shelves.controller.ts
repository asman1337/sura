import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ShelvesService } from '../services/shelves.service';
import { CreateShelfDto } from '../dto/create-shelf.dto';
import { UpdateShelfDto } from '../dto/update-shelf.dto';
import { Shelf } from '../entities/shelf.entity';
import { MalkhanaItem } from '../entities/malkhana-item.entity';
import { ShelfResponseDto } from '../dto/shelf.response.dto';

@Controller('malkhana/shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Get()
  async getAllShelves(): Promise<ShelfResponseDto[]> {
    return this.shelvesService.getAllShelves();
  }

  @Get(':id')
  async getShelfById(@Param('id') id: string): Promise<ShelfResponseDto> {
    return this.shelvesService.getShelfById(id);
  }

  @Post()
  async createShelf(@Body() createShelfDto: CreateShelfDto): Promise<Shelf> {
    return this.shelvesService.createShelf(createShelfDto);
  }

  @Put(':id')
  async updateShelf(
    @Param('id') id: string,
    @Body() updateShelfDto: UpdateShelfDto
  ): Promise<Shelf> {
    return this.shelvesService.updateShelf(id, updateShelfDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShelf(@Param('id') id: string): Promise<void> {
    return this.shelvesService.deleteShelf(id);
  }

  @Get(':id/items')
  async getShelfItems(@Param('id') id: string): Promise<MalkhanaItem[]> {
    return this.shelvesService.getShelfItems(id);
  }

  @Post(':id/qr-code')
  @HttpCode(HttpStatus.OK)
  async generateQRCode(@Param('id') id: string): Promise<{ qrCodeUrl: string }> {
    const qrCodeUrl = await this.shelvesService.generateQRCode(id);
    return { qrCodeUrl };
  }
} 