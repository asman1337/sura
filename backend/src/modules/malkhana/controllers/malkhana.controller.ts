import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Request,
  UseGuards
} from '@nestjs/common';
import { MalkhanaService } from '../services/malkhana.service';
import { CreateMalkhanaItemDto } from '../dto/create-malkhana-item.dto';
import { UpdateMalkhanaItemDto } from '../dto/update-malkhana-item.dto';
import { DisposeItemDto } from '../dto/dispose-item.dto';
import { AssignToShelfDto } from '../dto/assign-to-shelf.dto';
import { YearTransitionDto, YearTransitionResponseDto } from '../dto/year-transition.dto';
import { MalkhanaStatsDto } from '../dto/malkhana-stats.dto';
import { MalkhanaItem } from '../entities/malkhana-item.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UnitId, UserId } from '../../../common/decorators';

@Controller('malkhana')
@UseGuards(JwtAuthGuard)
export class MalkhanaController {
  constructor(private readonly malkhanaService: MalkhanaService) {}

  @Get('stats')
  async getStats(
    @UnitId() unitId: string
  ): Promise<MalkhanaStatsDto> {
    return this.malkhanaService.getStats(unitId);
  }

  @Get('black-ink')
  async getBlackInkItems(
    @UnitId() unitId: string
  ): Promise<MalkhanaItem[]> {
    return this.malkhanaService.getBlackInkItems(unitId);
  }

  @Get('red-ink')
  async getRedInkItems(
    @UnitId() unitId: string
  ): Promise<MalkhanaItem[]> {
    return this.malkhanaService.getRedInkItems(unitId);
  }

  @Get('items/:id')
  async getItemById(
    @Param('id') id: string,
    @UnitId() unitId: string
  ): Promise<MalkhanaItem> {
    return this.malkhanaService.getItemById(id, unitId);
  }

  @Get('search')
  async searchItems(
    @Query('query') query: string,
    @UnitId() unitId: string
  ): Promise<MalkhanaItem[]> {
    return this.malkhanaService.searchItems(query, unitId);
  }

  @Get('mother-number/:motherNumber')
  async findByMotherNumber(
    @Param('motherNumber') motherNumber: string,
    @UnitId() unitId: string
  ): Promise<MalkhanaItem> {
    const item = await this.malkhanaService.findByMotherNumber(motherNumber, unitId);
    
    if (!item) {
      throw new Error(`Item with mother number ${motherNumber} not found in your unit`);
    }
    
    return item;
  }

  @Post('items')
  async createItem(
    @Body() createItemDto: CreateMalkhanaItemDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<MalkhanaItem> {
    return this.malkhanaService.createItem(createItemDto, unitId, userId);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateMalkhanaItemDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<MalkhanaItem> {
    return this.malkhanaService.updateItem(id, updateItemDto, unitId, userId);
  }

  @Post('items/:id/dispose')
  @HttpCode(HttpStatus.OK)
  async disposeItem(
    @Param('id') id: string,
    @Body() disposeItemDto: DisposeItemDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<MalkhanaItem> {
    return this.malkhanaService.disposeItem(id, disposeItemDto, unitId, userId);
  }

  @Post('items/:id/assign-shelf')
  @HttpCode(HttpStatus.OK)
  async assignToShelf(
    @Param('id') id: string,
    @Body() assignDto: AssignToShelfDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<MalkhanaItem> {
    return this.malkhanaService.assignToShelf(id, assignDto, unitId, userId);
  }

  @Post('year-transition')
  @HttpCode(HttpStatus.OK)
  async performYearTransition(
    @Body() yearTransitionDto: YearTransitionDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<YearTransitionResponseDto> {
    return this.malkhanaService.performYearTransition(unitId, yearTransitionDto.newYear, userId);
  }
} 