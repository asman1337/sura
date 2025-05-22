import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DutyAssignment } from '../entities/duty-assignment.entity';
import { CreateDutyAssignmentDto } from '../dto/create-duty-assignment.dto';
import { UpdateDutyAssignmentDto } from '../dto/update-duty-assignment.dto';

@Injectable()
export class DutyAssignmentService {
  constructor(
    @InjectRepository(DutyAssignment)
    private dutyAssignmentRepository: Repository<DutyAssignment>,
  ) {}

  async create(createDutyAssignmentDto: CreateDutyAssignmentDto): Promise<DutyAssignment> {
    const dutyAssignment = this.dutyAssignmentRepository.create(createDutyAssignmentDto);
    return this.dutyAssignmentRepository.save(dutyAssignment);
  }

  async createMany(createDutyAssignmentDtos: CreateDutyAssignmentDto[]): Promise<DutyAssignment[]> {
    const dutyAssignments = this.dutyAssignmentRepository.create(createDutyAssignmentDtos);
    return this.dutyAssignmentRepository.save(dutyAssignments);
  }

  async findAll(): Promise<DutyAssignment[]> {
    return this.dutyAssignmentRepository.find({
      relations: ['officer', 'shift', 'dutyRoster']
    });
  }

  async findByUnit(unitId: string): Promise<DutyAssignment[]> {
    return this.dutyAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.dutyRoster', 'roster')
      .innerJoinAndSelect('assignment.officer', 'officer')
      .innerJoinAndSelect('assignment.shift', 'shift')
      .where('roster.unitId = :unitId', { unitId })
      .orderBy('assignment.date', 'ASC')
      .getMany();
  }

  async findByRoster(rosterId: string): Promise<DutyAssignment[]> {
    return this.dutyAssignmentRepository.find({
      where: { dutyRosterId: rosterId },
      relations: ['officer', 'shift'],
      order: { date: 'ASC' }
    });
  }

  async findByOfficer(officerId: string): Promise<DutyAssignment[]> {
    return this.dutyAssignmentRepository.find({
      where: { officerId },
      relations: ['shift', 'dutyRoster'],
      order: { date: 'ASC' }
    });
  }

  async findOne(id: string): Promise<DutyAssignment> {
    const dutyAssignment = await this.dutyAssignmentRepository.findOne({
      where: { id },
      relations: ['officer', 'shift', 'dutyRoster']
    });
    
    if (!dutyAssignment) {
      throw new NotFoundException(`Duty assignment with ID ${id} not found`);
    }
    
    return dutyAssignment;
  }

  async update(id: string, updateDutyAssignmentDto: UpdateDutyAssignmentDto): Promise<DutyAssignment> {
    const dutyAssignment = await this.findOne(id);
    Object.assign(dutyAssignment, updateDutyAssignmentDto);
    return this.dutyAssignmentRepository.save(dutyAssignment);
  }

  async remove(id: string): Promise<void> {
    const dutyAssignment = await this.findOne(id);
    await this.dutyAssignmentRepository.remove(dutyAssignment);
  }
} 