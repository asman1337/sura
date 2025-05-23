import { Controller, Get, Param, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { OfficersService } from '../services/officers.service';
import { Officer } from '../entities/officer.entity';
import { ApiTags } from '@nestjs/swagger';
import { UnitAccess } from 'src/common/guards/unit-access.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UnitAccessGuard } from '../../../common/guards/unit-access.guard';

@ApiTags('Officers')
@Controller('officers')
@UnitAccess('officers')
@UseGuards(JwtAuthGuard, UnitAccessGuard)
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  /**
   * Get all officers with optional filtering by unitId, organizationId, or departmentId
   */
  @Get()
  async findAll(
    @Query('unitId') unitId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('departmentId') departmentId?: string
  ): Promise<Officer[]> {
    if (unitId) {
      return this.officersService.findByUnitId(unitId);
    }
    
    if (organizationId) {
      return this.officersService.findByOrganizationId(organizationId);
    }
    
    if (departmentId) {
      return this.officersService.findByDepartmentId(departmentId);
    }
    
    return this.officersService.findAll();
  }

  /**
   * Get officer by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Officer> {
    const officer = await this.officersService.findByIdWithRelations(id);
    if (!officer) {
      throw new NotFoundException(`Officer with ID ${id} not found`);
    }
    return officer;
  }
}
