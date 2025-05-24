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

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /**
   * Get all records with optional filtering
   */
  @Get()
  async findAll(
    @Query('type') type?: RecordType,
    @Query('unitId') unitId?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.recordsService.findAll({
      type,
      unitId,
      status,
      skip,
      take,
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
    @Body(new ValidationPipe({ whitelist: true })) updateRecordDto: UpdateRecordDto
  ) {
    return this.recordsService.update(id, updateRecordDto);
  }

  /**
   * Delete a record (soft delete)
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recordsService.remove(id);
  }

  /**
   * Get statistics about records
   */
  @Get('stats')
  async getStats(@Query('unitId') unitId?: string) {
    return this.recordsService.getStats(unitId);
  }
} 