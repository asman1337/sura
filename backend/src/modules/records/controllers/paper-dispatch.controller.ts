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
  Request,
} from '@nestjs/common';
import { PaperDispatchService } from '../services/paper-dispatch.service';
import { CreatePaperDispatchDto } from '../dto/create-paper-dispatch.dto';
import { UpdatePaperDispatchDto } from '../dto/update-paper-dispatch.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';

@Controller('paper-dispatch')
@UseGuards(JwtAuthGuard)
export class PaperDispatchController {
  constructor(private readonly paperDispatchService: PaperDispatchService) {}

  @Post()
  async create(@Body() createDto: CreatePaperDispatchDto, @CurrentUser() user) {

    return await this.paperDispatchService.create(createDto, user?.id);
  }

  @Get()
  async findAll(@Query('unitId') unitId?: string) {
    if (unitId) {
      return await this.paperDispatchService.findByUnit(unitId);
    }
    return await this.paperDispatchService.findAll();
  }

  @Get('stats')
  async getStats(@Query('unitId') unitId?: string) {
    return await this.paperDispatchService.getStats(unitId);
  }

  @Get('transition-overdue')
  async transitionOverdueRecords() {
    const count = await this.paperDispatchService.transitionOverdueRecords();
    return {
      message: `Transitioned ${count} records to RED_INK registry`,
      count,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.paperDispatchService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaperDispatchDto,
    @CurrentUser() user,
  ) {
    // Set the last modified by user ID
    const dto = {
      ...updateDto,
      lastModifiedById: user?.id,
    };
    return await this.paperDispatchService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.paperDispatchService.remove(id);
    return { message: 'Paper dispatch record deleted successfully' };
  }
}
