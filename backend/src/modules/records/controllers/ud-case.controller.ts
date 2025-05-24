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
  ValidationPipe,
  Logger
} from '@nestjs/common';
import { UDCaseService } from '../services/ud-case.service';
import { CreateUDCaseDto } from '../dto/create-ud-case.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UnitId, UserId } from '../../../common/decorators';

@Controller('ud-cases')
@UseGuards(JwtAuthGuard)
export class UDCaseController {
  private readonly logger = new Logger(UDCaseController.name);

  constructor(private readonly udCaseService: UDCaseService) {}

  /**
   * Create a new UD case record
   */
  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true })) createUDCaseDto: CreateUDCaseDto,
    @UserId() userId: string,
    @UnitId() unitId: string
  ) {
    // Set creator and unit information
    const newUDCase = {
      ...createUDCaseDto,
      createdById: userId,
      unitId: createUDCaseDto.unitId || unitId
    };
    
    return this.udCaseService.create(newUDCase);
  }

  /**
   * Get all UD case records with optional filtering
   */
  @Get()
  async findAll(
    @Query('unitId') queryUnitId?: string,
    @Query('status') status?: string,
    @Query('investigationStatus') investigationStatus?: string,
    @Query('identificationStatus') identificationStatus?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number
  ) {
    // Use query unitId since UnitId decorator might be causing issues
    const unitId = queryUnitId;
    
    this.logger.debug('unitId from query ---', unitId);
    
    return this.udCaseService.findAll({
      unitId,
      status,
      investigationStatus,
      identificationStatus,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  /**
   * Get a UD case record by case number
   */
  @Get('by-case-number/:caseNumber')
  async findByCaseNumber(@Param('caseNumber') caseNumber: string) {
    return this.udCaseService.findByCaseNumber(caseNumber);
  }

  /**
   * Get a specific UD case record by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.udCaseService.findOne(id);
  }

  /**
   * Update a UD case record
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateUDCaseDto: Partial<CreateUDCaseDto>,
    @UserId() userId: string
  ) {
    // Add last modified by information
    const updatedCase = {
      ...updateUDCaseDto,
      lastModifiedById: userId
    };
    
    return this.udCaseService.update(id, updatedCase);
  }

  /**
   * Delete a UD case record (soft delete)
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string
  ) {
    // Track who is deleting the record
    await this.udCaseService.update(id, { lastModifiedById: userId });
    return this.udCaseService.remove(id);
  }
} 