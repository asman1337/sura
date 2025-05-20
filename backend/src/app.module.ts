import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OfficersModule } from './modules/officers/officers.module';
import { OfficerRanksModule } from './modules/officer-ranks/officer-ranks.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { UnitsModule } from './modules/units/units.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { MalkhanaModule } from './modules/malkhana/malkhana.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'sura',
      synchronize: process.env.NODE_ENV !== 'production',
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      logging: process.env.NODE_ENV !== 'production'
    }),
    OfficersModule, 
    OfficerRanksModule,
    OrganizationsModule, 
    DepartmentsModule,
    UnitsModule, 
    AuthModule,
    SeederModule,
    MalkhanaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
