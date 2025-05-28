import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UDCaseRecord } from '../entities/ud-case.entity';
import { CreateUDCaseDto } from '../dto/create-ud-case.dto';
import { UpdateUDCaseDto } from '../dto/update-ud-case.dto';
import { RecordsService } from './records.service';

@Injectable()
export class UDCaseService {
  private readonly logger = new Logger(UDCaseService.name);
  constructor(
    @InjectRepository(UDCaseRecord)
    private udCaseRepository: Repository<UDCaseRecord>,
    private recordsService: RecordsService,
  ) {}

  /**
   * Create a new UD case record
   */
  async create(createUDCaseDto: CreateUDCaseDto): Promise<UDCaseRecord> {
    // Check if case number already exists
    const existingCase = await this.udCaseRepository.findOne({
      where: { caseNumber: createUDCaseDto.caseNumber },
    });
    
    if (existingCase) {
      throw new ConflictException(`UD Case with case number ${createUDCaseDto.caseNumber} already exists`);
    }
    
    // Create new UD case record
    const udCase = this.udCaseRepository.create(createUDCaseDto);
    
    // Parse date string to Date object
    udCase.dateOfOccurrence = new Date(createUDCaseDto.dateOfOccurrence);
    
    // Parse postMortem date if provided
    if (createUDCaseDto.postMortemDate) {
      udCase.postMortemDate = new Date(createUDCaseDto.postMortemDate);
    }
    
    return this.udCaseRepository.save(udCase);
  }

  /**
   * Find all UD case records with filters
   */
  async findAll(options?: {
    unitId?: string;
    status?: string;
    investigationStatus?: string;
    identificationStatus?: string;
    skip?: number;
    take?: number;
  }): Promise<{ records: any[]; total: number }> {
    const { unitId, status, investigationStatus, identificationStatus, skip = 0, take = 10 } = options || {};
    
    this.logger.debug('unitId --- ', unitId);
    
    const queryBuilder = this.udCaseRepository
      .createQueryBuilder('udCase')
      .leftJoinAndSelect('udCase.unit', 'unit')
      .where('udCase.isActive = :isActive', { isActive: true });
      
    // Apply filters if provided
    if (unitId) {
      queryBuilder.andWhere('udCase.unitId = :unitId', { unitId });
    }
    
    if (status) {
      queryBuilder.andWhere('udCase.status = :status', { status });
    }
    
    if (investigationStatus) {
      queryBuilder.andWhere('udCase.investigationStatus = :investigationStatus', { investigationStatus });
    }
    
    if (identificationStatus) {
      queryBuilder.andWhere('udCase.identificationStatus = :identificationStatus', { identificationStatus });
    }
    
    // Count total records for pagination
    const total = await queryBuilder.getCount();
    
    // Get paginated records
    const records = await queryBuilder
      .orderBy('udCase.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();
      
    return { records, total };
  }

  /**
   * Find one UD case record by ID
   */
  async findOne(id: string): Promise<UDCaseRecord> {
    const record = await this.udCaseRepository.findOne({
      where: { id },
      relations: ['createdBy', 'lastModifiedBy', 'unit'],
    });
    
    if (!record) {
      throw new NotFoundException(`UD Case record with ID ${id} not found`);
    }
    
    return record;
  }

  /**
   * Find UD case by case number
   */
  async findByCaseNumber(caseNumber: string): Promise<UDCaseRecord> {
    const record = await this.udCaseRepository.findOne({
      where: { caseNumber },
      relations: ['createdBy', 'lastModifiedBy', 'unit'],
    });
    
    if (!record) {
      throw new NotFoundException(`UD Case with case number ${caseNumber} not found`);
    }
    
    return record;
  }

  /**
   * Update a UD case record
   */
  async update(id: string, updateUDCaseDto: UpdateUDCaseDto): Promise<UDCaseRecord> {
    // Use base service to update common fields
    await this.recordsService.update(id, updateUDCaseDto);
    
    // Find the updated record
    const udCase = await this.findOne(id);
    
    // Update specific UD case fields
    if (updateUDCaseDto.dateOfOccurrence) {
      udCase.dateOfOccurrence = new Date(updateUDCaseDto.dateOfOccurrence);
    }
    
    if (updateUDCaseDto.postMortemDate) {
      udCase.postMortemDate = new Date(updateUDCaseDto.postMortemDate);
    }
    
    // Update deceased info
    if (updateUDCaseDto.deceasedName !== undefined) {
      udCase.deceasedName = updateUDCaseDto.deceasedName;
    }
    
    if (updateUDCaseDto.deceasedAddress !== undefined) {
      udCase.deceasedAddress = updateUDCaseDto.deceasedAddress;
    }
    
    if (updateUDCaseDto.identificationStatus) {
      udCase.identificationStatus = updateUDCaseDto.identificationStatus;
    }
    
    // Update informant info
    if (updateUDCaseDto.informantName !== undefined) {
      udCase.informantName = updateUDCaseDto.informantName;
    }
    
    if (updateUDCaseDto.informantAddress !== undefined) {
      udCase.informantAddress = updateUDCaseDto.informantAddress;
    }
    
    if (updateUDCaseDto.informantContact !== undefined) {
      udCase.informantContact = updateUDCaseDto.informantContact;
    }
    
    if (updateUDCaseDto.informantRelation !== undefined) {
      udCase.informantRelation = updateUDCaseDto.informantRelation;
    }
    
    // Update case details
    if (updateUDCaseDto.apparentCauseOfDeath !== undefined) {
      udCase.apparentCauseOfDeath = updateUDCaseDto.apparentCauseOfDeath;
    }
    
    if (updateUDCaseDto.location) {
      udCase.location = updateUDCaseDto.location;
    }
    
    // Update assigned officer information (simple fields)
    if (updateUDCaseDto.assignedOfficerName !== undefined) {
      udCase.assignedOfficerName = updateUDCaseDto.assignedOfficerName;
    }
    
    if (updateUDCaseDto.assignedOfficerBadgeNumber !== undefined) {
      udCase.assignedOfficerBadgeNumber = updateUDCaseDto.assignedOfficerBadgeNumber;
    }
    
    if (updateUDCaseDto.assignedOfficerContact !== undefined) {
      udCase.assignedOfficerContact = updateUDCaseDto.assignedOfficerContact;
    }
    
    if (updateUDCaseDto.assignedOfficerRank !== undefined) {
      udCase.assignedOfficerRank = updateUDCaseDto.assignedOfficerRank;
    }
    
    if (updateUDCaseDto.assignedOfficerDepartment !== undefined) {
      udCase.assignedOfficerDepartment = updateUDCaseDto.assignedOfficerDepartment;
    }
    
    // Update post mortem info
    if (updateUDCaseDto.postMortemDoctor !== undefined) {
      udCase.postMortemDoctor = updateUDCaseDto.postMortemDoctor;
    }
    
    if (updateUDCaseDto.postMortemHospital !== undefined) {
      udCase.postMortemHospital = updateUDCaseDto.postMortemHospital;
    }
    
    // Update photos
    if (updateUDCaseDto.photoUrls !== undefined) {
      udCase.photoUrls = updateUDCaseDto.photoUrls;
    }
    
    if (updateUDCaseDto.investigationStatus) {
      udCase.investigationStatus = updateUDCaseDto.investigationStatus as any;
    }
    
    if (updateUDCaseDto.description !== undefined) {
      udCase.description = updateUDCaseDto.description;
    }
    
    if (updateUDCaseDto.additionalDetails) {
      udCase.additionalDetails = updateUDCaseDto.additionalDetails;
    }
    
    return this.udCaseRepository.save(udCase);
  }

  /**
   * Remove a UD case record (delegated to base service)
   */
  async remove(id: string): Promise<{ success: boolean }> {
    return this.recordsService.remove(id);
  }
} 