import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MalkhanaItem } from './malkhana-item.entity';

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

  // QR code for the shelf
  @Column({ length: 255, nullable: true })
  qrCodeUrl: string;

  @OneToMany(() => MalkhanaItem, item => item.shelf)
  items: MalkhanaItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 