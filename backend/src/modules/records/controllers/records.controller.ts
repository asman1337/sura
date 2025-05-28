import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Delete, 
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common';
import { RecordsService } from '../services/records.service';
import { UpdateRecordDto } from '../dto/update-record.dto';
import { RecordType } from '../dto/create-record.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UnitId } from '../../../common/decorators/unit.decorator';
import { UserId } from '../../../common/decorators/user.decorator';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /**
   * Get statistics about records
   */
  @Get('stats')
  async getStats(
    @Query('unitId') queryUnitId?: string,
    @UnitId() unitIdFromDecorator?: string | null
  ) {
    const unitId = queryUnitId || unitIdFromDecorator || undefined;
    return this.recordsService.getStats(unitId);
  }

  /**
   * Get all records with optional filtering
   */
  @Get()
  async findAll(
    @Query('type') type?: RecordType,
    @Query('unitId') queryUnitId?: string,
    @UnitId() unitIdFromDecorator?: string | null,
    @Query('status') status?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    // Use unit ID from query first, then from decorator if available
    const unitId = queryUnitId || unitIdFromDecorator || undefined;
    
    return this.recordsService.findAll({
      type,
      unitId,
      status,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  /**
   * Get a specific record by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recordsService.findOne(id);
  }

  /**
   * Update record status
   */
  @Post(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateRecordDto: UpdateRecordDto,
    @UserId() userId: string
  ) {
    // Add the user ID as the last modified by ID
    const recordToUpdate = { 
      ...updateRecordDto, 
      lastModifiedById: userId 
    };
    
    return this.recordsService.update(id, recordToUpdate);
  }

  /**
   * Delete a record (soft delete)
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string
  ) {
    // We should also track who deleted the record
    await this.recordsService.update(id, { lastModifiedById: userId });
    return this.recordsService.remove(id);
  }
} 