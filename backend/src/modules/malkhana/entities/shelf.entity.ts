import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { MalkhanaItem } from './malkhana-item.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';

@Entity('malkhana_shelves')
export class Shelf {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200 })
  location: string;

  @Column({ length: 100, nullable: true })
  category: string;

  // Unit (Police Station) that owns this shelf
  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @OneToMany(() => MalkhanaItem, item => item.shelf)
  items: MalkhanaItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 