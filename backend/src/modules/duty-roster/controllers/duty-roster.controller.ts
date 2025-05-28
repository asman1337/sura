import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { DutyRosterService } from '../services/duty-roster.service';
import { CreateDutyRosterDto } from '../dto/create-duty-roster.dto';
import { UpdateDutyRosterDto } from '../dto/update-duty-roster.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnitAccessGuard, UnitAccess } from '../../../common/guards/unit-access.guard';
import { UnitId } from '../../../common/decorators/unit.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';

@ApiTags('duty-roster')
@Controller('duty-roster')
@UseGuards(JwtAuthGuard, UnitAccessGuard)
@UnitAccess('duty-roster')
export class DutyRosterController {
  constructor(private readonly dutyRosterService: DutyRosterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new duty roster' })
  @ApiResponse({ status: 201, description: 'The duty roster has been successfully created.' })
  create(
    @Body() createDutyRosterDto: CreateDutyRosterDto, 
    @CurrentUser() user,
    @UnitId() unitId: string
  ) {
    const effectiveUnitId = createDutyRosterDto.unitId || unitId;
    return this.dutyRosterService.create(createDutyRosterDto, user.id, effectiveUnitId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all duty rosters or filter by unit' })
  @ApiResponse({ status: 200, description: 'Return all duty rosters.' })
  findAll(
    @Query('unitId') unitId: string,
    @UnitId() userUnitId: string
  ) {
    // If unitId is provided in query and user has access to it, use that
    // Otherwise, default to user's primary unit
    const effectiveUnitId = unitId || userUnitId;
    return this.dutyRosterService.findAllByUnit(effectiveUnitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a duty roster by ID' })
  @ApiResponse({ status: 200, description: 'Return the duty roster.' })
  @ApiResponse({ status: 404, description: 'Duty roster not found.' })
  findOne(@Param('id') id: string) {
    return this.dutyRosterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a duty roster' })
  @ApiResponse({ status: 200, description: 'The duty roster has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Duty roster not found.' })
  update(@Param('id') id: string, @Body() updateDutyRosterDto: UpdateDutyRosterDto) {
    return this.dutyRosterService.update(id, updateDutyRosterDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a duty roster' })
  @ApiResponse({ status: 200, description: 'The duty roster has been successfully published.' })
  @ApiResponse({ status: 404, description: 'Duty roster not found.' })
  publish(@Param('id') id: string) {
    return this.dutyRosterService.publish(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a duty roster' })
  @ApiResponse({ status: 200, description: 'The duty roster has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Duty roster not found.' })
  remove(@Param('id') id: string) {
    return this.dutyRosterService.remove(id);
  }
} 