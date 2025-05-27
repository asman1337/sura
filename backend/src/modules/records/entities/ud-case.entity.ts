import { Entity, Column } from 'typeorm';
import { BaseRecord } from './base-record.entity';
import { ChildEntity } from 'typeorm';

@ChildEntity('ud_case')
export class UDCaseRecord extends BaseRecord {
  // 1. Case Reference
  @Column({ length: 100, unique: true })
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
  
  // 5. Assigned Officer Information (simple fields)
  @Column({ length: 150, nullable: true })
  assignedOfficerName: string;

  @Column({ length: 20, nullable: true })
  assignedOfficerBadgeNumber: string;

  @Column({ length: 15, nullable: true })
  assignedOfficerContact: string;

  @Column({ length: 100, nullable: true })
  assignedOfficerRank: string;

  @Column({ length: 100, nullable: true })
  assignedOfficerDepartment: string;
  
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

  // New fields for sample data compatibility
  @Column({ length: 50, nullable: true })
  serialNumber: string;

  @Column({ length: 20, nullable: true })
  policeStationCode: string;

  @Column({ length: 100, nullable: true })
  policeStationName: string;

  // Enhanced autopsy/post-mortem information
  @Column({ type: 'jsonb', nullable: true })
  autopsyResults: {
    cause_of_death?: string;
    manner_of_death?: 'natural' | 'accident' | 'suicide' | 'homicide' | 'undetermined';
    findings?: string;
    toxicology_results?: string;
    time_of_death_estimate?: string;
    injuries_description?: string;
  };

  // Final form status tracking
  @Column({ type: 'enum', enum: ['draft', 'submitted', 'reviewed', 'approved', 'closed'], default: 'draft' })
  finalFormStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  finalFormSubmissionDate: Date;

  @Column({ length: 100, nullable: true })
  finalFormReviewedBy: string;

  @Column({ length: 100, nullable: true })
  finalFormApprovedBy: string;

  // Additional deceased information
  @Column({ length: 25, nullable: true })
  deceasedAge: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other', 'unknown'], nullable: true })
  deceasedGender: string;

  @Column({ length: 100, nullable: true })
  deceasedOccupation: string;

  @Column({ length: 100, nullable: true })
  deceasedNationality: string;

  // Enhanced location details
  @Column({ length: 500, nullable: true })
  exactLocation: string;

  @Column({ length: 255, nullable: true })
  nearestLandmark: string;

  @Column({ type: 'jsonb', nullable: true })
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
}