import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { Officer } from 'src/modules/officers/entities/officer.entity';

@Entity('cash_registry_daily_balances')
@Unique(['unitId', 'balanceDate'])
export class CashRegistryDailyBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unit that owns this balance record
  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  // Balance details
  @Column({ type: 'date' })
  balanceDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  openingBalance: number;

  @Column('decimal', { precision: 10, scale: 2 })
  receiptsTotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  disbursementsTotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  closingBalance: number;

  // Denomination details (JSON structure)
  @Column('json', { nullable: true })
  closingDenominationDetails: {
    notes2000: number;
    notes500: number;
    notes200: number;
    notes100: number;
    notes50: number;
    notes20: number;
    notes10: number;
    coins: number;
  };

  // Verification and attestation
  @Column({ type: 'uuid' })
  verifiedById: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: Officer;

  @Column({ type: 'timestamp' })
  verifiedAt: Date;

  @Column({ default: true })
  isBalanced: boolean;

  @Column({ length: 500, nullable: true })
  discrepancyNotes: string;

  // Audit fields
  @Column({ length: 36 })
  createdBy: string;

  @Column({ length: 36, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 