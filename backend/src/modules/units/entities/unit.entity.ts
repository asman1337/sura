import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ 
    type: 'enum', 
    enum: [
      'SP_OFFICE',
      'ADDL_SP_OFFICE',
      'DY_SP_OFFICE',
      'CIRCLE_OFFICE',
      'POLICE_STATION',
      'OUTPOST',
      'CP_OFFICE',
      'DCP_OFFICE',
      'ACP_OFFICE',
      'OTHER'
    ]
  })
  type: string;

  @Column({ length: 36 })
  organizationId: string;

  @Column({ length: 250, nullable: true })
  jurisdictionArea: string;

  @Column({ length: 36, nullable: true })
  inchargeOfficerId: string;

  @Column({ length: 36, nullable: true })
  parentUnitId: string;

  @Column({ default: false })
  isDirectReporting: boolean;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ type: 'jsonb', nullable: true })
  contactInformation: {
    phone: string;
    email: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // These will be set up when all entities are created
  // @ManyToOne(() => Organization)
  // @JoinColumn({ name: 'organizationId' })
  // organization: Organization;

  // @ManyToOne(() => Officer)
  // @JoinColumn({ name: 'inchargeOfficerId' })
  // inchargeOfficer: Officer;

  // @ManyToOne(() => Unit, unit => unit.childUnits)
  // @JoinColumn({ name: 'parentUnitId' })
  // parentUnit: Unit;

  // @OneToMany(() => Unit, unit => unit.parentUnit)
  // childUnits: Unit[];
} 