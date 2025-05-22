import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DutyAssignmentService } from '../services/duty-assignment.service';
import { CreateDutyAssignmentDto } from '../dto/create-duty-assignment.dto';
import { UpdateDutyAssignmentDto } from '../dto/update-duty-assignment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnitAccessGuard, UnitAccess } from '../../../common/guards/unit-access.guard';
import { UnitId } from '../../../common/decorators/unit.decorator';

@ApiTags('duty-assignments')
@Controller('duty-assignments')
@UseGuards(JwtAuthGuard, UnitAccessGuard)
@UnitAccess('duty-assignments')
export class DutyAssignmentController {
  constructor(private readonly dutyAssignmentService: DutyAssignmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new duty assignment' })
  @ApiResponse({ status: 201, description: 'The duty assignment has been successfully created.' })
  create(@Body() createDutyAssignmentDto: CreateDutyAssignmentDto) {
    return this.dutyAssignmentService.create(createDutyAssignmentDto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Create multiple duty assignments' })
  @ApiResponse({ status: 201, description: 'The duty assignments have been successfully created.' })
  createMany(@Body() createDutyAssignmentDtos: CreateDutyAssignmentDto[]) {
    return this.dutyAssignmentService.createMany(createDutyAssignmentDtos);
  }

  @Get()
  @ApiOperation({ summary: 'Get all duty assignments, optionally filtered by roster or officer' })
  @ApiResponse({ status: 200, description: 'Return duty assignments.' })
  findAll(
    @Query('rosterId') rosterId: string,
    @Query('officerId') officerId: string,
    @UnitId() unitId: string
  ) {
    if (rosterId) {
      return this.dutyAssignmentService.findByRoster(rosterId);
    }
    if (officerId) {
      return this.dutyAssignmentService.findByOfficer(officerId);
    }
    // If no specific filters provided, limit to assignments within user's unit
    return this.dutyAssignmentService.findByUnit(unitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a duty assignment by ID' })
  @ApiResponse({ status: 200, description: 'Return the duty assignment.' })
  @ApiResponse({ status: 404, description: 'Duty assignment not found.' })
  findOne(@Param('id') id: string) {
    return this.dutyAssignmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a duty assignment' })
  @ApiResponse({ status: 200, description: 'The duty assignment has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Duty assignment not found.' })
  update(@Param('id') id: string, @Body() updateDutyAssignmentDto: UpdateDutyAssignmentDto) {
    return this.dutyAssignmentService.update(id, updateDutyAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a duty assignment' })
  @ApiResponse({ status: 200, description: 'The duty assignment has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Duty assignment not found.' })
  remove(@Param('id') id: string) {
    return this.dutyAssignmentService.remove(id);
  }
} 