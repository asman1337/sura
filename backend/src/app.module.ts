import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OfficersModule } from './modules/officers/officers.module';
import { OfficerRanksModule } from './modules/officer-ranks/officer-ranks.module';

import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { UnitsModule } from './modules/units/units.module';

@Module({
  imports: [
    OfficersModule, 
    OfficerRanksModule,

    OrganizationsModule, 
    DepartmentsModule,
    UnitsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
