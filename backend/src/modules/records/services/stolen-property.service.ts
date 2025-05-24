import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StolenPropertyRecord } from '../entities/stolen-property.entity';
import { CreateStolenPropertyDto } from '../dto/create-stolen-property.dto';
import { RecordsService } from './records.service';

@Injectable()
export class StolenPropertyService {
  constructor(
    @InjectRepository(StolenPropertyRecord)
    private stolenPropertyRepository: Repository<StolenPropertyRecord>,
    private recordsService: RecordsService,
  ) {}

  /**
   * Create a new stolen property record
   */
  async create(createStolenPropertyDto: CreateStolenPropertyDto): Promise<StolenPropertyRecord> {
    // Check if property ID already exists
    const existingProperty = await this.stolenPropertyRepository.findOne({
      where: { propertyId: createStolenPropertyDto.propertyId },
    });
    
    if (existingProperty) {
      throw new ConflictException(`Property record with ID ${createStolenPropertyDto.propertyId} already exists`);
    }
    
    // Create new property record
    const stolenProperty = this.stolenPropertyRepository.create(createStolenPropertyDto);
    
    // Parse date strings to Date objects
    stolenProperty.dateOfTheft = new Date(createStolenPropertyDto.dateOfTheft);
    stolenProperty.dateOfReceipt = new Date(createStolenPropertyDto.dateOfReceipt);
    
    if (createStolenPropertyDto.recoveryDate) {
      stolenProperty.recoveryDate = new Date(createStolenPropertyDto.recoveryDate);
    }
    
    if (createStolenPropertyDto.dateOfRemittance) {
      stolenProperty.dateOfRemittance = new Date(createStolenPropertyDto.dateOfRemittance);
    }
    
    return this.stolenPropertyRepository.save(stolenProperty);
  }

  /**
   * Find all stolen property records with filters
   */
  async findAll(options?: {
    unitId?: string;
    status?: string;
    propertyType?: string;
    propertySource?: string;
    recoveryStatus?: string;
    skip?: number;
    take?: number;
  }): Promise<{ records: StolenPropertyRecord[]; total: number }> {
    const { unitId, status, propertyType, propertySource, recoveryStatus, skip = 0, take = 10 } = options || {};
    
    const queryBuilder = this.stolenPropertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.unit', 'unit')
      .where('property.isActive = :isActive', { isActive: true });
      
    // Apply filters if provided
    if (unitId) {
      queryBuilder.andWhere('property.unitId = :unitId', { unitId });
    }
    
    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }
    
    if (propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', { propertyType });
    }
    
    if (propertySource) {
      queryBuilder.andWhere('property.propertySource = :propertySource', { propertySource });
    }
    
    if (recoveryStatus) {
      queryBuilder.andWhere('property.recoveryStatus = :recoveryStatus', { recoveryStatus });
    }
    
    // Count total records for pagination
    const total = await queryBuilder.getCount();
    
    // Get paginated records
    const records = await queryBuilder
      .orderBy('property.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();
      
    return { records, total };
  }

  /**
   * Find one stolen property record by ID
   */
  async findOne(id: string): Promise<StolenPropertyRecord> {
    const record = await this.stolenPropertyRepository.findOne({
      where: { id },
      relations: ['createdBy', 'lastModifiedBy', 'unit'],
    });
    
    if (!record) {
      throw new NotFoundException(`Property record with ID ${id} not found`);
    }
    
    return record;
  }

  /**
   * Find stolen property by property ID
   */
  async findByPropertyId(propertyId: string): Promise<StolenPropertyRecord> {
    const record = await this.stolenPropertyRepository.findOne({
      where: { propertyId },
      relations: ['createdBy', 'lastModifiedBy', 'unit'],
    });
    
    if (!record) {
      throw new NotFoundException(`Property record with ID ${propertyId} not found`);
    }
    
    return record;
  }

  /**
   * Update a stolen property record
   */
  async update(id: string, updateStolenPropertyDto: any): Promise<StolenPropertyRecord> {
    // Use base service to update common fields
    await this.recordsService.update(id, updateStolenPropertyDto);
    
    // Find the updated record
    const property = await this.findOne(id);
    
    // Update specific stolen property fields
    if (updateStolenPropertyDto.propertySource) {
      property.propertySource = updateStolenPropertyDto.propertySource;
    }
    
    if (updateStolenPropertyDto.propertyType) {
      property.propertyType = updateStolenPropertyDto.propertyType;
    }
    
    if (updateStolenPropertyDto.description) {
      property.description = updateStolenPropertyDto.description;
    }
    
    if (updateStolenPropertyDto.estimatedValue !== undefined) {
      property.estimatedValue = updateStolenPropertyDto.estimatedValue;
    }
    
    if (updateStolenPropertyDto.foundBy !== undefined) {
      property.foundBy = updateStolenPropertyDto.foundBy;
    }
    
    if (updateStolenPropertyDto.dateOfTheft) {
      property.dateOfTheft = new Date(updateStolenPropertyDto.dateOfTheft);
    }
    
    if (updateStolenPropertyDto.location) {
      property.location = updateStolenPropertyDto.location;
    }
    
    if (updateStolenPropertyDto.ownerName !== undefined) {
      property.ownerName = updateStolenPropertyDto.ownerName;
    }
    
    if (updateStolenPropertyDto.ownerContact !== undefined) {
      property.ownerContact = updateStolenPropertyDto.ownerContact;
    }
    
    if (updateStolenPropertyDto.linkedCaseNumber !== undefined) {
      property.linkedCaseNumber = updateStolenPropertyDto.linkedCaseNumber;
    }
    
    if (updateStolenPropertyDto.dateOfReceipt) {
      property.dateOfReceipt = new Date(updateStolenPropertyDto.dateOfReceipt);
    }
    
    if (updateStolenPropertyDto.receivedBy !== undefined) {
      property.receivedBy = updateStolenPropertyDto.receivedBy;
    }
    
    if (updateStolenPropertyDto.recoveryStatus) {
      property.recoveryStatus = updateStolenPropertyDto.recoveryStatus as any;
    }
    
    if (updateStolenPropertyDto.recoveryDate) {
      property.recoveryDate = new Date(updateStolenPropertyDto.recoveryDate);
    }
    
    if (updateStolenPropertyDto.isSold !== undefined) {
      property.isSold = updateStolenPropertyDto.isSold;
    }
    
    if (updateStolenPropertyDto.soldPrice !== undefined) {
      property.soldPrice = updateStolenPropertyDto.soldPrice;
    }
    
    if (updateStolenPropertyDto.dateOfRemittance) {
      property.dateOfRemittance = new Date(updateStolenPropertyDto.dateOfRemittance);
    }
    
    if (updateStolenPropertyDto.disposalMethod !== undefined) {
      property.disposalMethod = updateStolenPropertyDto.disposalMethod;
    }
    
    if (updateStolenPropertyDto.photoUrls !== undefined) {
      property.photoUrls = updateStolenPropertyDto.photoUrls;
    }
    
    if (updateStolenPropertyDto.additionalDetails) {
      property.additionalDetails = updateStolenPropertyDto.additionalDetails;
    }
    
    return this.stolenPropertyRepository.save(property);
  }

  /**
   * Set property as recovered
   */
  async markAsRecovered(id: string, recoveryDetails: {
    recoveryDate: string;
    remarks?: string;
    notes?: string;
    lastModifiedById?: string;
  }): Promise<StolenPropertyRecord> {
    const property = await this.findOne(id);
    
    property.recoveryStatus = 'recovered';
    property.recoveryDate = new Date(recoveryDetails.recoveryDate);
    
    if (recoveryDetails.remarks) {
      property.remarks = recoveryDetails.remarks;
    }
    
    if (recoveryDetails.notes) {
      property.notes = recoveryDetails.notes;
    }
    
    if (recoveryDetails.lastModifiedById) {
      property.lastModifiedById = recoveryDetails.lastModifiedById;
    }
    
    return this.stolenPropertyRepository.save(property);
  }
  
  /**
   * Mark property as sold/disposed
   */
  async markAsSold(id: string, saleDetails: {
    soldPrice: number;
    dateOfRemittance: string;
    disposalMethod: string;
    remarks?: string;
    notes?: string;
    lastModifiedById?: string;
  }): Promise<StolenPropertyRecord> {
    const property = await this.findOne(id);
    
    property.isSold = true;
    property.soldPrice = saleDetails.soldPrice;
    property.dateOfRemittance = new Date(saleDetails.dateOfRemittance);
    property.disposalMethod = saleDetails.disposalMethod;
    
    if (saleDetails.remarks) {
      property.remarks = saleDetails.remarks;
    }
    
    if (saleDetails.notes) {
      property.notes = saleDetails.notes;
    }
    
    if (saleDetails.lastModifiedById) {
      property.lastModifiedById = saleDetails.lastModifiedById;
    }
    
    return this.stolenPropertyRepository.save(property);
  }

  /**
   * Remove a stolen property record (delegated to base service)
   */
  async remove(id: string): Promise<{ success: boolean }> {
    return this.recordsService.remove(id);
  }
} 