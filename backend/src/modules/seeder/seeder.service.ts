import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Officer } from '../officers/entities/officer.entity';
import { OfficerRank } from '../officer-ranks/entities/officer-rank.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Unit } from '../units/entities/unit.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Officer)
    private officersRepository: Repository<Officer>,
    
    @InjectRepository(OfficerRank)
    private officerRanksRepository: Repository<OfficerRank>,
    
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async onModuleInit() {
    await this.seedAdminOfficer();
  }

  async seedAdminOfficer() {
    try {
      // Check if admin already exists
      const adminExists = await this.officersRepository.findOne({
        where: { email: 'admin@sura.com' }
      });

      if (adminExists) {
        this.logger.log('Admin officer already exists, skipping seeding');
        return;
      }

      // Create default organization if not exists
      let organization = await this.organizationsRepository.findOne({
        where: { code: 'SURA-HQ' }
      });

      if (!organization) {
        const orgData: DeepPartial<Organization> = {
          name: 'SURA Headquarters',
          code: 'SURA-HQ',
          type: 'DISTRICT_POLICE',
          state: 'SYSTEM',
          tenantId: 'system',
          jurisdictionArea: 'System Wide',
          address: 'System',
          isActive: true
        };
        
        organization = await this.organizationsRepository.save(orgData);
        this.logger.log('Default organization created');
      }

      // Create default unit if not exists
      let unit = await this.unitsRepository.findOne({
        where: { code: 'ADMIN-UNIT' }
      });

      if (!unit && organization) {
        const unitData: DeepPartial<Unit> = {
          name: 'Administration Unit',
          code: 'ADMIN-UNIT',
          type: 'OTHER',
          organizationId: organization.id,
          jurisdictionArea: 'System Wide',
          isDirectReporting: true,
          isActive: true
        };
        
        unit = await this.unitsRepository.save(unitData);
        this.logger.log('Default unit created');
      }

      // Create default rank if not exists
      let rank = await this.officerRanksRepository.findOne({
        where: { abbreviation: 'ADMIN' }
      });

      if (!rank) {
        const rankData: DeepPartial<OfficerRank> = {
          name: 'System Administrator',
          abbreviation: 'ADMIN',
          description: 'System administrator rank',
          level: 1,
          weight: 100,
          systemType: 'BOTH',
          isActive: true
        };
        
        rank = await this.officerRanksRepository.save(rankData);
        this.logger.log('Default admin rank created');
      }

      // Generate salt and hash password
      const salt = crypto.randomBytes(16).toString('hex');
      // Use more compact Argon2 settings
      const passwordHash = await argon2.hash('admin123', { 
        salt: Buffer.from(salt, 'hex'),
        type: argon2.argon2id,
        memoryCost: 4096,  // Lower memory cost (default is 65536)
        timeCost: 3,       // Standard time cost
        parallelism: 1     // Lower parallelism (default is 4)
      });

      // Create admin officer
      if (organization && unit && rank) {
        const officerData: DeepPartial<Officer> = {
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@sura.com',
          passwordHash,
          salt,
          badgeNumber: 'ADMIN-001',
          gender: 'OTHER',
          userType: 'ADMIN',
          rankId: rank.id,
          organizationId: organization.id,
          primaryUnitId: unit.id,
          isActive: true,
          isVerified: true
        };
        
        const admin = await this.officersRepository.save(officerData);
        this.logger.log(`Admin officer created with email: admin@sura.com and password: admin123`);
      } else {
        throw new Error('Failed to create admin: required entities are null');
      }
      
    } catch (error) {
      this.logger.error('Failed to seed admin officer', error);
    }
  }
} 