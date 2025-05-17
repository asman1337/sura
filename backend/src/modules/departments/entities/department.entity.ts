import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 36 })
  unitId: string;

  @Column({ length: 36, nullable: true })
  primaryHeadId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // These will be set up when all entities are created
  // @ManyToOne(() => Unit)
  // @JoinColumn({ name: 'unitId' })
  // unit: Unit;

  // @ManyToOne(() => Officer, { nullable: true })
  // @JoinColumn({ name: 'primaryHeadId' })
  // primaryHead: Officer;
} 