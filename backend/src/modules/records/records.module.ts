import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { RecordsController } from './controllers/records.controller';
import { UDCaseController } from './controllers/ud-case.controller';
import { StolenPropertyController } from './controllers/stolen-property.controller';

// Services
import { RecordsService } from './services/records.service';
import { UDCaseService } from './services/ud-case.service';
import { StolenPropertyService } from './services/stolen-property.service';

// Entities
import { BaseRecord } from './entities/base-record.entity';
import { UDCaseRecord } from './entities/ud-case.entity';
import { StolenPropertyRecord } from './entities/stolen-property.entity';

// Import related modules
import { OfficersModule } from '../officers/officers.module';
import { UnitsModule } from '../units/units.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaseRecord,
      UDCaseRecord,
      StolenPropertyRecord,
    ]),
    OfficersModule,
    UnitsModule,
    OrganizationsModule,
  ],
  controllers: [
    RecordsController,
    UDCaseController,
    StolenPropertyController,
  ],
  providers: [
    RecordsService,
    UDCaseService,
    StolenPropertyService,
  ],
  exports: [
    RecordsService,
    UDCaseService, 
    StolenPropertyService,
  ],
})
export class RecordsModule {} 