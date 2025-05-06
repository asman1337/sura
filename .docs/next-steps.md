# Immediate Next Steps: Implementing the Core of the Hierarchy and Access Control System

## 1. Setting Up Core Database Structure

### TypeORM Entities

#### 1.1 Organization Entity
```typescript
// src/modules/organization/entities/organization.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { Officer } from '../../officer/entities/officer.entity';
import { Unit } from '../../unit/entities/unit.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 15, unique: true })
  code: string;

  @Column({ 
    type: 'enum', 
    enum: ['DISTRICT_POLICE', 'COMMISSIONERATE'],
    default: 'DISTRICT_POLICE' 
  })
  type: 'DISTRICT_POLICE' | 'COMMISSIONERATE';

  @Column({ length: 150, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Unit, unit => unit.organization)
  units: Unit[];

  @OneToMany(() => Officer, officer => officer.organization)
  officers: Officer[];
}
```

#### 1.2 Officer Rank Entity
```typescript
// src/modules/officer-rank/entities/officer-rank.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Officer } from '../../officer/entities/officer.entity';

@Entity('officer_ranks')
export class OfficerRank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 })
  abbreviation: string;

  @Column()
  level: number;

  @Column({ 
    type: 'enum', 
    enum: ['DISTRICT_POLICE', 'COMMISSIONERATE', 'BOTH'],
    default: 'BOTH' 
  })
  systemType: 'DISTRICT_POLICE' | 'COMMISSIONERATE' | 'BOTH';

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Officer, officer => officer.rank)
  officers: Officer[];
}
```

#### 1.3 Unit Entity (Updated)
```typescript
// src/modules/unit/entities/unit.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { Officer } from '../../officer/entities/officer.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ 
    type: 'enum', 
    enum: ['SP_OFFICE', 'ADDL_SP_OFFICE', 'DY_SP_OFFICE', 'CIRCLE_OFFICE', 
           'POLICE_STATION', 'OUTPOST', 'CP_OFFICE', 'JT_CP_OFFICE', 
           'ADDL_CP_OFFICE', 'DCP_OFFICE', 'ACP_OFFICE', 'OTHER'],
    default: 'OTHER' 
  })
  type: string;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization, organization => organization.units)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid', { nullable: true })
  primaryInchargeId: string;

  @ManyToOne(() => Officer, { nullable: true })
  @JoinColumn({ name: 'primaryInchargeId' })
  primaryIncharge: Officer;

  @ManyToMany(() => Officer)
  @JoinTable({
    name: 'unit_incharge_officers',
    joinColumn: { name: 'unitId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'officerId', referencedColumnName: 'id' }
  })
  inchargeOfficers: Officer[];

  @Column('uuid', { nullable: true })
  parentUnitId: string;

  @ManyToOne(() => Unit, unit => unit.childUnits, { nullable: true })
  @JoinColumn({ name: 'parentUnitId' })
  parentUnit: Unit;

  @OneToMany(() => Unit, unit => unit.parentUnit)
  childUnits: Unit[];

  @Column({ type: 'text', nullable: true })
  jurisdictionArea: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 15, nullable: true })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactEmail: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Department, department => department.unit)
  departments: Department[];

  @OneToMany(() => Officer, officer => officer.primaryUnit)
  officers: Officer[];
}
```

#### 1.4 Unit Incharge Officer Entity (New)
```typescript
// src/modules/unit/entities/unit-incharge-officer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Unit } from './unit.entity';
import { Officer } from '../../officer/entities/officer.entity';

@Entity('unit_incharge_officers')
export class UnitInchargeOfficer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  unitId: string;

  @ManyToOne(() => Unit, unit => unit.inchargeOfficers)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column('uuid')
  officerId: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'officerId' })
  officer: Officer;

  @Column({ 
    type: 'enum', 
    enum: ['PRIMARY', 'SECONDARY', 'ACTING', 'SPECIALIZED'],
    default: 'PRIMARY' 
  })
  roleType: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.5 Department Entity (Updated)
```typescript
// src/modules/department/entities/department.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Officer } from '../../officer/entities/officer.entity';
import { Unit } from '../../unit/entities/unit.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 15 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  unitId: string;

  @ManyToOne(() => Unit, unit => unit.departments)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column('uuid', { nullable: true })
  primaryHeadId: string;

  @ManyToOne(() => Officer, { nullable: true })
  @JoinColumn({ name: 'primaryHeadId' })
  primaryHead: Officer;

  @ManyToMany(() => Officer)
  @JoinTable({
    name: 'department_manager_officers',
    joinColumn: { name: 'departmentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'officerId', referencedColumnName: 'id' }
  })
  managerOfficers: Officer[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Officer, officer => officer.primaryDepartment)
  officers: Officer[];
}
```

#### 1.6 Department Manager Officer Entity (New)
```typescript
// src/modules/department/entities/department-manager-officer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from './department.entity';
import { Officer } from '../../officer/entities/officer.entity';

@Entity('department_manager_officers')
export class DepartmentManagerOfficer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  departmentId: string;

  @ManyToOne(() => Department, department => department.managerOfficers)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column('uuid')
  officerId: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'officerId' })
  officer: Officer;

  @Column({ 
    type: 'enum', 
    enum: ['HEAD', 'DEPUTY', 'COORDINATOR', 'SPECIALIST'],
    default: 'HEAD' 
  })
  roleType: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.7 Officer Entity (Updated)
```typescript
// src/modules/officer/entities/officer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { OfficerRank } from '../../officer-rank/entities/officer-rank.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Unit } from '../../unit/entities/unit.entity';

@Entity('officers')
export class Officer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  badgeNumber: string;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization, organization => organization.officers)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid')
  rankId: string;

  @ManyToOne(() => OfficerRank, rank => rank.officers)
  @JoinColumn({ name: 'rankId' })
  rank: OfficerRank;

  @Column('uuid', { nullable: true })
  primaryUnitId: string;

  @ManyToOne(() => Unit, unit => unit.officers, { nullable: true })
  @JoinColumn({ name: 'primaryUnitId' })
  primaryUnit: Unit;

  @Column('uuid', { nullable: true })
  primaryDepartmentId: string;

  @ManyToOne(() => Department, department => department.officers, { nullable: true })
  @JoinColumn({ name: 'primaryDepartmentId' })
  primaryDepartment: Department;

  @Column('uuid', { nullable: true })
  reportingToId: string;

  @ManyToOne(() => Officer, officer => officer.subordinates, { nullable: true })
  @JoinColumn({ name: 'reportingToId' })
  reportingTo: Officer;

  @ManyToMany(() => Unit, unit => unit.inchargeOfficers)
  managedUnits: Unit[];

  @ManyToMany(() => Department, department => department.managerOfficers)
  managedDepartments: Department[];

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual relation - not stored in DB
  subordinates: Officer[];
}
```

#### 1.8 Role Entity
```typescript
// src/modules/role/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { Permission } from '../../permission/entities/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ default: false })
  isSystemRole: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
  })
  permissions: Permission[];
}
```

#### 1.9 Permission Entity
```typescript
// src/modules/permission/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50 })
  module: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Database Migration

#### Creating and Applying Migrations
```bash
# Generate migration
npx typeorm migration:generate -n InitialSchema

# Run migration
npx typeorm migration:run
```

## 2. Implementing Unit Module with Multiple Officer Assignments

### Unit Service Implementation
```typescript
// src/modules/unit/unit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { UnitInchargeOfficer } from './entities/unit-incharge-officer.entity';
import { CreateUnitDto, UpdateUnitDto, AssignOfficerToUnitDto } from './dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(UnitInchargeOfficer)
    private unitInchargeOfficerRepository: Repository<UnitInchargeOfficer>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  async findAll(organizationId?: string): Promise<Unit[]> {
    let query = this.unitRepository.createQueryBuilder('unit')
      .leftJoinAndSelect('unit.parentUnit', 'parentUnit')
      .leftJoinAndSelect('unit.primaryIncharge', 'primaryIncharge')
      .leftJoinAndSelect('primaryIncharge.rank', 'rank');
    
    if (organizationId) {
      query = query.where('unit.organizationId = :organizationId', { organizationId });
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<Unit> {
    return this.unitRepository.findOne({ 
      where: { id },
      relations: [
        'parentUnit', 
        'childUnits', 
        'departments', 
        'primaryIncharge', 
        'primaryIncharge.rank',
        'inchargeOfficers',
        'inchargeOfficers.rank'
      ] 
    });
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {    
    await this.unitRepository.update(id, updateUnitDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.unitRepository.delete(id);
  }

  async getUnitHierarchy(organizationId: string): Promise<Unit[]> {
    // Find all top-level units that don't have a parent
    const topLevelUnits = await this.unitRepository.find({
      where: { 
        organizationId,
        parentUnitId: null 
      }
    });

    // For each top-level unit, load its complete hierarchy
    for (const unit of topLevelUnits) {
      await this.loadUnitWithChildren(unit);
    }

    return topLevelUnits;
  }

  async getReportingPath(unitId: string): Promise<Unit[]> {
    // Get the unit
    const unit = await this.unitRepository.findOne({
      where: { id: unitId },
      relations: ['parentUnit']
    });

    if (!unit) {
      return [];
    }

    // Array to store the reporting path (from the unit up to the top)
    const reportingPath = [unit];
    
    // Traverse up the hierarchy
    let currentUnit = unit;
    while (currentUnit.parentUnit) {
      reportingPath.unshift(currentUnit.parentUnit);
      currentUnit = await this.unitRepository.findOne({
        where: { id: currentUnit.parentUnit.id },
        relations: ['parentUnit']
      });
    }

    return reportingPath;
  }

  async assignOfficerToUnit(assignDto: AssignOfficerToUnitDto): Promise<UnitInchargeOfficer> {
    // If assigning a PRIMARY officer, update the primaryInchargeId in the unit
    if (assignDto.roleType === 'PRIMARY') {
      await this.unitRepository.update(assignDto.unitId, {
        primaryInchargeId: assignDto.officerId
      });
      
      // Set previous PRIMARY officers to inactive
      await this.unitInchargeOfficerRepository.update(
        { 
          unitId: assignDto.unitId, 
          roleType: 'PRIMARY',
          isActive: true
        },
        { 
          isActive: false,
          endDate: new Date()
        }
      );
    }
    
    // Create the new assignment
    const unitInchargeOfficer = this.unitInchargeOfficerRepository.create({
      ...assignDto,
      startDate: assignDto.startDate || new Date(),
      isActive: true
    });
    
    return this.unitInchargeOfficerRepository.save(unitInchargeOfficer);
  }

  async getUnitOfficers(unitId: string): Promise<UnitInchargeOfficer[]> {
    return this.unitInchargeOfficerRepository.find({
      where: { unitId, isActive: true },
      relations: ['officer', 'officer.rank']
    });
  }

  async getOfficerUnits(officerId: string): Promise<UnitInchargeOfficer[]> {
    return this.unitInchargeOfficerRepository.find({
      where: { officerId, isActive: true },
      relations: ['unit']
    });
  }

  private async loadUnitWithChildren(unit: Unit): Promise<void> {
    // Load child units
    const childUnits = await this.unitRepository.find({
      where: { parentUnitId: unit.id }
    });

    unit.childUnits = childUnits;

    // Recursively load children of each child
    for (const childUnit of childUnits) {
      await this.loadUnitWithChildren(childUnit);
    }
  }
}
```

### Unit Controller Implementation
```typescript
// src/modules/unit/unit.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto, UpdateUnitDto, AssignOfficerToUnitDto } from './dto';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(createUnitDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId?: string) {
    return this.unitService.findAll(organizationId);
  }

  @Get('hierarchy/:organizationId')
  getHierarchy(@Param('organizationId') organizationId: string) {
    return this.unitService.getUnitHierarchy(organizationId);
  }

  @Get(':id/reporting-path')
  getReportingPath(@Param('id') id: string) {
    return this.unitService.getReportingPath(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitService.findOne(id);
  }

  @Get(':id/incharge-officers')
  getUnitOfficers(@Param('id') id: string) {
    return this.unitService.getUnitOfficers(id);
  }

  @Post(':id/incharge-officers')
  assignOfficer(@Param('id') id: string, @Body() assignDto: AssignOfficerToUnitDto) {
    assignDto.unitId = id;
    return this.unitService.assignOfficerToUnit(assignDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitService.update(id, updateUnitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitService.remove(id);
  }
}
```

## 3. Implementing Department Module with Multiple Manager Assignments

### Department Service Implementation
```typescript
// src/modules/department/department.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { DepartmentManagerOfficer } from './entities/department-manager-officer.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, AssignOfficerToDepartmentDto } from './dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(DepartmentManagerOfficer)
    private departmentManagerOfficerRepository: Repository<DepartmentManagerOfficer>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(unitId?: string): Promise<Department[]> {
    if (unitId) {
      return this.departmentRepository.find({ 
        where: { unitId },
        relations: ['primaryHead', 'primaryHead.rank'] 
      });
    }
    return this.departmentRepository.find({
      relations: ['unit', 'primaryHead', 'primaryHead.rank']
    });
  }

  async findOne(id: string): Promise<Department> {
    return this.departmentRepository.findOne({ 
      where: { id },
      relations: [
        'unit', 
        'primaryHead', 
        'primaryHead.rank', 
        'officers', 
        'officers.rank',
        'managerOfficers',
        'managerOfficers.rank'
      ] 
    });
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    await this.departmentRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.departmentRepository.delete(id);
  }

  async assignOfficerToDepartment(assignDto: AssignOfficerToDepartmentDto): Promise<DepartmentManagerOfficer> {
    // If assigning a HEAD officer, update the primaryHeadId in the department
    if (assignDto.roleType === 'HEAD') {
      await this.departmentRepository.update(assignDto.departmentId, {
        primaryHeadId: assignDto.officerId
      });
      
      // Set previous HEAD officers to inactive
      await this.departmentManagerOfficerRepository.update(
        { 
          departmentId: assignDto.departmentId, 
          roleType: 'HEAD',
          isActive: true
        },
        { 
          isActive: false,
          endDate: new Date()
        }
      );
    }
    
    // Create the new assignment
    const departmentManagerOfficer = this.departmentManagerOfficerRepository.create({
      ...assignDto,
      startDate: assignDto.startDate || new Date(),
      isActive: true
    });
    
    return this.departmentManagerOfficerRepository.save(departmentManagerOfficer);
  }

  async getDepartmentManagers(departmentId: string): Promise<DepartmentManagerOfficer[]> {
    return this.departmentManagerOfficerRepository.find({
      where: { departmentId, isActive: true },
      relations: ['officer', 'officer.rank']
    });
  }

  async getOfficerDepartments(officerId: string): Promise<DepartmentManagerOfficer[]> {
    return this.departmentManagerOfficerRepository.find({
      where: { officerId, isActive: true },
      relations: ['department', 'department.unit']
    });
  }
}
```

### Department Controller Implementation
```typescript
// src/modules/department/department.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto, AssignOfficerToDepartmentDto } from './dto';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  findAll(@Query('unitId') unitId?: string) {
    return this.departmentService.findAll(unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Get(':id/managers')
  getDepartmentManagers(@Param('id') id: string) {
    return this.departmentService.getDepartmentManagers(id);
  }

  @Post(':id/managers')
  assignOfficer(@Param('id') id: string, @Body() assignDto: AssignOfficerToDepartmentDto) {
    assignDto.departmentId = id;
    return this.departmentService.assignOfficerToDepartment(assignDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
```

## 4. Implementing Officer Module with Multiple Assignments

### Officer Service Implementation
```typescript
// src/modules/officer/officer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Officer } from './entities/officer.entity';
import { CreateOfficerDto, UpdateOfficerDto } from './dto';
import { UnitService } from '../unit/unit.service';
import { DepartmentService } from '../department/department.service';

@Injectable()
export class OfficerService {
  constructor(
    @InjectRepository(Officer)
    private officerRepository: Repository<Officer>,
    private unitService: UnitService,
    private departmentService: DepartmentService
  ) {}

  async create(createOfficerDto: CreateOfficerDto): Promise<Officer> {
    const officer = this.officerRepository.create(createOfficerDto);
    return this.officerRepository.save(officer);
  }

  async findAll(organizationId?: string): Promise<Officer[]> {
    if (organizationId) {
      return this.officerRepository.find({
        where: { organizationId },
        relations: ['rank', 'primaryUnit', 'primaryDepartment', 'reportingTo', 'reportingTo.rank']
      });
    }
    return this.officerRepository.find({
      relations: ['rank', 'primaryUnit', 'primaryDepartment', 'reportingTo', 'reportingTo.rank']
    });
  }

  async findOne(id: string): Promise<Officer> {
    const officer = await this.officerRepository.findOne({
      where: { id },
      relations: ['rank', 'primaryUnit', 'primaryDepartment', 'reportingTo', 'reportingTo.rank']
    });
    
    if (!officer) {
      return null;
    }
    
    // Get all units where this officer is assigned
    const unitAssignments = await this.unitService.getOfficerUnits(id);
    
    // Get all departments where this officer is assigned
    const departmentAssignments = await this.departmentService.getOfficerDepartments(id);
    
    // Load subordinates
    const subordinates = await this.officerRepository.find({
      where: { reportingToId: id },
      relations: ['rank']
    });
    
    officer['unitAssignments'] = unitAssignments;
    officer['departmentAssignments'] = departmentAssignments;
    officer.subordinates = subordinates;
    
    return officer;
  }

  async update(id: string, updateOfficerDto: UpdateOfficerDto): Promise<Officer> {
    await this.officerRepository.update(id, updateOfficerDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.officerRepository.delete(id);
  }

  async getSubordinates(id: string): Promise<Officer[]> {
    return this.officerRepository.find({
      where: { reportingToId: id },
      relations: ['rank', 'primaryUnit', 'primaryDepartment']
    });
  }

  async getManagedUnits(id: string): Promise<any[]> {
    return this.unitService.getOfficerUnits(id);
  }

  async getManagedDepartments(id: string): Promise<any[]> {
    return this.departmentService.getOfficerDepartments(id);
  }
}
```

### Officer Controller Implementation
```typescript
// src/modules/officer/officer.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OfficerService } from './officer.service';
import { CreateOfficerDto, UpdateOfficerDto } from './dto';

@Controller('officers')
export class OfficerController {
  constructor(private readonly officerService: OfficerService) {}

  @Post()
  create(@Body() createOfficerDto: CreateOfficerDto) {
    return this.officerService.create(createOfficerDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId?: string) {
    return this.officerService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officerService.findOne(id);
  }

  @Get(':id/subordinates')
  getSubordinates(@Param('id') id: string) {
    return this.officerService.getSubordinates(id);
  }

  @Get(':id/managed-units')
  getManagedUnits(@Param('id') id: string) {
    return this.officerService.getManagedUnits(id);
  }

  @Get(':id/managed-departments')
  getManagedDepartments(@Param('id') id: string) {
    return this.officerService.getManagedDepartments(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfficerDto: UpdateOfficerDto) {
    return this.officerService.update(id, updateOfficerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.officerService.remove(id);
  }
}
```

## Success Criteria

- The core database structure is implemented with n-level deep unit hierarchy
- Multiple officer assignments to units and departments are supported
- Historical assignment tracking is implemented with start/end dates
- Different role types for unit and department assignments are supported
- APIs for managing multiple assignments are available
- Nested unit structure can be visualized and navigated efficiently 