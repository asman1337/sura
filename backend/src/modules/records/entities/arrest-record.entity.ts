import { Column, ChildEntity } from 'typeorm';
import { BaseRecord } from './base-record.entity';

export type ArrestRecordPart = 'part1' | 'part2';

@ChildEntity('arrest_record')
export class ArrestRecord extends BaseRecord {
  // Serial Number tracking - Format: YYYYMMNNN (e.g., 202501001)
  @Column({ length: 20, unique: true })
  serialNumber: string; // Format: YYYYMMNNN

  @Column({ type: 'int' })
  serialCount: number; // Sequential number for the month

  @Column({ type: 'int' })
  serialYear: number; // Year part

  @Column({ type: 'int' })
  serialMonth: number; // Month part

  @Column({ type: 'enum', enum: ['part1', 'part2'] })
  partType: ArrestRecordPart; // Part 1 or Part 2

  // Accused Person Details
  @Column({ length: 200 })
  accusedName: string; // Name of accused person

  @Column({ type: 'text' })
  accusedAddress: string; // Address of accused person

  @Column({ length: 15, nullable: true })
  accusedPhone: string; // Phone number of accused person

  @Column({ length: 100, nullable: true })
  accusedPCN: string; // P.C.N (Personal Complaint Number) of accused person

  // Arrest Details
  @Column({ type: 'timestamp' })
  dateOfArrest: Date; // Date of arrest

  @Column({ length: 200 })
  arrestingOfficerName: string; // Name of arresting officer

  @Column({ type: 'timestamp', nullable: true })
  dateForwardedToCourt: Date; // Date of forwarding to court

  // Court Details
  @Column({ length: 200, nullable: true })
  courtName: string; // Court name

  @Column({ length: 100, nullable: true })
  courtAddress: string; // Court address

  @Column({ length: 50, nullable: true })
  judgeNameOrCourtNumber: string; // Judge name or court number

  // Case Reference
  @Column({ length: 100, nullable: true })
  caseReference: string; // Case reference number

  @Column({ length: 500, nullable: true })
  trialResult: string; // Result of trial

  // Criminal Identification Fields (mainly for Part 1, optional for Part 2)
  @Column({ type: 'int', nullable: true })
  age: number; // Age of accused

  @Column({ type: 'text', nullable: true })
  identifyingMarks: string; // Identifying marks

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // Height in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // Weight in kg

  @Column({ length: 50, nullable: true })
  eyeColor: string; // Eye color

  @Column({ length: 50, nullable: true })
  hairColor: string; // Hair color

  @Column({ length: 50, nullable: true })
  complexion: string; // Complexion

  @Column({ type: 'text', nullable: true })
  otherPhysicalFeatures: string; // Other physical features

  // Photo attachments (1-4 photos, optional)
  @Column({ type: 'text', array: true, nullable: true })
  photoUrls: string[]; // URLs to uploaded photos

  // Additional fields
  @Column({ type: 'text', nullable: true })
  arrestCircumstances: string; // Circumstances of arrest

  @Column({ length: 200, nullable: true })
  arrestLocation: string; // Location of arrest

  @Column({ type: 'timestamp' })
  recordDate: Date; // Date when record was created

  @Column({ type: 'boolean', default: true })
  isIdentificationRequired: boolean; // Whether criminal identification is required (true for part1, optional for part2)
}
