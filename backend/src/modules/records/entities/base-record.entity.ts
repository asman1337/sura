import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  TableInheritance,
} from 'typeorm';
import { Officer } from '../../officers/entities/officer.entity';
import { Unit } from '../../units/entities/unit.entity';

export type RecordStatus = 'active' | 'archived' | 'deleted';
export type RecordType = 'ud_case' | 'stolen_property' | 'general_diary' | 'fir' | 'arrest_memo' | 'paper_dispatch';

@Entity('records')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BaseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'enum',
    enum: ['ud_case', 'stolen_property', 'general_diary', 'fir', 'arrest_memo', 'paper_dispatch'],
    nullable: false,
  })
  type: RecordType;

  @Column({ type: 'enum', enum: ['active', 'archived', 'deleted'], default: 'active' })
  status: RecordStatus;

  @Column({ type: 'uuid' })
  unitId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  lastModifiedById: string;

  @Column({ length: 1000, nullable: true })
  remarks: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'createdById' })
  createdBy: Officer;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'lastModifiedById' })
  lastModifiedBy: Officer;
} 