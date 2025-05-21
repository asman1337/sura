import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Officer } from '../officers/entities/officer.entity';
import { OfficerRank } from '../officer-ranks/entities/officer-rank.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Unit } from '../units/entities/unit.entity';
import { Department } from '../departments/entities/department.entity';
import { Shelf } from '../malkhana/entities/shelf.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Officer,
      OfficerRank,
      Organization,
      Unit,
      Department,
      Shelf
    ])
  ],
  providers: [SeederService],
  exports: [SeederService]
})
export class SeederModule {} 