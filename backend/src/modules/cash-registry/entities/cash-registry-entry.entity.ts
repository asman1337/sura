import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Officer } from 'src/modules/officers/entities/officer.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';

// Types of cash transactions
export enum TransactionType {
  RECEIPT = 'RECEIPT',
  DISBURSEMENT = 'DISBURSEMENT'
}

// Sources of cash receipts
export enum CashSource {
  SEIZED = 'SEIZED',
  FROM_ACCUSED = 'FROM_ACCUSED',
  FINES = 'FINES',
  FEES = 'FEES',
  BAIL = 'BAIL',
  OTHER = 'OTHER'
}

// Purpose of cash disbursements
export enum DisbursementPurpose {
  TRAVEL_ALLOWANCE = 'TRAVEL_ALLOWANCE',
  RETURN_TO_OWNER = 'RETURN_TO_OWNER',
  TRANSFER_TO_TREASURY = 'TRANSFER_TO_TREASURY',
  COURT_DEPOSIT = 'COURT_DEPOSIT',
  EXPENSES = 'EXPENSES',
  OTHER = 'OTHER'
}

@Entity('cash_registry_entries')
export class CashRegistryEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unit that owns this cash entry
  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  // Transaction details
  @Column({
    type: 'enum',
    enum: TransactionType
  })
  transactionType: TransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  // Receipt-specific fields
  @Column({
    type: 'enum',
    enum: CashSource,
    nullable: true
  })
  source: CashSource;

  // Disbursement-specific fields
  @Column({
    type: 'enum',
    enum: DisbursementPurpose,
    nullable: true
  })
  purpose: DisbursementPurpose;

  // Common fields for both types
  @Column({ length: 100, nullable: true })
  caseReference: string;

  @Column({ length: 50 })
  documentNumber: string; // Receipt/voucher number

  // Denomination details (JSON structure)
  @Column('json', { nullable: true })
  denominationDetails: {
    notes2000: number;
    notes500: number;
    notes200: number;
    notes100: number;
    notes50: number;
    notes20: number;
    notes10: number;
    coins: number;
  };

  // Handler and attestation
  @Column({ type: 'uuid' })
  handledById: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'handledById' })
  handledBy: Officer;

  @Column({ type: 'uuid', nullable: true })
  attestedById: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'attestedById' })
  attestedBy: Officer;

  @Column({ type: 'timestamp', nullable: true })
  attestedAt: Date;

  @Column({ length: 500, nullable: true })
  notes: string;

  // Reconciliation
  @Column({ default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

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