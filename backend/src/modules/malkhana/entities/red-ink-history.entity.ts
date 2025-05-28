import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MalkhanaItem } from './malkhana-item.entity';

@Entity('red_ink_history')
export class RedInkHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @Column()
  redInkId: number;

  @Column()
  itemId: string;

  @ManyToOne(() => MalkhanaItem, item => item.redInkHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: MalkhanaItem;

  @CreateDateColumn()
  createdAt: Date;
} 