import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DutyShiftService } from '../services/duty-shift.service';
import { CreateDutyShiftDto } from '../dto/create-duty-shift.dto';
import { UpdateDutyShiftDto } from '../dto/update-duty-shift.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnitAccessGuard, UnitAccess } from '../../../common/guards/unit-access.guard';

@ApiTags('duty-shifts')
@Controller('duty-shifts')
@UseGuards(JwtAuthGuard, UnitAccessGuard)
@UnitAccess('duty-shifts')
export class DutyShiftController {
  constructor(private readonly dutyShiftService: DutyShiftService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new duty shift' })
  @ApiResponse({ status: 201, description: 'The duty shift has been successfully created.' })
  create(@Body() createDutyShiftDto: CreateDutyShiftDto) {
    return this.dutyShiftService.create(createDutyShiftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all duty shifts' })
  @ApiResponse({ status: 200, description: 'Return all duty shifts.' })
  findAll() {
    return this.dutyShiftService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a duty shift by ID' })
  @ApiResponse({ status: 200, description: 'Return the duty shift.' })
  @ApiResponse({ status: 404, description: 'Duty shift not found.' })
  findOne(@Param('id') id: string) {
    return this.dutyShiftService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a duty shift' })
  @ApiResponse({ status: 200, description: 'The duty shift has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Duty shift not found.' })
  update(@Param('id') id: string, @Body() updateDutyShiftDto: UpdateDutyShiftDto) {
    return this.dutyShiftService.update(id, updateDutyShiftDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a duty shift' })
  @ApiResponse({ status: 200, description: 'The duty shift has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Duty shift not found.' })
  remove(@Param('id') id: string) {
    return this.dutyShiftService.remove(id);
  }

  @Post('seed-defaults')
  @ApiOperation({ summary: 'Seed default duty shifts' })
  @ApiResponse({ status: 201, description: 'Default duty shifts have been seeded.' })
  seedDefaults() {
    return this.dutyShiftService.seedDefaultShifts();
  }
} 