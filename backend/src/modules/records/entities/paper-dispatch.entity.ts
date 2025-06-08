import { Column, ChildEntity } from 'typeorm';
import { BaseRecord } from './base-record.entity';

export type FormType = 'part1' | 'part2' | 'part4';
export type ClosedStatus = 'open' | 'closed';
export type RegistryType = 'BLACK_INK' | 'RED_INK';

@ChildEntity('paper_dispatch')
export class PaperDispatchRecord extends BaseRecord {
  // Serial Number tracking
  @Column({ length: 20, unique: true })
  serialNumber: string; // Format: count/year (e.g., 1/2025)

  @Column({ type: 'int' })
  serialCount: number; // The count part of serial number

  @Column({ type: 'int' })
  serialYear: number; // The year part of serial number

  // Basic record information
  @Column({ type: 'timestamp' })
  dateOfReceive: Date; // Date of Receive
  @Column({ length: 200 })
  fromWhom: string; // From Whom
  
  @Column({ length: 100, nullable: true })
  memoNumber: string; // Memo No. / ORG and DR No, GD, Case no etc

  @Column({ length: 500 })
  purpose: string; // Purpose
  
  @Column({ length: 200, nullable: true })
  toWhom: string; // To Whom (Endorsed)

  @Column({ length: 100, nullable: true })
  caseReference: string; // Case Reference
  
  @Column({ type: 'timestamp', nullable: true })
  dateFixed: Date; // Date Fix (Before Remark) [Court expected date]
  @Column({ type: 'enum', enum: ['open', 'closed'], default: 'open' })
  closedStatus: ClosedStatus; // Closed status
  
  @Column({ type: 'text', array: true, nullable: true })
  attachmentUrls: string[]; // Upload Photo/PDF attach (Receive/Sent)

  @Column({ type: 'boolean', default: false })
  noExpectingReport: boolean; // No expecting report flag

  @Column({ type: 'enum', enum: ['part1', 'part2', 'part4'] })
  formType: FormType; // Form Type (Part 1, 2, 4)
  // Registry tracking (like malkhana black/red ink)
  @Column({ type: 'enum', enum: ['BLACK_INK', 'RED_INK'], default: 'BLACK_INK' })
  registryType: RegistryType;
  
  @Column({ type: 'timestamp', nullable: true })
  dateTransitionToRed: Date; // When it moved to red ink
  
  @Column({ length: 150, nullable: true })
  endorsedOfficerName: string; // Officer who received the endorsement

  @Column({ length: 20, nullable: true })
  endorsedOfficerBadgeNumber: string;

  // Computed fields (will be calculated in service)
  @Column({ type: 'boolean', default: false })
  isOverdue: boolean; // Auto-calculated based on 7-day rule

  @Column({ type: 'int', default: 0 })
  daysElapsed: number; // Days since dateOfReceive  // Form type specific fields as JSON
  @Column({ type: 'jsonb', nullable: true })
  courtDetails: {
    courtName?: string;
    caseNumber?: string;
    hearingDate?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  seniorOfficeDetails: {
    officeName?: string;
    caseNumber?: string;
    officerName?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  publicPetitionDetails: {
    petitionerName?: string;
    petitionNumber?: string;
    subject?: string;
  };
}
