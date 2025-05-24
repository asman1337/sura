/**
 * Core Officer interface for use across the application
 */
export interface Officer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  badgeNumber: string;
  userType: string;
  gender?: string;
  profilePhotoUrl?: string;
  phoneNumber?: string;
  
  // Role information
  isActive: boolean;
  isVerified?: boolean;
  
  // Dates
  dateOfJoining?: Date;
  dateOfRetirement?: Date;
  lastLoginAt?: Date;
  
  // Relationships
  rank?: {
    id: string;
    name: string;
    abbreviation: string;
    level: number;
  } | null;
  
  organization?: {
    id: string;
    name: string;
    code: string;
    type: string;
  } | null;
  
  primaryUnit?: {
    id: string;
    name: string;
    code: string;
    type: string;
  } | null;
  
  department?: {
    id: string;
    name: string;
  } | null;
  
  reportingOfficer?: {
    id: string;
    firstName: string;
    lastName: string;
    badgeNumber: string;
  } | null;
  
  // Additional details
  address?: string;
  jurisdictionArea?: string;
}

/**
 * Officer filter options
 */
export interface OfficerFilters {
  unitId?: string;
  departmentId?: string;
  organizationId?: string;
  search?: string;
  isActive?: boolean;
} 