import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseRecord } from './base-record.entity';
import { Officer } from '../../officers/entities/officer.entity';
import { ChildEntity } from 'typeorm';

@ChildEntity('ud_case')
export class UDCaseRecord extends BaseRecord {
  // 1. Case Reference
  @Column({ length: 20, unique: true })
  caseNumber: string;
  
  // 2. Date of Occurrence
  @Column({ type: 'timestamp' })
  dateOfOccurrence: Date;
  
  // 2. Name & Address of the deceased
  @Column({ length: 150, nullable: true })
  deceasedName: string;
  
  @Column({ length: 500, nullable: true })
  deceasedAddress: string;

  @Column({ type: 'enum', enum: ['identified', 'unidentified', 'partial'], default: 'unidentified' })
  identificationStatus: string;
  
  // 3. Name & Address of Informant
  @Column({ length: 150 })
  informantName: string;
  
  @Column({ length: 500 })
  informantAddress: string;
  
  @Column({ length: 15, nullable: true })
  informantContact: string;
  
  @Column({ length: 100, nullable: true })
  informantRelation: string;
  
  // 4. Apparent Cause of Death
  @Column({ length: 500 })
  apparentCauseOfDeath: string;
  
  @Column({ length: 255 })
  location: string;
  
  // 5. Name of the E.O (Enquiry Officer)
  @Column({ type: 'uuid' })
  assignedOfficerId: string;
  
  // 6. Date Received of P.M (Post Mortem)
  @Column({ type: 'timestamp', nullable: true })
  postMortemDate: Date;
  
  @Column({ length: 100, nullable: true })
  postMortemDoctor: string;
  
  @Column({ length: 255, nullable: true })
  postMortemHospital: string;

  // 7. Photos of Unknown dead body
  @Column({ type: 'text', array: true, nullable: true })
  photoUrls: string[];

  @Column({ type: 'enum', enum: ['pending', 'investigation', 'closed'], default: 'pending' })
  investigationStatus: string;
  
  @Column({ length: 500, nullable: true })
  description: string;
  
  @Column({ type: 'jsonb', nullable: true })
  additionalDetails: Record<string, any>;
  
  // Relationships
  @ManyToOne(() => Officer)
  @JoinColumn({ name: 'assignedOfficerId' })
  assignedOfficer: Officer;
} 