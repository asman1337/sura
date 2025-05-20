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

@Controller('malkhana')
@UseGuards(JwtAuthGuard)
export class MalkhanaController {
  constructor(private readonly malkhanaService: MalkhanaService) {}

  @Get('stats')
  async getStats(): Promise<MalkhanaStatsDto> {
    return this.malkhanaService.getStats();
  }

  @Get('black-ink')
  async getBlackInkItems(): Promise<MalkhanaItem[]> {
    return this.malkhanaService.getBlackInkItems();
  }

  @Get('red-ink')
  async getRedInkItems(): Promise<MalkhanaItem[]> {
    return this.malkhanaService.getRedInkItems();
  }

  @Get('items/:id')
  async getItemById(@Param('id') id: string): Promise<MalkhanaItem> {
    return this.malkhanaService.getItemById(id);
  }

  @Get('search')
  async searchItems(@Query('query') query: string): Promise<MalkhanaItem[]> {
    return this.malkhanaService.searchItems(query);
  }

  @Get('mother-number/:motherNumber')
  async findByMotherNumber(@Param('motherNumber') motherNumber: string): Promise<MalkhanaItem> {
    const item = await this.malkhanaService.findByMotherNumber(motherNumber);
    
    if (!item) {
      throw new Error(`Item with mother number ${motherNumber} not found`);
    }
    
    return item;
  }

  @Post('items')
  async createItem(
    @Body() createItemDto: CreateMalkhanaItemDto,
    @Request() req
  ): Promise<MalkhanaItem> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return this.malkhanaService.createItem(createItemDto, userId);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateMalkhanaItemDto,
    @Request() req
  ): Promise<MalkhanaItem> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return this.malkhanaService.updateItem(id, updateItemDto, userId);
  }

  @Post('items/:id/dispose')
  @HttpCode(HttpStatus.OK)
  async disposeItem(
    @Param('id') id: string,
    @Body() disposeItemDto: DisposeItemDto,
    @Request() req
  ): Promise<MalkhanaItem> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return this.malkhanaService.disposeItem(id, disposeItemDto, userId);
  }

  @Post('items/:id/qr-code')
  @HttpCode(HttpStatus.OK)
  async generateQRCode(@Param('id') id: string): Promise<{ qrCodeUrl: string }> {
    const qrCodeUrl = await this.malkhanaService.generateQRCode(id);
    return { qrCodeUrl };
  }

  @Post('items/:id/assign-shelf')
  @HttpCode(HttpStatus.OK)
  async assignToShelf(
    @Param('id') id: string,
    @Body() assignDto: AssignToShelfDto,
    @Request() req
  ): Promise<MalkhanaItem> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return this.malkhanaService.assignToShelf(id, assignDto, userId);
  }

  @Post('year-transition')
  @HttpCode(HttpStatus.OK)
  async performYearTransition(
    @Body() yearTransitionDto: YearTransitionDto,
    @Request() req
  ): Promise<YearTransitionResponseDto> {
    // Extract user ID from JWT payload
    const userId = req.user.sub;
    return this.malkhanaService.performYearTransition(yearTransitionDto.newYear, userId);
  }
} 