import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { AuthModule } from '../auth/auth.module';
import { MalkhanaModule } from '../malkhana/malkhana.module';
import { DutyRosterModule } from '../duty-roster/duty-roster.module';
import { RecordsModule } from '../records/records.module';

@Module({
  imports: [AuthModule, MalkhanaModule, DutyRosterModule, RecordsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
