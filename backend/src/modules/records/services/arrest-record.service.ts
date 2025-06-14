import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArrestRecord } from '../entities/arrest-record.entity';
import { CreateArrestRecordDto } from '../dto/create-arrest-record.dto';
import { UpdateArrestRecordDto } from '../dto/update-arrest-record.dto';

@Injectable()
export class ArrestRecordService {
  constructor(
    @InjectRepository(ArrestRecord)
    private arrestRecordRepository: Repository<ArrestRecord>,
  ) {}

  async create(
    createArrestRecordDto: CreateArrestRecordDto,
    createdById: string,
  ): Promise<ArrestRecord> {
    // Generate serial number
    const serialNumber = await this.generateSerialNumber();

    // Set identification requirement based on part type
    const isIdentificationRequired = createArrestRecordDto.partType === 'part1';

    const arrestRecord = this.arrestRecordRepository.create({
      ...createArrestRecordDto,
      serialNumber: serialNumber.serialNumber,
      serialCount: serialNumber.serialCount,
      serialYear: serialNumber.serialYear,
      serialMonth: serialNumber.serialMonth,
      createdById,
      type: 'arrest_record' as const,
      isIdentificationRequired,
      dateOfArrest: new Date(createArrestRecordDto.dateOfArrest),
      dateForwardedToCourt: createArrestRecordDto.dateForwardedToCourt
        ? new Date(createArrestRecordDto.dateForwardedToCourt)
        : undefined,
      recordDate: new Date(createArrestRecordDto.recordDate),
    });

    return this.arrestRecordRepository.save(arrestRecord);
  }

  async findAll(unitId?: string): Promise<ArrestRecord[]> {
    const queryBuilder = this.arrestRecordRepository
      .createQueryBuilder('arrestRecord')
      .leftJoinAndSelect('arrestRecord.unit', 'unit')
      .leftJoinAndSelect('arrestRecord.createdBy', 'createdBy')
      .leftJoinAndSelect('arrestRecord.lastModifiedBy', 'lastModifiedBy')
      .where('arrestRecord.isActive = :isActive', { isActive: true });

    if (unitId) {
      queryBuilder.andWhere('arrestRecord.unitId = :unitId', { unitId });
    }

    return queryBuilder.orderBy('arrestRecord.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<ArrestRecord> {
    const arrestRecord = await this.arrestRecordRepository
      .createQueryBuilder('arrestRecord')
      .leftJoinAndSelect('arrestRecord.unit', 'unit')
      .leftJoinAndSelect('arrestRecord.createdBy', 'createdBy')
      .leftJoinAndSelect('arrestRecord.lastModifiedBy', 'lastModifiedBy')
      .where('arrestRecord.id = :id', { id })
      .andWhere('arrestRecord.isActive = :isActive', { isActive: true })
      .getOne();

    if (!arrestRecord) {
      throw new NotFoundException(`Arrest record with ID ${id} not found`);
    }

    return arrestRecord;
  }

  async update(
    id: string,
    updateArrestRecordDto: UpdateArrestRecordDto,
    lastModifiedById: string,
  ): Promise<ArrestRecord> {
    const arrestRecord = await this.findOne(id);

    // Update fields
    Object.assign(arrestRecord, {
      ...updateArrestRecordDto,
      lastModifiedById,
      dateOfArrest: updateArrestRecordDto.dateOfArrest
        ? new Date(updateArrestRecordDto.dateOfArrest)
        : arrestRecord.dateOfArrest,
      dateForwardedToCourt: updateArrestRecordDto.dateForwardedToCourt
        ? new Date(updateArrestRecordDto.dateForwardedToCourt)
        : arrestRecord.dateForwardedToCourt,
      recordDate: updateArrestRecordDto.recordDate
        ? new Date(updateArrestRecordDto.recordDate)
        : arrestRecord.recordDate,
    });

    return await this.arrestRecordRepository.save(arrestRecord);
  }

  async remove(id: string, lastModifiedById: string): Promise<void> {
    const arrestRecord = await this.findOne(id);

    arrestRecord.isActive = false;
    arrestRecord.status = 'deleted';
    arrestRecord.lastModifiedById = lastModifiedById;

    await this.arrestRecordRepository.save(arrestRecord);
  }

  async findBySerialNumber(serialNumber: string): Promise<ArrestRecord> {
    const arrestRecord = await this.arrestRecordRepository.findOne({
      where: { serialNumber, isActive: true },
      relations: ['unit', 'createdBy', 'lastModifiedBy'],
    });

    if (!arrestRecord) {
      throw new NotFoundException(
        `Arrest record with serial number ${serialNumber} not found`,
      );
    }

    return arrestRecord;
  }

  async findByAccusedName(
    name: string,
    unitId?: string,
  ): Promise<ArrestRecord[]> {
    const queryBuilder = this.arrestRecordRepository
      .createQueryBuilder('arrestRecord')
      .leftJoinAndSelect('arrestRecord.unit', 'unit')
      .leftJoinAndSelect('arrestRecord.createdBy', 'createdBy')
      .where('arrestRecord.isActive = :isActive', { isActive: true })
      .andWhere('LOWER(arrestRecord.accusedName) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });

    if (unitId) {
      queryBuilder.andWhere('arrestRecord.unitId = :unitId', { unitId });
    }

    return queryBuilder.orderBy('arrestRecord.createdAt', 'DESC').getMany();
  }

  private async generateSerialNumber(): Promise<{
    serialNumber: string;
    serialCount: number;
    serialYear: number;
    serialMonth: number;
  }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Find the last record for the current year and month
    const lastRecord = await this.arrestRecordRepository
      .createQueryBuilder('arrestRecord')
      .where('arrestRecord.serialYear = :year', { year })
      .andWhere('arrestRecord.serialMonth = :month', { month })
      .orderBy('arrestRecord.serialCount', 'DESC')
      .getOne();

    const serialCount = lastRecord ? lastRecord.serialCount + 1 : 1;

    // Format: YYYYMMNNN (e.g., 202501001)
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedCount = serialCount.toString().padStart(3, '0');
    const serialNumber = `${year}${paddedMonth}${paddedCount}`;

    return {
      serialNumber,
      serialCount,
      serialYear: year,
      serialMonth: month,
    };
  }

  async getStatistics(unitId?: string): Promise<{
    totalRecords: number;
    part1Records: number;
    part2Records: number;
    monthlyRecords: number;
    pendingCourt: number;
  }> {
    const queryBuilder = this.arrestRecordRepository
      .createQueryBuilder('arrestRecord')
      .where('arrestRecord.isActive = :isActive', { isActive: true });

    if (unitId) {
      queryBuilder.andWhere('arrestRecord.unitId = :unitId', { unitId });
    }

    const totalRecords = await queryBuilder.getCount();

    const part1Records = await queryBuilder
      .clone()
      .andWhere('arrestRecord.partType = :partType', { partType: 'part1' })
      .getCount();

    const part2Records = await queryBuilder
      .clone()
      .andWhere('arrestRecord.partType = :partType', { partType: 'part2' })
      .getCount();

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthlyRecords = await queryBuilder
      .clone()
      .andWhere('arrestRecord.serialYear = :year', { year: currentYear })
      .andWhere('arrestRecord.serialMonth = :month', { month: currentMonth })
      .getCount();

    const pendingCourt = await queryBuilder
      .clone()
      .andWhere('arrestRecord.dateForwardedToCourt IS NOT NULL')
      .andWhere(
        "(arrestRecord.trialResult IS NULL OR arrestRecord.trialResult = '')",
      )
      .getCount();

    return {
      totalRecords,
      part1Records,
      part2Records,
      monthlyRecords,
      pendingCourt,
    };
  }
}
