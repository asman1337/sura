import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CashRegistryDailyBalance } from '../entities/cash-registry-daily-balance.entity';
import { CashRegistryService } from './cash-registry.service';
import { CreateDailyBalanceDto } from '../dto/daily-balance.dto';
import { VerifyDailyBalanceDto } from '../dto/daily-balance.dto';
import { startOfDay, endOfDay, subDays } from 'date-fns';

@Injectable()
export class DailyBalanceService {
  constructor(
    @InjectRepository(CashRegistryDailyBalance)
    private dailyBalanceRepository: Repository<CashRegistryDailyBalance>,
    private cashRegistryService: CashRegistryService,
  ) {}

  // Create a new daily balance record
  async createDailyBalance(
    createDto: CreateDailyBalanceDto,
    unitId: string,
    userId: string,
  ): Promise<CashRegistryDailyBalance> {
    // Check if a balance for this date already exists
    const existingBalance = await this.dailyBalanceRepository.findOne({
      where: { 
        unitId,
        balanceDate: startOfDay(createDto.balanceDate)
      }
    });

    if (existingBalance) {
      throw new BadRequestException(`A balance record for ${createDto.balanceDate} already exists`);
    }

    // Get the previous day's balance for opening balance validation
    const previousDayDate = subDays(createDto.balanceDate, 1);
    const previousBalance = await this.getMostRecentBalance(unitId, previousDayDate);

    // If there's a previous balance, the opening balance should match the previous day's closing balance
    if (previousBalance && Number(previousBalance.closingBalance) !== Number(createDto.openingBalance)) {
      throw new BadRequestException(
        `Opening balance (${createDto.openingBalance}) does not match previous day's closing balance (${previousBalance.closingBalance})`
      );
    }

    // Calculate receipts and disbursements for the day
    const { receiptsTotal, disbursementsTotal } = await this.cashRegistryService.getTransactionTotals(
      unitId,
      startOfDay(createDto.balanceDate),
      endOfDay(createDto.balanceDate)
    );

    // Calculate closing balance
    const closingBalance = Number(createDto.openingBalance) + receiptsTotal - disbursementsTotal;

    // Create the balance record
    const balanceRecord = this.dailyBalanceRepository.create({
      ...createDto,
      balanceDate: startOfDay(createDto.balanceDate), // Ensure we store only the date part
      unitId,
      receiptsTotal,
      disbursementsTotal,
      closingBalance,
      verifiedById: userId, // Initially verified by the creator
      verifiedAt: new Date(),
      createdBy: userId,
    });

    return await this.dailyBalanceRepository.save(balanceRecord);
  }

  // Get all daily balance records for a unit
  async findAll(unitId: string, limit: number = 30): Promise<CashRegistryDailyBalance[]> {
    return await this.dailyBalanceRepository.find({
      where: { unitId },
      relations: ['verifiedBy'],
      order: { balanceDate: 'DESC' },
      take: limit
    });
  }

  // Get a specific daily balance by ID or date
  async findOne(idOrDate: string, unitId: string): Promise<CashRegistryDailyBalance> {
    // Try to parse as date first
    let balance: CashRegistryDailyBalance | null = null;
    
    if (idOrDate.includes('-')) {
      try {
        const date = new Date(idOrDate);
        balance = await this.dailyBalanceRepository.findOne({
          where: { unitId, balanceDate: startOfDay(date) },
          relations: ['verifiedBy'],
        });
      } catch (error) {
        // Not a date, try as ID
      }
    }
    
    // If not found as date or wasn't a date, try as ID
    if (!balance) {
      balance = await this.dailyBalanceRepository.findOne({
        where: { id: idOrDate, unitId },
        relations: ['verifiedBy'],
      });
    }

    if (!balance) {
      throw new NotFoundException(`Daily balance record not found`);
    }

    return balance;
  }

  // Verify a daily balance with officer attestation
  async verifyBalance(
    id: string,
    verifyDto: VerifyDailyBalanceDto,
    unitId: string,
    userId: string,
  ): Promise<CashRegistryDailyBalance> {
    const balance = await this.findOne(id, unitId);

    balance.verifiedById = verifyDto.verifiedById;
    balance.verifiedAt = new Date();
    balance.isBalanced = verifyDto.isBalanced;
    balance.discrepancyNotes = verifyDto.discrepancyNotes ?? '';
    balance.updatedBy = userId;

    return await this.dailyBalanceRepository.save(balance);
  }

  // Get the most recent balance before a given date
  async getMostRecentBalance(unitId: string, beforeDate: Date): Promise<CashRegistryDailyBalance | null> {
    return await this.dailyBalanceRepository.findOne({
      where: { 
        unitId, 
        balanceDate: LessThan(startOfDay(beforeDate)) 
      },
      order: { balanceDate: 'DESC' }
    });
  }

  // Get the balance for a specific date
  async getBalanceForDate(unitId: string, date: Date): Promise<CashRegistryDailyBalance | null> {
    return await this.dailyBalanceRepository.findOne({
      where: { 
        unitId, 
        balanceDate: startOfDay(date) 
      }
    });
  }
} 