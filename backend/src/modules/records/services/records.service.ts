import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRecord } from '../entities/base-record.entity';
import { UpdateRecordDto } from '../dto/update-record.dto';
import { RecordType } from '../dto/create-record.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(BaseRecord)
    private recordsRepository: Repository<BaseRecord>
  ) {}

  /**
   * Find all records with optional filters
   */
  async findAll(options?: {
    type?: RecordType;
    unitId?: string;
    status?: string;
    skip?: number;
    take?: number;
  }): Promise<{ records: BaseRecord[]; total: number }> {
    const { type, unitId, status, skip = 0, take = 10 } = options || {};
    
    const queryBuilder = this.recordsRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.unit', 'unit')
      .where('record.isActive = :isActive', { isActive: true });
      
    // Apply filters if provided
    if (type) {
      queryBuilder.andWhere('record.type = :type', { type });
    }
    
    if (unitId) {
      queryBuilder.andWhere('record.unitId = :unitId', { unitId });
    }
    
    if (status) {
      queryBuilder.andWhere('record.status = :status', { status });
    }
    
    // Count total records for pagination
    const total = await queryBuilder.getCount();
    
    // Get paginated records
    const records = await queryBuilder
      .orderBy('record.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();
      
    return { records, total };
  }

  /**
   * Find record by ID
   */
  async findOne(id: string): Promise<BaseRecord> {
    const record = await this.recordsRepository.findOne({ 
      where: { id },
      relations: ['createdBy', 'lastModifiedBy', 'unit']
    });
    
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    
    return record;
  }

  /**
   * Update a record
   */
  async update(id: string, updateRecordDto: UpdateRecordDto): Promise<BaseRecord> {
    const record = await this.findOne(id);
    
    // Update record with dto values
    Object.assign(record, updateRecordDto);
    
    return this.recordsRepository.save(record);
  }

  /**
   * Delete a record (soft delete by setting status to deleted)
   */
  async remove(id: string): Promise<{ success: boolean }> {
    const record = await this.findOne(id);
    
    record.status = 'deleted';
    record.isActive = false;
    
    await this.recordsRepository.save(record);
    
    return { success: true };
  }
  
  /**
   * Get statistics about records
   */
  async getStats(unitId?: string): Promise<{
    totalRecords: number;
    recordsByType: Record<string, number>;
    recentlyAdded: number;
    archivedRecords: number;
  }> {
    // Base query builder with unit filter if provided
    const baseQuery = this.recordsRepository.createQueryBuilder('record');
    if (unitId) {
      baseQuery.where('record.unitId = :unitId', { unitId });
    }
    
    // Get total count
    const totalRecords = await baseQuery.clone().getCount();
    
    // Get count by type
    const typeCounts = await baseQuery
      .clone()
      .select('record.type, COUNT(*) as count')
      .groupBy('record.type')
      .getRawMany();
    
    const recordsByType = typeCounts.reduce((acc, curr) => {
      acc[curr.record_type] = parseInt(curr.count);
      return acc;
    }, {});
    
    // Get recently added count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyAdded = await baseQuery
      .clone()
      .where('record.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();
    
    // Get archived records count
    const archivedRecords = await baseQuery
      .clone()
      .where('record.status = :status', { status: 'archived' })
      .getCount();
    
    return {
      totalRecords,
      recordsByType,
      recentlyAdded,
      archivedRecords,
    };
  }
} 