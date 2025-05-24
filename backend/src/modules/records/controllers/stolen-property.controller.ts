import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common';
import { StolenPropertyService } from '../services/stolen-property.service';
import { CreateStolenPropertyDto } from '../dto/create-stolen-property.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('stolen-property')
@Controller('stolen-property')
@UseGuards(JwtAuthGuard)
export class StolenPropertyController {
  constructor(private readonly stolenPropertyService: StolenPropertyService) {}

  /**
   * Create a new stolen property record
   */
  @Post()
  @ApiOperation({ summary: 'Create a new stolen property record' })
  async create(@Body(new ValidationPipe({ whitelist: true })) createStolenPropertyDto: CreateStolenPropertyDto) {
    return this.stolenPropertyService.create(createStolenPropertyDto);
  }

  /**
   * Get all stolen property records with optional filtering
   */
  @Get()
  @ApiOperation({ summary: 'Find all stolen property records with optional filters' })
  @ApiQuery({ name: 'unitId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'propertyType', required: false })
  @ApiQuery({ name: 'propertySource', required: false })
  @ApiQuery({ name: 'recoveryStatus', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async findAll(
    @Query('unitId') unitId?: string,
    @Query('status') status?: string,
    @Query('propertyType') propertyType?: string,
    @Query('propertySource') propertySource?: string,
    @Query('recoveryStatus') recoveryStatus?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.stolenPropertyService.findAll({
      unitId,
      status,
      propertyType,
      propertySource,
      recoveryStatus,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  /**
   * Get a specific stolen property record by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Find one stolen property record by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stolenPropertyService.findOne(id);
  }

  /**
   * Get a stolen property record by property ID
   */
  @Get('property-id/:propertyId')
  @ApiOperation({ summary: 'Find one stolen property record by property ID' })
  async findByPropertyId(@Param('propertyId') propertyId: string) {
    return this.stolenPropertyService.findByPropertyId(propertyId);
  }

  /**
   * Update a stolen property record
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a stolen property record' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateStolenPropertyDto: Partial<CreateStolenPropertyDto>
  ) {
    return this.stolenPropertyService.update(id, updateStolenPropertyDto);
  }

  /**
   * Mark a stolen property as recovered
   */
  @Patch(':id/recover')
  @ApiOperation({ summary: 'Mark a stolen property as recovered' })
  async markAsRecovered(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() recoveryDetails: { recoveryDate: string; remarks?: string; notes?: string }
  ) {
    return this.stolenPropertyService.markAsRecovered(id, recoveryDetails);
  }

  /**
   * Mark a property as sold/disposed
   */
  @Patch(':id/sell')
  @ApiOperation({ summary: 'Mark a property as sold/disposed' })
  async markAsSold(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() saleDetails: { 
      soldPrice: number; 
      dateOfRemittance: string; 
      disposalMethod: string;
      remarks?: string;
      notes?: string;
    },
  ) {
    return this.stolenPropertyService.markAsSold(id, saleDetails);
  }

  /**
   * Delete a stolen property record (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a stolen property record' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.stolenPropertyService.remove(id);
  }
} 