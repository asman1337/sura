import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';
import { Officer } from '../../officers/entities/officer.entity';
import { DutyAssignment } from './duty-assignment.entity';

export enum DutyRosterStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

@Entity('duty_rosters')
export class DutyRoster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: DutyRosterStatus,
    default: DutyRosterStatus.DRAFT
  })
  status: DutyRosterStatus;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'createdById' })
  createdBy: Officer;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => DutyAssignment, assignment => assignment.dutyRoster, {
    cascade: true
  })
  assignments: DutyAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 