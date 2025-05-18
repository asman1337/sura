import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OfficersModule } from './modules/officers/officers.module';
import { OfficerRanksModule } from './modules/officer-ranks/officer-ranks.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { UnitsModule } from './modules/units/units.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './modules/seeder/seeder.module';

// Import all entities
import { Officer } from './modules/officers/entities/officer.entity';
import { OfficerRank } from './modules/officer-ranks/entities/officer-rank.entity';
import { Organization } from './modules/organizations/entities/organization.entity';
import { Department } from './modules/departments/entities/department.entity';
import { Unit } from './modules/units/entities/unit.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'sura',
      entities: [Officer, OfficerRank, Organization, Department, Unit],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-create database schema (disable in production)
    }),
    OfficersModule, 
    OfficerRanksModule,
    OrganizationsModule, 
    DepartmentsModule,
    UnitsModule, 
    AuthModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
