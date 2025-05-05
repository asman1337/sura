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

#### 1.3 Unit Entity (New)
```typescript
// src/modules/unit/entities/unit.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
  inchargeOfficerId: string;

  @ManyToOne(() => Officer, { nullable: true })
  @JoinColumn({ name: 'inchargeOfficerId' })
  inchargeOfficer: Officer;

  @Column('uuid', { nullable: true })
  parentUnitId: string;

  @ManyToOne(() => Unit, unit => unit.parentUnit)
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

  @OneToMany(() => Officer, officer => officer.assignedUnit)
  officers: Officer[];
}
```

#### 1.4 Department Entity (Updated)
```typescript
// src/modules/department/entities/department.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
  headOfficerId: string;

  @ManyToOne(() => Officer, { nullable: true })
  @JoinColumn({ name: 'headOfficerId' })
  headOfficer: Officer;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Officer, officer => officer.department)
  officers: Officer[];
}
```

#### 1.5 Officer Entity (Updated)
```typescript
// src/modules/officer/entities/officer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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
  assignedUnitId: string;

  @ManyToOne(() => Unit, unit => unit.officers, { nullable: true })
  @JoinColumn({ name: 'assignedUnitId' })
  assignedUnit: Unit;

  @Column('uuid', { nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, department => department.officers, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column('uuid', { nullable: true })
  reportingToId: string;

  @ManyToOne(() => Officer, officer => officer.subordinates, { nullable: true })
  @JoinColumn({ name: 'reportingToId' })
  reportingTo: Officer;

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

#### 1.6 Role Entity
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

#### 1.7 Permission Entity
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

## 2. Implementing Organization Module

### Service Implementation
```typescript
// src/modules/organization/organization.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }

  async findOne(id: string): Promise<Organization> {
    return this.organizationRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    await this.organizationRepository.update(id, updateOrganizationDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }
}
```

### Controller Implementation
```typescript
// src/modules/organization/organization.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
```

## 3. Implementing Unit Module (New)

### Service Implementation
```typescript
// src/modules/unit/unit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto, UpdateUnitDto } from './dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  async findAll(organizationId?: string): Promise<Unit[]> {
    let query = this.unitRepository.createQueryBuilder('unit')
      .leftJoinAndSelect('unit.parentUnit', 'parentUnit')
      .leftJoinAndSelect('unit.inchargeOfficer', 'inchargeOfficer')
      .leftJoinAndSelect('inchargeOfficer.rank', 'rank');
    
    if (organizationId) {
      query = query.where('unit.organizationId = :organizationId', { organizationId });
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<Unit> {
    return this.unitRepository.findOne({ 
      where: { id },
      relations: ['parentUnit', 'childUnits', 'departments', 'inchargeOfficer', 'inchargeOfficer.rank'] 
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

### Controller Implementation
```typescript
// src/modules/unit/unit.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitService.findOne(id);
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

## 4. Implementing Officer Rank Module

### Service Implementation
```typescript
// src/modules/officer-rank/officer-rank.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficerRank } from './entities/officer-rank.entity';
import { CreateOfficerRankDto, UpdateOfficerRankDto } from './dto';

@Injectable()
export class OfficerRankService {
  constructor(
    @InjectRepository(OfficerRank)
    private officerRankRepository: Repository<OfficerRank>,
  ) {}

  async create(createOfficerRankDto: CreateOfficerRankDto): Promise<OfficerRank> {
    const officerRank = this.officerRankRepository.create(createOfficerRankDto);
    return this.officerRankRepository.save(officerRank);
  }

  async findAll(systemType?: string): Promise<OfficerRank[]> {
    if (systemType) {
      return this.officerRankRepository.find({
        where: [
          { systemType },
          { systemType: 'BOTH' }
        ],
        order: { level: 'DESC' }
      });
    }
    return this.officerRankRepository.find({ order: { level: 'DESC' } });
  }

  async findOne(id: string): Promise<OfficerRank> {
    return this.officerRankRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateOfficerRankDto: UpdateOfficerRankDto): Promise<OfficerRank> {
    await this.officerRankRepository.update(id, updateOfficerRankDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.officerRankRepository.delete(id);
  }
}
```

### Controller Implementation
```typescript
// src/modules/officer-rank/officer-rank.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OfficerRankService } from './officer-rank.service';
import { CreateOfficerRankDto, UpdateOfficerRankDto } from './dto';

@Controller('officer-ranks')
export class OfficerRankController {
  constructor(private readonly officerRankService: OfficerRankService) {}

  @Post()
  create(@Body() createOfficerRankDto: CreateOfficerRankDto) {
    return this.officerRankService.create(createOfficerRankDto);
  }

  @Get()
  findAll(@Query('systemType') systemType?: string) {
    return this.officerRankService.findAll(systemType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officerRankService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfficerRankDto: UpdateOfficerRankDto) {
    return this.officerRankService.update(id, updateOfficerRankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.officerRankService.remove(id);
  }
}
```

## 5. Implementing Department Module (Updated)

### Service Implementation
```typescript
// src/modules/department/department.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(unitId?: string): Promise<Department[]> {
    if (unitId) {
      return this.departmentRepository.find({ 
        where: { unitId },
        relations: ['headOfficer', 'headOfficer.rank'] 
      });
    }
    return this.departmentRepository.find({
      relations: ['unit', 'headOfficer', 'headOfficer.rank']
    });
  }

  async findOne(id: string): Promise<Department> {
    return this.departmentRepository.findOne({ 
      where: { id },
      relations: ['unit', 'headOfficer', 'headOfficer.rank', 'officers', 'officers.rank'] 
    });
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    await this.departmentRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.departmentRepository.delete(id);
  }
}
```

### Controller Implementation
```typescript
// src/modules/department/department.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

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

## 6. Implementing Multi-Tenant Middleware

```typescript
// src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      // Decode JWT token to get organizationId (tenant)
      const decoded = this.jwtService.verify(token);
      
      // Attach organizationId to request object for use in controllers/services
      req['organizationId'] = decoded.organizationId;
      
      // Also attach the complete user info for authorization checks
      req['user'] = decoded;
    } catch (error) {
      // JWT verification failed, continue without tenant context
      console.error('JWT verification failed:', error.message);
    }
    
    next();
  }
}
```

## 7. Basic Authentication Setup

### AuthModule
```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### AuthService
```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    // Get the officer details
    const officer = await this.userService.getOfficerDetails(user.officerId);
    
    const payload = { 
      sub: user.id,
      username: user.username,
      officerId: user.officerId,
      organizationId: officer.organizationId,
      unitId: officer.assignedUnitId,
      departmentId: officer.departmentId,
      rankId: officer.rankId
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        officer: {
          id: officer.id,
          name: officer.name,
          rank: officer.rank,
          unit: officer.assignedUnit,
          department: officer.department
        }
      }
    };
  }
}
```

### JwtStrategy
```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      username: payload.username,
      officerId: payload.officerId,
      organizationId: payload.organizationId,
      unitId: payload.unitId,
      departmentId: payload.departmentId,
      rankId: payload.rankId
    };
  }
}
```

### JwtAuthGuard
```typescript
// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## 8. Role-Based Access Control (RBAC)

### RolesGuard
```typescript
// src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    
    if (!requiredPermissions) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }
    
    // Get user's permissions based on their roles
    const userPermissions = await this.userService.getUserPermissions(user.id);
    
    // Check if user has any of the required permissions
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }
}
```

### Permission Decorator
```typescript
// src/modules/auth/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);
```

## Success Criteria

- The core database structure is implemented with proper relationships between all entities
- Organization and officer rank modules are completed with functioning CRUD operations
- Unit and department modules are implemented, allowing for hierarchical structure creation
- A multi-tenant middleware is in place to handle tenant isolation
- Basic authentication is set up with JWT tokens
- Role-based access control foundation is established to build upon 