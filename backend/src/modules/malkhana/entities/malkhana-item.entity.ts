import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Shelf } from './shelf.entity';
import { RedInkHistory } from './red-ink-history.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';

// Status of a Malkhana item
export enum MalkhanaItemStatus {
  ACTIVE = 'ACTIVE',
  DISPOSED = 'DISPOSED',
  TRANSFERRED = 'TRANSFERRED',
  RELEASED = 'RELEASED'
}

// Type of registry (Black Ink = current year, Red Ink = historical)
export enum RegistryType {
  BLACK_INK = 'BLACK_INK',
  RED_INK = 'RED_INK'
}

// Nature of property enum
export enum PropertyNature {
  STOLEN_PROPERTY = 'STOLEN_PROPERTY',
  INTESTATE_PROPERTY = 'INTESTATE_PROPERTY',
  UNCLAIMED_PROPERTY = 'UNCLAIMED_PROPERTY',
  SUSPICIOUS_PROPERTY = 'SUSPICIOUS_PROPERTY',
  EXHIBITS_AND_OTHER_PROPERTY = 'EXHIBITS_AND_OTHER_PROPERTY',
  SAFE_CUSTODY_PROPERTY = 'SAFE_CUSTODY_PROPERTY',
  OTHERS = 'OTHERS'
}

@Entity('malkhana_items')
export class MalkhanaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The current registry number (changes yearly for Red Ink items)
  @Column()
  registryNumber: number;

  // The permanent mother number that never changes (format: YYYY-NNNNN)
  @Column({ length: 20, unique: true })
  motherNumber: string;

  // Unit (Police Station) that owns this item
  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ length: 100, nullable: true })
  caseNumber: string;

  // Additional case-related fields
  @Column({ length: 50, nullable: true })
  prNumber: string;

  @Column({ length: 50, nullable: true })
  gdeNumber: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 100 })
  category: string;

  // Nature of property
  @Column({
    type: 'enum',
    enum: PropertyNature,
    nullable: true
  })
  propertyNature: PropertyNature;

  @Column({ type: 'timestamp' })
  dateReceived: Date;

  @Column({ length: 200 })
  receivedFrom: string;

  // Address of the person from whom seized
  @Column({ type: 'text', nullable: true })
  receivedFromAddress: string;

  // Investigating Officer details
  @Column({ length: 200, nullable: true })
  investigatingOfficerName: string;

  @Column({ length: 100, nullable: true })
  investigatingOfficerRank: string;

  @Column({ length: 15, nullable: true })
  investigatingOfficerPhone: string;

  @Column({ length: 200, nullable: true })
  investigatingOfficerUnit: string;

  @Column({ length: 200 })
  condition: string;

  @Column({
    type: 'enum',
    enum: MalkhanaItemStatus,
    default: MalkhanaItemStatus.ACTIVE
  })
  status: MalkhanaItemStatus;

  @Column({ type: 'date', nullable: true })
  disposalDate: Date;

  @Column({ type: 'text', nullable: true })
  disposalReason: string;

  @Column({ length: 200, nullable: true })
  disposalApprovedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: RegistryType,
    default: RegistryType.BLACK_INK
  })
  registryType: RegistryType;

  @Column()
  registryYear: number;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  // Shelf organization
  @Column({ nullable: true })
  shelfId: string;

  @ManyToOne(() => Shelf, shelf => shelf.items, { nullable: true })
  @JoinColumn({ name: 'shelfId' })
  shelf: Shelf;

  // History of red ink IDs for this item
  @OneToMany(() => RedInkHistory, history => history.item, { cascade: true })
  redInkHistory: RedInkHistory[];

  @Column({ length: 36, nullable: true })
  createdBy: string;

  @Column({ length: 36, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 