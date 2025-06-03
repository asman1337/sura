import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DutyRoster, DutyRosterStatus } from '../entities/duty-roster.entity';
import { CreateDutyRosterDto } from '../dto/create-duty-roster.dto';
import { UpdateDutyRosterDto } from '../dto/update-duty-roster.dto';

@Injectable()
export class DutyRosterService {
  constructor(
    @InjectRepository(DutyRoster)
    private dutyRosterRepository: Repository<DutyRoster>,
  ) {}

  async create(createDutyRosterDto: CreateDutyRosterDto, officerId: string, unitId: string): Promise<DutyRoster> {
    const dutyRoster = this.dutyRosterRepository.create({
      ...createDutyRosterDto,
      createdById: officerId,
      unitId,
      status: createDutyRosterDto.status || DutyRosterStatus.DRAFT
    });
    return this.dutyRosterRepository.save(dutyRoster);
  }

  async findAll(): Promise<DutyRoster[]> {
    return this.dutyRosterRepository.find({
      relations: ['unit', 'createdBy']
    });
  }

  async findAllByUnit(unitId: string): Promise<DutyRoster[]> {
    return this.dutyRosterRepository.find({
      where: { unitId },
      relations: ['unit', 'createdBy'],
      order: { startDate: 'DESC' }
    });
  }

  async findOne(id: string): Promise<DutyRoster> {
    const dutyRoster = await this.dutyRosterRepository.findOne({
      where: { id },
      relations: ['unit', 'createdBy', 'assignments', 'assignments.officer', 'assignments.shift']
    });
    
    if (!dutyRoster) {
      throw new NotFoundException(`Duty roster with ID ${id} not found`);
    }
    
    return dutyRoster;
  }

  async update(id: string, updateDutyRosterDto: UpdateDutyRosterDto): Promise<DutyRoster> {
    const dutyRoster = await this.findOne(id);
    
    // Only allow updates to draft rosters
    if (dutyRoster.status === DutyRosterStatus.PUBLISHED) {
      throw new Error('Cannot update a published duty roster');
    }
    
    Object.assign(dutyRoster, updateDutyRosterDto);
    return this.dutyRosterRepository.save(dutyRoster);
  }

  async publish(id: string): Promise<DutyRoster> {
    const dutyRoster = await this.findOne(id);
    if (dutyRoster.status === DutyRosterStatus.PUBLISHED) {
      throw new Error('Duty roster is already published');
    }
    dutyRoster.status = DutyRosterStatus.PUBLISHED;
    return this.dutyRosterRepository.save(dutyRoster);
  }
  async remove(id: string): Promise<void> {
    const dutyRoster = await this.findOne(id);
    
    // Only allow deletion of draft rosters
    if (dutyRoster.status === DutyRosterStatus.PUBLISHED) {
      throw new Error('Cannot delete a published duty roster');
    }
    
    await this.dutyRosterRepository.remove(dutyRoster);
  }

  // Dashboard helper methods
  async getPendingDutiesCount(unitId: string): Promise<number> {
    try {
      return await this.dutyRosterRepository.count({
        where: { 
          unitId,
          status: DutyRosterStatus.DRAFT
        }
      });
    } catch (error) {
      return 0;
    }
  }

  async getRecentDuties(unitId: string, limit: number = 5): Promise<DutyRoster[]> {
    try {
      return await this.dutyRosterRepository.find({
        where: { unitId },
        relations: ['unit', 'createdBy'],
        order: { createdAt: 'DESC' },
        take: limit
      });
    } catch (error) {
      return [];
    }
  }
}