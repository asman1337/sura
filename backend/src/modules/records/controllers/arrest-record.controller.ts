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
} from '@nestjs/common';
import { ArrestRecordService } from '../services/arrest-record.service';
import { CreateArrestRecordDto } from '../dto/create-arrest-record.dto';
import { UpdateArrestRecordDto } from '../dto/update-arrest-record.dto';
import { UserId } from '../../../common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('arrests')
@UseGuards(JwtAuthGuard)
export class ArrestRecordController {
  constructor(private readonly arrestRecordService: ArrestRecordService) {}

  @Post()
  create(
    @Body() createArrestRecordDto: CreateArrestRecordDto,
    @UserId() createdById: string,
  ) {
    return this.arrestRecordService.create(createArrestRecordDto, createdById);
  }

  @Get()
  findAll(@Query('unitId') unitId?: string) {
    return this.arrestRecordService.findAll(unitId);
  }

  @Get('statistics')
  getStatistics(@Query('unitId') unitId?: string) {
    return this.arrestRecordService.getStatistics(unitId);
  }

  @Get('search/by-name')
  findByAccusedName(
    @Query('name') name: string,
    @Query('unitId') unitId?: string,
  ) {
    return this.arrestRecordService.findByAccusedName(name, unitId);
  }

  @Get('search/by-serial/:serialNumber')
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.arrestRecordService.findBySerialNumber(serialNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arrestRecordService.findOne(id);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArrestRecordDto: UpdateArrestRecordDto,
    @UserId() lastModifiedById: string,
  ) {
    return this.arrestRecordService.update(
      id,
      updateArrestRecordDto,
      lastModifiedById,
    );
  }
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() lastModifiedById: string) {
    return this.arrestRecordService.remove(id, lastModifiedById);
  }
}
