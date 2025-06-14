import { Department } from 'src/modules/departments/entities/department.entity';
import { OfficerRank } from 'src/modules/officer-ranks/entities/officer-rank.entity';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('officers')
export class Officer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic user information
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 128, select: false })
  passwordHash: string;
  
  @Column({ length: 64 })
  salt: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;
  
  // Officer identification
  @Column({ length: 20, unique: true })
  badgeNumber: string;

  @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], default: 'OTHER' })
  gender: 'MALE' | 'FEMALE' | 'OTHER';

  // Role information
  @Column({ type: 'enum', enum: ['ADMIN', 'OFFICER', 'STAFF', 'PUBLIC'], default: 'OFFICER' })
  userType: 'ADMIN' | 'OFFICER' | 'STAFF' | 'PUBLIC';

  // Rank information
  @Column({ type: 'uuid' })
  rankId: string;
  
  // Organization and unit assignments
  @Column({ type: 'uuid' })
  organizationId: string;
  
  @Column({ type: 'uuid' })
  primaryUnitId: string;
  
  @Column({ type: 'uuid', nullable: true })
  departmentId: string;
  
  // Reporting structure
  @Column({ type: 'uuid', nullable: true })
  reportingOfficerId: string;

  // Additional officer details
  @Column({ length: 255, nullable: true })
  jurisdictionArea: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'date', nullable: true })
  dateOfJoining: Date;

  @Column({ type: 'date', nullable: true })
  dateOfRetirement: Date;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  profilePhotoUrl: string;
  
  // Status fields
  @Column({ default: true })
  isActive: boolean;
  
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  // Relationships will be defined when all entities are created
  @ManyToOne(() => OfficerRank, { nullable: true })
  @JoinColumn({ name: 'rankId' })
  rank: OfficerRank;
  
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
  
  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'primaryUnitId' })
  primaryUnit: Unit;
  
  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;
  
  @ManyToOne(() => Officer, officer => officer.subordinates)
  @JoinColumn({ name: 'reportingOfficerId' })
  reportingOfficer: Officer;
  
  @OneToMany(() => Officer, officer => officer.reportingOfficer)
  subordinates: Officer[];
}