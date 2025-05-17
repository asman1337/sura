import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

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

  @Column({ length: 64, select: false })
  passwordHash: string;
  
  @Column({ length: 64 })
  salt: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;
  
  // Officer identification
  @Column({ length: 20, unique: true })
  badgeNumber: string;

  // Role information
  @Column({ type: 'enum', enum: ['ADMIN', 'OFFICER', 'STAFF', 'PUBLIC'], default: 'OFFICER' })
  userType: 'ADMIN' | 'OFFICER' | 'STAFF' | 'PUBLIC';

  // Rank information
  @Column({ length: 36 })
  rankId: string;
  
  // Organization and unit assignments
  @Column({ length: 36 })
  organizationId: string;
  
  @Column({ length: 36 })
  primaryUnitId: string;
  
  @Column({ length: 36, nullable: true })
  departmentId: string;
  
  // Reporting structure
  @Column({ length: 36, nullable: true })
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
  // @ManyToOne(() => OfficerRank)
  // @JoinColumn({ name: 'rankId' })
  // rank: OfficerRank;
  
  // @ManyToOne(() => Organization)
  // @JoinColumn({ name: 'organizationId' })
  // organization: Organization;
  
  // @ManyToOne(() => Unit)
  // @JoinColumn({ name: 'primaryUnitId' })
  // primaryUnit: Unit;
  
  // @ManyToOne(() => Department, { nullable: true })
  // @JoinColumn({ name: 'departmentId' })
  // department: Department;
  
  // @ManyToOne(() => Officer, officer => officer.subordinates)
  // @JoinColumn({ name: 'reportingOfficerId' })
  // reportingOfficer: Officer;
  
  // @OneToMany(() => Officer, officer => officer.reportingOfficer)
  // subordinates: Officer[];
}