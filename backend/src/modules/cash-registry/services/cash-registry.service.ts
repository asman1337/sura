import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CashRegistryEntry, TransactionType } from '../entities/cash-registry-entry.entity';
import { CreateCashEntryDto } from '../dto/create-cash-entry.dto';
import { UpdateCashEntryDto } from '../dto/update-cash-entry.dto';
import { CashEntryQueryDto } from '../dto/cash-entry-query.dto';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

@Injectable()
export class CashRegistryService {
  constructor(
    @InjectRepository(CashRegistryEntry)
    private cashRegistryRepository: Repository<CashRegistryEntry>,
  ) {}

  // Create a new cash entry
  async createCashEntry(
    createDto: CreateCashEntryDto,
    unitId: string,
    userId: string,
  ): Promise<CashRegistryEntry> {
    // Validate transaction type specific fields
    if (createDto.transactionType === TransactionType.RECEIPT && !createDto.source) {
      throw new BadRequestException('Source must be provided for receipt transactions');
    }

    if (createDto.transactionType === TransactionType.DISBURSEMENT && !createDto.purpose) {
      throw new BadRequestException('Purpose must be provided for disbursement transactions');
    }

    // Create new entry
    const entry = this.cashRegistryRepository.create({
      ...createDto,
      unitId,
      handledById: userId,
      createdBy: userId,
    });

    if (createDto.attestedById) {
      entry.attestedById = createDto.attestedById;
      entry.attestedAt = new Date();
    }

    return await this.cashRegistryRepository.save(entry);
  }

  // Get all cash entries for a unit with optional filters
  async findAll(unitId: string, queryDto: CashEntryQueryDto): Promise<CashRegistryEntry[]> {
    const query = this.cashRegistryRepository.createQueryBuilder('entry')
      .where('entry.unitId = :unitId', { unitId })
      .leftJoinAndSelect('entry.handledBy', 'handledBy')
      .leftJoinAndSelect('entry.attestedBy', 'attestedBy');

    // Apply filters if provided
    if (queryDto.transactionType) {
      query.andWhere('entry.transactionType = :type', { type: queryDto.transactionType });
    }

    if (queryDto.startDate) {
      const start = startOfDay(new Date(queryDto.startDate));
      query.andWhere('entry.createdAt >= :start', { start });
    }

    if (queryDto.endDate) {
      const end = endOfDay(new Date(queryDto.endDate));
      query.andWhere('entry.createdAt <= :end', { end });
    }

    if (queryDto.caseReference) {
      query.andWhere('entry.caseReference LIKE :ref', { ref: `%${queryDto.caseReference}%` });
    }

    if (queryDto.documentNumber) {
      query.andWhere('entry.documentNumber LIKE :docNum', { docNum: `%${queryDto.documentNumber}%` });
    }

    // Order by creation date, newest first
    query.orderBy('entry.createdAt', 'DESC');

    return await query.getMany();
  }

  // Get a specific cash entry by ID
  async findOne(id: string, unitId: string): Promise<CashRegistryEntry> {
    const entry = await this.cashRegistryRepository.findOne({
      where: { id, unitId },
      relations: ['handledBy', 'attestedBy'],
    });

    if (!entry) {
      throw new NotFoundException(`Cash entry with ID ${id} not found`);
    }

    return entry;
  }

  // Update a cash entry
  async update(
    id: string,
    updateDto: UpdateCashEntryDto,
    unitId: string,
    userId: string,
  ): Promise<CashRegistryEntry> {
    // Find the entry first
    const entry = await this.findOne(id, unitId);

    // Prevent updates to reconciled entries
    if (entry.isReconciled && !updateDto.hasOwnProperty('isReconciled')) {
      throw new BadRequestException('Cannot update a reconciled entry except for reconciliation status');
    }

    // Handle attestation
    if (updateDto.attestedById && !entry.attestedById) {
      entry.attestedById = updateDto.attestedById;
      entry.attestedAt = new Date();
    }

    // Update entry
    Object.assign(entry, {
      ...updateDto,
      updatedBy: userId,
    });

    return await this.cashRegistryRepository.save(entry);
  }

  // Get total receipts and disbursements for a given date range
  async getTransactionTotals(
    unitId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ receiptsTotal: number; disbursementsTotal: number }> {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // Get all transactions for the date range
    const entries = await this.cashRegistryRepository.find({
      where: {
        unitId,
        createdAt: Between(start, end),
      },
    });

    // Calculate totals
    const receiptsTotal = entries
      .filter(e => e.transactionType === TransactionType.RECEIPT)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const disbursementsTotal = entries
      .filter(e => e.transactionType === TransactionType.DISBURSEMENT)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return { receiptsTotal, disbursementsTotal };
  }

  // Generate a unique document number based on date and transaction type
  async generateDocumentNumber(unitId: string, transactionType: TransactionType): Promise<string> {
    const today = new Date();
    const prefix = transactionType === TransactionType.RECEIPT ? 'RCT' : 'DSB';
    const dateString = format(today, 'yyyyMMdd');
    
    // Count existing entries for today with the same prefix
    const count = await this.cashRegistryRepository.count({
      where: {
        unitId,
        documentNumber: Like(`${prefix}-${dateString}-%`),
      },
    });

    // Format: PREFIX-YYYYMMDD-SEQUENCE
    return `${prefix}-${dateString}-${(count + 1).toString().padStart(4, '0')}`;
  }
}

// Helper for LIKE queries
const Like = (value: string) => `%${value}%`; 