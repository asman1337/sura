import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';
import { CurrentUser } from '../../../common/decorators';
import { Officer } from '../../officers/entities/officer.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('stats')
  async getStats(@CurrentUser() officer: Officer) {
    return this.dashboardService.getStats(officer);
  }

  @Get('recent-activity')
  async getRecentActivity(@CurrentUser() officer: Officer) {
    return this.dashboardService.getRecentActivity(officer);
  }
}
