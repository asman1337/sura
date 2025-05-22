import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Officer } from '../../officers/entities/officer.entity';
import { DutyRoster } from './duty-roster.entity';
import { DutyShift } from './duty-shift.entity';

export enum AssignmentType {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL'
}

@Entity('duty_assignments')
export class DutyAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  dutyRosterId: string;

  @ManyToOne(() => DutyRoster, dutyRoster => dutyRoster.assignments)
  @JoinColumn({ name: 'dutyRosterId' })
  dutyRoster: DutyRoster;

  @Column({ type: 'uuid' })
  officerId: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'officerId' })
  officer: Officer;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'uuid' })
  shiftId: string;

  @ManyToOne(() => DutyShift)
  @JoinColumn({ name: 'shiftId' })
  shift: DutyShift;

  @Column({
    type: 'enum',
    enum: AssignmentType,
    default: AssignmentType.REGULAR
  })
  assignmentType: AssignmentType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 