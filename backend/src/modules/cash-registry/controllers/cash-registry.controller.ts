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
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CashRegistryService } from '../services/cash-registry.service';
import { CreateCashEntryDto } from '../dto/create-cash-entry.dto';
import { UpdateCashEntryDto } from '../dto/update-cash-entry.dto';
import { CashEntryQueryDto } from '../dto/cash-entry-query.dto';
import { CashRegistryEntry, TransactionType } from '../entities/cash-registry-entry.entity';
import { UnitId, UserId } from '../../../common/decorators';

@Controller('cash-registry')
@UseGuards(JwtAuthGuard)
export class CashRegistryController {
  constructor(private readonly cashRegistryService: CashRegistryService) {}

  @Get('entries')
  async getAllEntries(
    @UnitId() unitId: string,
    @Query() queryDto: CashEntryQueryDto
  ): Promise<CashRegistryEntry[]> {
    return this.cashRegistryService.findAll(unitId, queryDto);
  }

  @Get('entries/:id')
  async getEntryById(
    @Param('id') id: string,
    @UnitId() unitId: string
  ): Promise<CashRegistryEntry> {
    return this.cashRegistryService.findOne(id, unitId);
  }

  @Post('entries')
  async createEntry(
    @Body() createDto: CreateCashEntryDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<CashRegistryEntry> {
    return this.cashRegistryService.createCashEntry(createDto, unitId, userId);
  }

  @Put('entries/:id')
  async updateEntry(
    @Param('id') id: string,
    @Body() updateDto: UpdateCashEntryDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<CashRegistryEntry> {
    return this.cashRegistryService.update(id, updateDto, unitId, userId);
  }

  @Get('generate-document-number')
  async generateDocumentNumber(
    @UnitId() unitId: string,
    @Query('type') transactionType: TransactionType
  ): Promise<{ documentNumber: string }> {
    const documentNumber = await this.cashRegistryService.generateDocumentNumber(
      unitId,
      transactionType || TransactionType.RECEIPT
    );
    return { documentNumber };
  }
} 