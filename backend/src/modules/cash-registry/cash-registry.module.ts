import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegistryEntry } from './entities/cash-registry-entry.entity';
import { CashRegistryDailyBalance } from './entities/cash-registry-daily-balance.entity';
import { CashRegistryService } from './services/cash-registry.service';
import { DailyBalanceService } from './services/daily-balance.service';
import { CashRegistryController } from './controllers/cash-registry.controller';
import { DailyBalanceController } from './controllers/daily-balance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashRegistryEntry,
      CashRegistryDailyBalance
    ])
  ],
  controllers: [
    CashRegistryController,
    DailyBalanceController
  ],
  providers: [
    CashRegistryService,
    DailyBalanceService
  ],
  exports: [
    CashRegistryService,
    DailyBalanceService
  ]
})
export class CashRegistryModule {} 