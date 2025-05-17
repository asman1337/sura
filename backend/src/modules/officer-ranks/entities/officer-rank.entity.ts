import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('officer_ranks')
export class OfficerRank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 15 })
  abbreviation: string;

  @Column()
  level: number; // Lower number = higher rank (1 for DGP, etc.)

  @Column({ type: 'enum', enum: ['DISTRICT', 'COMMISSIONERATE', 'BOTH'], default: 'BOTH' })
  systemType: 'DISTRICT' | 'COMMISSIONERATE' | 'BOTH';

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships will be defined when all entities are created
  // @OneToMany(() => Officer, officer => officer.rank)
  // officers: Officer[];
} 