import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaperDispatchRecord } from '../entities/paper-dispatch.entity';
import { CreatePaperDispatchDto } from '../dto/create-paper-dispatch.dto';
import { UpdatePaperDispatchDto } from '../dto/update-paper-dispatch.dto';

@Injectable()
export class PaperDispatchService {
  constructor(
    @InjectRepository(PaperDispatchRecord)
    private paperDispatchRepository: Repository<PaperDispatchRecord>,
  ) {}

  async create(createDto: CreatePaperDispatchDto, createdById: string): Promise<PaperDispatchRecord> {
    const currentYear = new Date().getFullYear();
    
    // Generate serial number
    const serialNumber = await this.generateSerialNumber(currentYear);
    const serialCount = await this.getNextSerialCount(currentYear);

    // Calculate days elapsed and overdue status
    const dateOfReceive = new Date(createDto.dateOfReceive);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - dateOfReceive.getTime()) / (1000 * 60 * 60 * 24));    const isOverdue = daysElapsed >= 7 && !createDto.noExpectingReport;    // Determine registry type based on days elapsed or manual setting
    let registryType: 'BLACK_INK' | 'RED_INK' = createDto.registryType || 'BLACK_INK';
    let dateTransitionToRed: Date | undefined = undefined;

    if (daysElapsed >= 7 && !createDto.noExpectingReport && registryType === 'BLACK_INK') {
      registryType = 'RED_INK';
      dateTransitionToRed = new Date();
    }    const paperDispatch = this.paperDispatchRepository.create({
      ...createDto,
      serialNumber,
      serialCount,
      serialYear: currentYear,
      dateOfReceive: new Date(createDto.dateOfReceive),
      dateFixed: createDto.dateFixed ? new Date(createDto.dateFixed) : undefined,
      registryType,
      dateTransitionToRed,
      daysElapsed,
      isOverdue,
      type: 'paper_dispatch' as const,
      status: 'active' as const,
      isActive: true,
      createdById: createdById,
    });

    return await this.paperDispatchRepository.save(paperDispatch);
  }

  async findAll(): Promise<PaperDispatchRecord[]> {
    return await this.paperDispatchRepository.find({
      where: { isActive: true },
      relations: ['unit', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUnit(unitId: string): Promise<PaperDispatchRecord[]> {
    return await this.paperDispatchRepository.find({
      where: { unitId, isActive: true },
      relations: ['unit', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PaperDispatchRecord> {
    const record = await this.paperDispatchRepository.findOne({
      where: { id, isActive: true },
      relations: ['unit', 'createdBy'],
    });

    if (!record) {
      throw new NotFoundException('Paper dispatch record not found');
    }

    // Update calculated fields before returning
    await this.updateCalculatedFields(record);

    return record;
  }
  async update(id: string, updateDto: UpdatePaperDispatchDto): Promise<PaperDispatchRecord> {
    const record = await this.findOne(id);    // Filter out database-managed fields that should not be updated
    const {
      id: _id,
      serialNumber,
      serialCount,
      serialYear,
      createdAt,
      updatedAt,
      createdById,
      status,
      isActive,
      daysElapsed,
      isOverdue,
      dateTransitionToRed,
      unit,
      createdBy,
      lastModifiedBy,
      ...updateData
    } = updateDto;

    // Update the record with filtered data
    Object.assign(record, {
      ...updateData,
      dateOfReceive: updateData.dateOfReceive ? new Date(updateData.dateOfReceive) : record.dateOfReceive,
      dateFixed: updateData.dateFixed ? new Date(updateData.dateFixed) : record.dateFixed,
    });

    // Recalculate fields
    await this.updateCalculatedFields(record);

    return await this.paperDispatchRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    record.isActive = false;
    record.status = 'deleted';
    await this.paperDispatchRepository.save(record);
  }

  private async generateSerialNumber(year: number): Promise<string> {
    const count = await this.getNextSerialCount(year);
    return `${count}/${year}`;
  }

  private async getNextSerialCount(year: number): Promise<number> {
    const lastRecord = await this.paperDispatchRepository
      .createQueryBuilder('record')
      .where('record.serialYear = :year', { year })
      .orderBy('record.serialCount', 'DESC')
      .getOne();

    return lastRecord ? lastRecord.serialCount + 1 : 1;
  }

  private async updateCalculatedFields(record: PaperDispatchRecord): Promise<void> {
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - record.dateOfReceive.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysElapsed >= 7 && !record.noExpectingReport;

    // Auto-transition to RED_INK if 7+ days elapsed and not expecting report
    if (daysElapsed >= 7 && !record.noExpectingReport && record.registryType === 'BLACK_INK') {
      record.registryType = 'RED_INK';
      record.dateTransitionToRed = new Date();
    }

    record.daysElapsed = daysElapsed;
    record.isOverdue = isOverdue;
  }

  // Background job method to transition records to RED_INK
  async transitionOverdueRecords(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overdueRecords = await this.paperDispatchRepository
      .createQueryBuilder('record')
      .where('record.dateOfReceive <= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('record.registryType = :registryType', { registryType: 'BLACK_INK' })
      .andWhere('record.noExpectingReport = :noExpectingReport', { noExpectingReport: false })
      .andWhere('record.isActive = :isActive', { isActive: true })
      .getMany();

    let transitionedCount = 0;
    for (const record of overdueRecords) {
      record.registryType = 'RED_INK';
      record.dateTransitionToRed = new Date();
      record.isOverdue = true;
      await this.paperDispatchRepository.save(record);
      transitionedCount++;
    }

    return transitionedCount;
  }

  // Get statistics
  async getStats(unitId?: string): Promise<any> {
    const queryBuilder = this.paperDispatchRepository.createQueryBuilder('record')
      .where('record.isActive = :isActive', { isActive: true });

    if (unitId) {
      queryBuilder.andWhere('record.unitId = :unitId', { unitId });
    }

    const [total, blackInk, redInk, overdue, closed] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('record.registryType = :registryType', { registryType: 'BLACK_INK' }).getCount(),
      queryBuilder.clone().andWhere('record.registryType = :registryType', { registryType: 'RED_INK' }).getCount(),
      queryBuilder.clone().andWhere('record.isOverdue = :isOverdue', { isOverdue: true }).getCount(),
      queryBuilder.clone().andWhere('record.closedStatus = :closedStatus', { closedStatus: 'closed' }).getCount(),
    ]);

    return {
      total,
      blackInk,
      redInk,
      overdue,
      closed,
      open: total - closed,
    };
  }
}
