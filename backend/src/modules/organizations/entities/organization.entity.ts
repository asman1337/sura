import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
  
  @Column({ length: 50 })
  state: string;

  @Column({ length: 150, nullable: true })
  jurisdictionArea: string;

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

  // For multi-tenant architecture
  @Column({ length: 36 })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships will be defined when all entities are created
  // @OneToMany(() => Unit, unit => unit.organization)
  // units: Unit[];

  // @OneToMany(() => Officer, officer => officer.organization)
  // officers: Officer[];
} 