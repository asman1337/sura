import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DutyShift } from '../entities/duty-shift.entity';
import { CreateDutyShiftDto } from '../dto/create-duty-shift.dto';
import { UpdateDutyShiftDto } from '../dto/update-duty-shift.dto';

@Injectable()
export class DutyShiftService {
  constructor(
    @InjectRepository(DutyShift)
    private dutyShiftRepository: Repository<DutyShift>,
  ) {}

  async create(createDutyShiftDto: CreateDutyShiftDto): Promise<DutyShift> {
    const dutyShift = this.dutyShiftRepository.create(createDutyShiftDto);
    return this.dutyShiftRepository.save(dutyShift);
  }

  async findAll(): Promise<DutyShift[]> {
    return this.dutyShiftRepository.find({
      order: { startTime: 'ASC' }
    });
  }

  async findOne(id: string): Promise<DutyShift> {
    const dutyShift = await this.dutyShiftRepository.findOne({
      where: { id }
    });
    
    if (!dutyShift) {
      throw new NotFoundException(`Duty shift with ID ${id} not found`);
    }
    
    return dutyShift;
  }

  async update(id: string, updateDutyShiftDto: UpdateDutyShiftDto): Promise<DutyShift> {
    const dutyShift = await this.findOne(id);
    Object.assign(dutyShift, updateDutyShiftDto);
    return this.dutyShiftRepository.save(dutyShift);
  }

  async remove(id: string): Promise<void> {
    const dutyShift = await this.findOne(id);
    await this.dutyShiftRepository.remove(dutyShift);
  }

  async seedDefaultShifts(): Promise<void> {
    const defaultShifts = [
      { name: 'Morning', startTime: '06:00:00', endTime: '14:00:00', isDefault: true },
      { name: 'Day', startTime: '14:00:00', endTime: '22:00:00', isDefault: true },
      { name: 'Night', startTime: '22:00:00', endTime: '06:00:00', isDefault: true }
    ];

    for (const shift of defaultShifts) {
      const existingShift = await this.dutyShiftRepository.findOne({
        where: { name: shift.name }
      });

      if (!existingShift) {
        await this.create(shift);
      }
    }
  }
} 