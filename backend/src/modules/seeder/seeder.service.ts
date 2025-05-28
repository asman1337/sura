import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Officer } from '../officers/entities/officer.entity';
import { OfficerRank } from '../officer-ranks/entities/officer-rank.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Unit } from '../units/entities/unit.entity';
import { Department } from '../departments/entities/department.entity';
import { Shelf } from '../malkhana/entities/shelf.entity';

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
    
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    
    @InjectRepository(Shelf)
    private shelveRepository: Repository<Shelf>,
  ) {}

  async onModuleInit() {
    await this.seedPoliceHierarchy();
  }

  async seedPoliceHierarchy() {
    try {
      // Check if admin already exists
      const adminExists = await this.officersRepository.findOne({
        where: { email: 'admin@sura.com' }
      });

      if (adminExists) {
        this.logger.log('Admin officer already exists, skipping seeding');
        return;
      }

      // 1. Create default ranks
      const ranks = await this.createPoliceRanks();
      
      // 2. Create organization
      const organization = await this.createOrganization();

      // 3. Create hierarchical units
      const units = await this.createUnits(organization.id);

      // 4. Create departments
      const departments = await this.createDepartments(units);

      // 5. Create shelves for Malkhana
      await this.createMalkhanaInventory(units['AUSGRAM_PS'].id);

      // 6. Create officers (including admin)
      await this.createOfficers(organization.id, ranks, units, departments);
      
      this.logger.log('Police hierarchy seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed police hierarchy', error);
    }
  }

  async createPoliceRanks(): Promise<{ [key: string]: OfficerRank }> {
    const ranks: { [key: string]: OfficerRank } = {};

    // Define ranks with their hierarchy levels
    const rankDefinitions = [
      { name: 'Director General of Police', abbreviation: 'DGP', level: 1, weight: 100, systemType: 'BOTH' },
      { name: 'Additional Director General of Police', abbreviation: 'ADGP', level: 2, weight: 90, systemType: 'BOTH' },
      { name: 'Inspector General of Police', abbreviation: 'IGP', level: 3, weight: 80, systemType: 'BOTH' },
      { name: 'Deputy Inspector General', abbreviation: 'DIG', level: 4, weight: 70, systemType: 'BOTH' },
      { name: 'Superintendent of Police', abbreviation: 'SP', level: 5, weight: 60, systemType: 'DISTRICT' },
      { name: 'Additional Superintendent of Police', abbreviation: 'ADDL_SP', level: 6, weight: 50, systemType: 'DISTRICT' },
      { name: 'Deputy Superintendent of Police', abbreviation: 'DY_SP', level: 7, weight: 40, systemType: 'DISTRICT' },
      { name: 'Inspector', abbreviation: 'INSP', level: 8, weight: 30, systemType: 'BOTH' },
      { name: 'Sub-Inspector', abbreviation: 'SI', level: 9, weight: 20, systemType: 'BOTH' },
      { name: 'Assistant Sub-Inspector', abbreviation: 'ASI', level: 10, weight: 10, systemType: 'BOTH' },
      { name: 'System Administrator', abbreviation: 'ADMIN', level: 0, weight: 100, systemType: 'BOTH' }
    ];

    // Create each rank
    for (const rankDef of rankDefinitions) {
      // Check if rank already exists
      let rank = await this.officerRanksRepository.findOne({
        where: { abbreviation: rankDef.abbreviation }
      });

      if (!rank) {
        const rankData: DeepPartial<OfficerRank> = {
          name: rankDef.name,
          abbreviation: rankDef.abbreviation,
          level: rankDef.level,
          weight: rankDef.weight,
          systemType: rankDef.systemType as any,
          description: `${rankDef.name} (${rankDef.abbreviation})`,
          isActive: true
        };
        
        rank = await this.officerRanksRepository.save(rankData);
        this.logger.log(`Created rank: ${rank.name}`);
      }

      ranks[rankDef.abbreviation] = rank;
    }

    return ranks;
  }

  async createOrganization(): Promise<Organization> {
    // Check if organization already exists
    let organization = await this.organizationsRepository.findOne({
      where: { code: 'PBDP' }
    });

    if (!organization) {
      const orgData: DeepPartial<Organization> = {
        name: 'Purba Bardhaman District Police',
        code: 'PBDP',
        type: 'DISTRICT_POLICE',
        state: 'West Bengal',
        tenantId: 'purba-bardhaman',
        jurisdictionArea: 'Purba Bardhaman District',
        address: 'District Police Office, Purba Bardhaman',
        contactPhone: '1234567890',
        contactEmail: 'sp-pbarddhaman@policewb.gov.in',
        isActive: true
      };
      
      organization = await this.organizationsRepository.save(orgData);
      this.logger.log(`Created organization: ${organization.name}`);
    }

    // Also create system HQ organization if it doesn't exist
    let systemOrg = await this.organizationsRepository.findOne({
      where: { code: 'SURA-HQ' }
    });

    if (!systemOrg) {
      const sysOrgData: DeepPartial<Organization> = {
        name: 'SURA Headquarters',
        code: 'SURA-HQ',
        type: 'DISTRICT_POLICE',
        state: 'SYSTEM',
        tenantId: 'system',
        jurisdictionArea: 'System Wide',
        address: 'System',
        isActive: true
      };
      
      await this.organizationsRepository.save(sysOrgData);
      this.logger.log('Created system organization');
    }

    return organization;
  }

  async createUnits(organizationId: string): Promise<{ [key: string]: Unit }> {
    const units: { [key: string]: Unit } = {};
    
    // Create SP Office (Unit 1)
    let spOffice = await this.unitsRepository.findOne({
      where: { 
        code: 'SP-PBDP',
        organizationId 
      }
    });

    if (!spOffice) {
      const spOfficeData: DeepPartial<Unit> = {
        name: 'SP Office Purba Bardhaman',
        code: 'SP-PBDP',
        type: 'SP_OFFICE',
        organizationId,
        jurisdictionArea: 'Purba Bardhaman District',
        address: 'District Headquarters, Purba Bardhaman',
        isDirectReporting: true,
        isActive: true,
        contactInformation: {
          phone: '1234567890',
          email: 'sp-office@pbdp.gov.in'
        }
      };
      
      spOffice = await this.unitsRepository.save(spOfficeData);
      this.logger.log(`Created SP Office unit: ${spOffice.name}`);
    }
    units['SP_OFFICE'] = spOffice;

    // Create HQ Zone (Unit 2)
    let hqZone = await this.unitsRepository.findOne({
      where: { 
        code: 'HQ-ZONE',
        organizationId 
      }
    });

    if (!hqZone) {
      const hqZoneData: DeepPartial<Unit> = {
        name: 'HQ Zone',
        code: 'HQ-ZONE',
        type: 'ADDL_SP_OFFICE',
        organizationId,
        parentUnitId: spOffice.id, // Reports to SP Office
        jurisdictionArea: 'HQ Zone, Purba Bardhaman',
        isDirectReporting: true,
        isActive: true,
        contactInformation: {
          phone: '1234567891',
          email: 'addsp-hq@pbdp.gov.in'
        }
      };
      
      hqZone = await this.unitsRepository.save(hqZoneData);
      this.logger.log(`Created HQ Zone unit: ${hqZone.name}`);
    }
    units['HQ_ZONE'] = hqZone;

    // Create SADAR NORTH (D&T) SubZone (Unit 3)
    let sadarNorth = await this.unitsRepository.findOne({
      where: { 
        code: 'SADAR-NORTH',
        organizationId 
      }
    });

    if (!sadarNorth) {
      const sadarNorthData: DeepPartial<Unit> = {
        name: 'SADAR NORTH (D&T)',
        code: 'SADAR-NORTH',
        type: 'DY_SP_OFFICE',
        organizationId,
        parentUnitId: hqZone.id, // Reports to HQ Zone
        jurisdictionArea: 'Sadar North, Purba Bardhaman',
        isDirectReporting: true,
        isActive: true,
        contactInformation: {
          phone: '1234567892',
          email: 'dysp-sadarnorth@pbdp.gov.in'
        }
      };
      
      sadarNorth = await this.unitsRepository.save(sadarNorthData);
      this.logger.log(`Created SADAR NORTH SubZone unit: ${sadarNorth.name}`);
    }
    units['SADAR_NORTH'] = sadarNorth;

    // Create Ausgram PS (Unit 4)
    let ausgramPS = await this.unitsRepository.findOne({
      where: { 
        code: 'AUSGRAM-PS',
        organizationId 
      }
    });

    if (!ausgramPS) {
      const ausgramPSData: DeepPartial<Unit> = {
        name: 'Ausgram Police Station',
        code: 'AUSGRAM-PS',
        type: 'POLICE_STATION',
        organizationId,
        parentUnitId: sadarNorth.id, // Reports to SADAR NORTH
        jurisdictionArea: 'Ausgram, Purba Bardhaman',
        isDirectReporting: true, // Direct reporting to SDPO
        isActive: true,
        contactInformation: {
          phone: '1234567893',
          email: 'oc-ausgram@pbdp.gov.in'
        }
      };
      
      ausgramPS = await this.unitsRepository.save(ausgramPSData);
      this.logger.log(`Created Ausgram PS unit: ${ausgramPS.name}`);
    }
    units['AUSGRAM_PS'] = ausgramPS;

    // Create Admin Unit (for system admin)
    let adminUnit = await this.unitsRepository.findOne({
      where: { code: 'ADMIN-UNIT' }
    });

    if (!adminUnit) {
      // Find system org
      const systemOrg = await this.organizationsRepository.findOne({
        where: { code: 'SURA-HQ' }
      });

      if (systemOrg) {
        const adminUnitData: DeepPartial<Unit> = {
          name: 'Administration Unit',
          code: 'ADMIN-UNIT',
          type: 'OTHER',
          organizationId: systemOrg.id,
          jurisdictionArea: 'System Wide',
          isDirectReporting: true,
          isActive: true
        };
        
        adminUnit = await this.unitsRepository.save(adminUnitData);
        this.logger.log('Created admin unit');
      } else {
        // Create a default admin unit to avoid null
        const defaultAdminUnitData: DeepPartial<Unit> = {
          name: 'Default Administration Unit',
          code: 'ADMIN-UNIT',
          type: 'OTHER',
          organizationId: organizationId, // Use provided org as fallback
          jurisdictionArea: 'System Wide',
          isDirectReporting: true,
          isActive: true
        };
        
        adminUnit = await this.unitsRepository.save(defaultAdminUnitData);
        this.logger.log('Created default admin unit with provided organization');
      }
    }
    
    // Now adminUnit is guaranteed to be defined
    units['ADMIN_UNIT'] = adminUnit;

    return units;
  }

  async createDepartments(units: { [key: string]: Unit }): Promise<{ [key: string]: Department }> {
    const departments: { [key: string]: Department } = {};
    
    // Create Malkhana Department at Ausgram PS
    let malkhana = await this.departmentsRepository.findOne({
      where: { 
        name: 'Malkhana',
        unitId: units['AUSGRAM_PS'].id
      }
    });

    if (!malkhana) {
      const malkhanaData: DeepPartial<Department> = {
        name: 'Malkhana',
        description: 'Malkhana Department for evidence storage and management',
        unitId: units['AUSGRAM_PS'].id,
        isActive: true
      };
      
      malkhana = await this.departmentsRepository.save(malkhanaData);
      this.logger.log(`Created Malkhana department at ${units['AUSGRAM_PS'].name}`);
    }
    departments['MALKHANA'] = malkhana;

    // Create Investigation Department at Ausgram PS
    let investigation = await this.departmentsRepository.findOne({
      where: { 
        name: 'Investigation',
        unitId: units['AUSGRAM_PS'].id
      }
    });

    if (!investigation) {
      const investigationData: DeepPartial<Department> = {
        name: 'Investigation',
        description: 'Investigation Department for case investigations',
        unitId: units['AUSGRAM_PS'].id,
        isActive: true
      };
      
      investigation = await this.departmentsRepository.save(investigationData);
      this.logger.log(`Created Investigation department at ${units['AUSGRAM_PS'].name}`);
    }
    departments['INVESTIGATION'] = investigation;

    return departments;
  }

  async createOfficers(
    organizationId: string, 
    ranks: { [key: string]: OfficerRank }, 
    units: { [key: string]: Unit },
    departments: { [key: string]: Department }
  ): Promise<void> {
    // Create officers with different ranks for each unit
    
    // 1. Create SP for SP Office
    await this.createOfficer({
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'sp@pbdp.gov.in',
      password: 'password123',
      badgeNumber: 'SP-001',
      gender: 'MALE',
      userType: 'OFFICER',
      rankId: ranks['SP'].id,
      organizationId,
      primaryUnitId: units['SP_OFFICE'].id,
      departmentId: null
    });

    // 2. Create Addl. SP for HQ Zone
    await this.createOfficer({
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'addlsp@pbdp.gov.in',
      password: 'password123',
      badgeNumber: 'ADDL-SP-001',
      gender: 'FEMALE',
      userType: 'OFFICER',
      rankId: ranks['ADDL_SP'].id,
      organizationId,
      primaryUnitId: units['HQ_ZONE'].id,
      departmentId: null
    });

    // 3. Create Dy. SP for SADAR NORTH
    await this.createOfficer({
      firstName: 'Amitabh',
      lastName: 'Sen',
      email: 'dysp@pbdp.gov.in',
      password: 'password123',
      badgeNumber: 'DY-SP-001',
      gender: 'MALE',
      userType: 'OFFICER',
      rankId: ranks['DY_SP'].id,
      organizationId,
      primaryUnitId: units['SADAR_NORTH'].id,
      departmentId: null
    });

    // 4. Create Inspector for Ausgram PS
    await this.createOfficer({
      firstName: 'Sunil',
      lastName: 'Gupta',
      email: 'inspector@pbdp.gov.in',
      password: 'password123',
      badgeNumber: 'INSP-001',
      gender: 'MALE',
      userType: 'OFFICER',
      rankId: ranks['INSP'].id,
      organizationId,
      primaryUnitId: units['AUSGRAM_PS'].id,
      departmentId: null
    });

    // 5. Create SI for Malkhana Department
    await this.createOfficer({
      firstName: 'Deepak',
      lastName: 'Banerjee',
      email: 'malkhana@pbdp.gov.in',
      password: 'password123',
      badgeNumber: 'SI-001',
      gender: 'MALE',
      userType: 'OFFICER',
      rankId: ranks['SI'].id,
      organizationId,
      primaryUnitId: units['AUSGRAM_PS'].id,
      departmentId: departments['MALKHANA'].id
    });

    // 6. Create Admin Officer
    await this.createOfficer({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@sura.com',
      password: 'admin123',
      badgeNumber: 'ADMIN-001',
      gender: 'OTHER',
      userType: 'ADMIN',
      rankId: ranks['ADMIN'].id,
      organizationId: null, // Will look up SURA-HQ org
      primaryUnitId: units['ADMIN_UNIT'].id,
      departmentId: null
    });
  }

  async createOfficer(officerData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    badgeNumber: string;
    gender: string;
    userType: string;
    rankId: string;
    organizationId: string | null;
    primaryUnitId: string;
    departmentId: string | null;
  }): Promise<Officer | null> {
    try {
      // Check if officer already exists
      const existingOfficer = await this.officersRepository.findOne({
        where: { email: officerData.email }
      });

      if (existingOfficer) {
        this.logger.log(`Officer with email ${officerData.email} already exists, skipping`);
        return existingOfficer;
      }

      // If no organizationId provided (for admin), find the system org
      let effectiveOrgId = officerData.organizationId;
      if (!effectiveOrgId) {
        const systemOrg = await this.organizationsRepository.findOne({
          where: { code: 'SURA-HQ' }
        });
        if (systemOrg) {
          effectiveOrgId = systemOrg.id;
        } else {
          throw new Error('System organization not found');
        }
      }

      // Generate salt and hash password
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = await argon2.hash(officerData.password, {
        salt: Buffer.from(salt, 'hex'),
        type: argon2.argon2id,
        memoryCost: 4096,
        timeCost: 3,
        parallelism: 1
      });

      // Create officer
      const newOfficerData: DeepPartial<Officer> = {
        firstName: officerData.firstName,
        lastName: officerData.lastName,
        email: officerData.email,
        passwordHash,
        salt,
        badgeNumber: officerData.badgeNumber,
        gender: officerData.gender as any,
        userType: officerData.userType as any,
        rankId: officerData.rankId,
        organizationId: effectiveOrgId,
        primaryUnitId: officerData.primaryUnitId,
        departmentId: officerData.departmentId || undefined,
        isActive: true,
        isVerified: true
      };

      const officer = await this.officersRepository.save(newOfficerData);
      this.logger.log(`Created officer: ${officer.firstName} ${officer.lastName} (${officer.email})`);
      return officer;
    } catch (error) {
      this.logger.error(`Failed to create officer: ${officerData.email}`, error);
      return null;
    }
  }

  async createMalkhanaInventory(policeStationUnitId: string): Promise<void> {
    // Define shelves for the police station
    const shelves = [
      {
        name: 'Section A - Weapons',
        location: 'Malkhana Room 1',
        category: 'Weapons'
      },
      {
        name: 'Section B - Documents',
        location: 'Malkhana Room 1',
        category: 'Documents'
      },
      {
        name: 'Section C - Narcotics',
        location: 'Malkhana Room 2 (Secure)',
        category: 'Narcotics'
      },
      {
        name: 'Section D - Electronics',
        location: 'Malkhana Room 2 (Secure)',
        category: 'Electronics'
      },
      {
        name: 'Section E - Valuables',
        location: 'Malkhana Safe',
        category: 'Valuables'
      }
    ];

    for (const shelfData of shelves) {
      // Check if shelf already exists
      const existingShelf = await this.shelveRepository.findOne({
        where: {
          name: shelfData.name,
          unitId: policeStationUnitId
        }
      });

      if (!existingShelf) {
        await this.shelveRepository.save({
          ...shelfData,
          unitId: policeStationUnitId
        });
        this.logger.log(`Created shelf: ${shelfData.name} for police station`);
      }
    }
  }
} 