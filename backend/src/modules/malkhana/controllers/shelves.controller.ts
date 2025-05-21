import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { ShelvesService } from '../services/shelves.service';
import { CreateShelfDto } from '../dto/create-shelf.dto';
import { UpdateShelfDto } from '../dto/update-shelf.dto';
import { Shelf } from '../entities/shelf.entity';
import { MalkhanaItem } from '../entities/malkhana-item.entity';
import { ShelfResponseDto } from '../dto/shelf.response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UnitId } from '../../../common/decorators';

@Controller('malkhana/shelves')
@UseGuards(JwtAuthGuard)
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Get()
  async getAllShelves(
    @UnitId() unitId: string
  ): Promise<ShelfResponseDto[]> {
    return this.shelvesService.getAllShelves(unitId);
  }

  @Get(':id')
  async getShelfById(
    @Param('id') id: string,
    @UnitId() unitId: string
  ): Promise<ShelfResponseDto> {
    return this.shelvesService.getShelfById(id, unitId);
  }

  @Post()
  async createShelf(
    @Body() createShelfDto: CreateShelfDto,
    @UnitId() unitId: string
  ): Promise<Shelf> {
    if (!createShelfDto.unitId && unitId) {
      createShelfDto.unitId = unitId;
    }
    return this.shelvesService.createShelf(createShelfDto);
  }

  @Put(':id')
  async updateShelf(
    @Param('id') id: string,
    @Body() updateShelfDto: UpdateShelfDto,
    @UnitId() unitId: string
  ): Promise<Shelf> {
    return this.shelvesService.updateShelf(id, updateShelfDto, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShelf(
    @Param('id') id: string,
    @UnitId() unitId: string
  ): Promise<void> {
    return this.shelvesService.deleteShelf(id, unitId);
  }

  @Get(':id/items')
  async getShelfItems(
    @Param('id') id: string,
    @UnitId() unitId: string
  ): Promise<MalkhanaItem[]> {
    return this.shelvesService.getShelfItems(id, unitId);
  }
} 