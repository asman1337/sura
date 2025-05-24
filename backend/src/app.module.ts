import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UnitsModule } from './modules/units/units.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { OfficersModule } from './modules/officers/officers.module';
import { MalkhanaModule } from './modules/malkhana/malkhana.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { OfficerRanksModule } from './modules/officer-ranks/officer-ranks.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DutyRosterModule } from './modules/duty-roster/duty-roster.module';
import { RecordsModule } from './modules/records/records.module';
import { CashRegistryModule } from './modules/cash-registry/cash-registry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: +configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'sura'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV', 'development') !== 'production',
        logging: configService.get('DATABASE_LOGGING', 'false') === 'true',
      }),
    }),
    OfficersModule, 
    OfficerRanksModule,
    OrganizationsModule, 
    DepartmentsModule,
    UnitsModule, 
    AuthModule,
    SeederModule,
    MalkhanaModule,
    DutyRosterModule,
    RecordsModule,
    CashRegistryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
