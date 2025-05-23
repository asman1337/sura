/**
 * Duty Roster Types
 */

// Unit interface (simplified - would normally import from core)
export interface Unit {
  id: string;
  name: string;
}

// Officer interface (simplified - would normally import from core)
export interface Officer {
  id: string;
  name: string;
  rank: string;
  badgeNumber: string;
}

// Duty Roster Status
export enum DutyRosterStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// Duty Assignment Type
export enum DutyAssignmentType {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL'
}

// Duty Roster
export interface DutyRoster {
  id: string;
  name: string;
  unitId?: string;
  unit?: Unit;
  startDate: string; // ISO date format
  endDate: string; // ISO date format
  status: DutyRosterStatus;
  createdById?: string;
  createdBy?: string;
  notes?: string;
  assignments?: DutyAssignment[];
  createdAt: string; // ISO datetime format
  updatedAt: string; // ISO datetime format
}

// Duty Shift
export interface DutyShift {
  id: string;
  rosterId: string;
  name?: string;
  date: string; // ISO date format
  startTime: string; // 24-hour format (HH:MM)
  endTime: string; // 24-hour format (HH:MM)
  type: string;
  location: string;
  notes?: string;
  isDefault?: boolean;
  createdAt?: string; // ISO datetime format
  updatedAt?: string; // ISO datetime format
}

// Duty Assignment
export interface DutyAssignment {
  id: string;
  dutyRosterId: string;
  dutyRoster?: DutyRoster;
  officerId: string;
  officer?: Officer;
  date: string; // ISO date format
  shiftId: string;
  shift?: DutyShift;
  assignmentType: DutyAssignmentType;
  notes?: string;
  assignedAt: string; // ISO datetime format
  createdAt?: string; // ISO datetime format
  updatedAt?: string; // ISO datetime format
}

// Create Duty Roster DTO
export interface CreateDutyRosterDto {
  name: string;
  unitId?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  status?: DutyRosterStatus;
}

// Update Duty Roster DTO
export interface UpdateDutyRosterDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: DutyRosterStatus;
  notes?: string;
}

// Create Duty Shift DTO
export interface CreateDutyShiftDto {
  name: string;
  startTime: string;
  endTime: string;
  isDefault?: boolean;
}

// Update Duty Shift DTO
export interface UpdateDutyShiftDto {
  name?: string; 
  startTime?: string;
  endTime?: string;
  isDefault?: boolean;
}

// Create Duty Assignment DTO
export interface CreateDutyAssignmentDto {
  dutyRosterId: string;
  officerId: string;
  date: string;
  shiftId: string;
  assignmentType: DutyAssignmentType;
  notes?: string;
}

// Update Duty Assignment DTO
export interface UpdateDutyAssignmentDto {
  shiftId?: string;
  assignmentType?: DutyAssignmentType;
  notes?: string;
}

// Batch Create Duty Assignments
export type BatchCreateDutyAssignmentsDto = CreateDutyAssignmentDto[];

/**
 * Repository interfaces
 */

// Data service interfaces
export interface ApiClient {
  get<T>(path: string, options?: any): Promise<T>;
  post<T>(path: string, data: any, options?: any): Promise<T>;
  put<T>(path: string, data: any, options?: any): Promise<T>;
  patch<T>(path: string, data: any, options?: any): Promise<T>;
  delete<T>(path: string, options?: any): Promise<T>;
}

export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

export interface SyncManager {
  queueOperation(resourceType: string, operation: any): Promise<void>;
  processQueue(resourceType: string): Promise<void>;
}

export interface StorageClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

// Repository interface
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Specific repositories
export interface DutyRosterRepository extends Repository<DutyRoster> {
  publishRoster(id: string): Promise<DutyRoster>;
  getRostersByUnit(unitId?: string): Promise<DutyRoster[]>;
}

export interface DutyShiftRepository extends Repository<DutyShift> {
  getByRosterId(rosterId: string): Promise<DutyShift[]>;
}

export interface DutyAssignmentRepository extends Repository<DutyAssignment> {
  getByRosterId(rosterId: string): Promise<DutyAssignment[]>;
  getByOfficerId(officerId: string): Promise<DutyAssignment[]>;
} 