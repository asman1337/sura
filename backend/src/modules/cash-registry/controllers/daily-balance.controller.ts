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
import { DailyBalanceService } from '../services/daily-balance.service';
import { CreateDailyBalanceDto, VerifyDailyBalanceDto, DailyBalanceResponseDto } from '../dto/daily-balance.dto';
import { CashRegistryDailyBalance } from '../entities/cash-registry-daily-balance.entity';
import { UnitId, UserId } from '../../../common/decorators';

@Controller('cash-registry/daily-balance')
@UseGuards(JwtAuthGuard)
export class DailyBalanceController {
  constructor(private readonly dailyBalanceService: DailyBalanceService) {}

  @Get()
  async getAllBalances(
    @UnitId() unitId: string,
    @Query('limit') limit?: number
  ): Promise<CashRegistryDailyBalance[]> {
    return this.dailyBalanceService.findAll(unitId, limit);
  }

  @Get(':idOrDate')
  async getBalanceByIdOrDate(
    @Param('idOrDate') idOrDate: string,
    @UnitId() unitId: string
  ): Promise<CashRegistryDailyBalance> {
    return this.dailyBalanceService.findOne(idOrDate, unitId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDailyBalance(
    @Body() createDto: CreateDailyBalanceDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<CashRegistryDailyBalance> {
    return this.dailyBalanceService.createDailyBalance(createDto, unitId, userId);
  }

  @Put(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyDailyBalance(
    @Param('id') id: string,
    @Body() verifyDto: VerifyDailyBalanceDto,
    @UnitId() unitId: string,
    @UserId() userId: string
  ): Promise<CashRegistryDailyBalance> {
    return this.dailyBalanceService.verifyBalance(id, verifyDto, unitId, userId);
  }

  @Get('date/:date')
  async getBalanceForDate(
    @Param('date') dateString: string,
    @UnitId() unitId: string
  ): Promise<CashRegistryDailyBalance | null> {
    const date = new Date(dateString);
    return this.dailyBalanceService.getBalanceForDate(unitId, date);
  }
} 