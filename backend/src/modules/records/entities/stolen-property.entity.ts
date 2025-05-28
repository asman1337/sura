import { Column, ChildEntity } from 'typeorm';
import { BaseRecord } from './base-record.entity';

export type PropertySource = 'stolen' | 'intestate' | 'unclaimed' | 'suspicious' | 'exhibits' | 'others';

@ChildEntity('stolen_property')
export class StolenPropertyRecord extends BaseRecord {
  @Column({ length: 20, unique: true })
  propertyId: string;
  
  // Type categorization as per PBR Form 17
  @Column({
    type: 'enum', 
    enum: ['stolen', 'intestate', 'unclaimed', 'suspicious', 'exhibits', 'others'],
    default: 'stolen'
  })
  propertySource: PropertySource;
  
  // Description details
  @Column({ length: 50 })
  propertyType: string;
  
  @Column({ length: 500 })
  description: string;
  
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  estimatedValue: number;
  
  // Found details
  @Column({ length: 150 })
  foundBy: string;
  
  @Column({ type: 'timestamp' })
  dateOfTheft: Date;
  
  @Column({ length: 255 })
  location: string;
  
  // Ownership details if known
  @Column({ length: 100, nullable: true })
  ownerName: string;
  
  @Column({ length: 20, nullable: true })
  ownerContact: string;
  
  // Case reference
  @Column({ length: 30, nullable: true })
  linkedCaseNumber: string;
  
  // Police station receipt
  @Column({ type: 'timestamp' })
  dateOfReceipt: Date;
  
  @Column({ length: 100, nullable: true })
  receivedBy: string;
  
  // Recovery status
  @Column({ type: 'enum', enum: ['reported', 'investigation', 'recovered', 'closed'], default: 'reported' })
  recoveryStatus: string;
  
  @Column({ type: 'timestamp', nullable: true })
  recoveryDate: Date;
  
  // Sale/disposal information
  @Column({ type: 'boolean', default: false })
  isSold: boolean;
  
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  soldPrice: number;
  
  @Column({ type: 'timestamp', nullable: true })
  dateOfRemittance: Date;
  
  @Column({ length: 100, nullable: true })
  disposalMethod: string;
  
  // Evidence-related fields
  @Column({ type: 'text', array: true, nullable: true })
  photoUrls: string[];
  
  @Column({ type: 'jsonb', nullable: true })
  additionalDetails: Record<string, any>;
} 