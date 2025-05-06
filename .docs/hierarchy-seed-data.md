# Police Hierarchy Seed Data

## Officer Ranks

### District Police System Ranks

```typescript
const districtPoliceRanks = [
  {
    id: 'rank-001',
    name: 'Director General of Police',
    abbreviation: 'DGP',
    level: 1,
    systemType: 'BOTH',
  },
  {
    id: 'rank-002',
    name: 'Additional Director General of Police',
    abbreviation: 'Addl. DGP',
    level: 2,
    systemType: 'BOTH',
  },
  {
    id: 'rank-003',
    name: 'Inspector General of Police',
    abbreviation: 'IGP',
    level: 3,
    systemType: 'BOTH',
  },
  {
    id: 'rank-004',
    name: 'Deputy Inspector General of Police',
    abbreviation: 'DIG',
    level: 4,
    systemType: 'BOTH',
  },
  {
    id: 'rank-005',
    name: 'Superintendent of Police',
    abbreviation: 'SP',
    level: 5,
    systemType: 'DISTRICT',
  },
  {
    id: 'rank-006',
    name: 'Additional Superintendent of Police',
    abbreviation: 'Addl. SP',
    level: 6,
    systemType: 'DISTRICT',
  },
  {
    id: 'rank-007',
    name: 'Deputy Superintendent of Police',
    abbreviation: 'Dy. SP',
    level: 7,
    systemType: 'DISTRICT',
  },
  {
    id: 'rank-008',
    name: 'Circle Inspector',
    abbreviation: 'CI',
    level: 8,
    systemType: 'DISTRICT',
  },
  {
    id: 'rank-009',
    name: 'Inspector',
    abbreviation: 'Insp.',
    level: 9,
    systemType: 'BOTH',
  },
  {
    id: 'rank-010',
    name: 'Sub-Inspector',
    abbreviation: 'SI',
    level: 10,
    systemType: 'BOTH',
  },
  {
    id: 'rank-011',
    name: 'Assistant Sub-Inspector',
    abbreviation: 'ASI',
    level: 11,
    systemType: 'BOTH',
  },
  {
    id: 'rank-012',
    name: 'Head Constable',
    abbreviation: 'HC',
    level: 12,
    systemType: 'BOTH',
  },
  {
    id: 'rank-013',
    name: 'Constable',
    abbreviation: 'PC',
    level: 13,
    systemType: 'BOTH',
  },
];
```

### Commissionerate System Ranks

```typescript
const commissionerateRanks = [
  // Top state-level ranks are shared with District
  // Using rank-001 to rank-004 from above
  
  {
    id: 'rank-014',
    name: 'Commissioner of Police',
    abbreviation: 'CP',
    level: 5,
    systemType: 'COMMISSIONERATE',
  },
  {
    id: 'rank-015',
    name: 'Joint Commissioner of Police',
    abbreviation: 'Jt. CP',
    level: 6,
    systemType: 'COMMISSIONERATE',
  },
  {
    id: 'rank-016',
    name: 'Additional Commissioner of Police',
    abbreviation: 'Addl. CP',
    level: 6,
    systemType: 'COMMISSIONERATE',
  },
  {
    id: 'rank-017',
    name: 'Deputy Commissioner of Police',
    abbreviation: 'DCP',
    level: 7,
    systemType: 'COMMISSIONERATE',
  },
  {
    id: 'rank-018',
    name: 'Assistant Commissioner of Police',
    abbreviation: 'ACP',
    level: 8,
    systemType: 'COMMISSIONERATE',
  },
  // Inspector and below ranks are shared with District
  // Using rank-009 to rank-013 from above
];
```

## Standard Unit Types

```typescript
const unitTypes = [
  'SP_OFFICE',         // Superintendent of Police Office
  'ADDL_SP_OFFICE',    // Additional SP Office
  'DY_SP_OFFICE',      // Deputy SP Office / SDPO Office
  'CIRCLE_OFFICE',     // Circle Inspector Office
  'POLICE_STATION',    // Police Station
  'OUTPOST',           // Police Outpost
  'CP_OFFICE',         // Commissioner of Police Office
  'DCP_OFFICE',        // Deputy Commissioner of Police Office
  'ACP_OFFICE',        // Assistant Commissioner of Police Office
  'OTHER'              // Other units
];
```

## Standard Departments Within Units

```typescript
const standardDepartments = [
  // Common departments across different units
  {
    id: 'dept-001',
    name: 'Administration',
    description: 'Handles administrative functions',
  },
  {
    id: 'dept-002',
    name: 'Law & Order',
    description: 'Handles general law and order maintenance',
  },
  {
    id: 'dept-003',
    name: 'Crime',
    description: 'Handles crime investigation',
  },
  
  // SP Office specific departments
  {
    id: 'dept-004',
    name: 'Cyber Cell',
    description: 'Handles cyber crimes and digital forensics',
  },
  {
    id: 'dept-005',
    name: 'Special Branch',
    description: 'Handles intelligence and security',
  },
  {
    id: 'dept-006',
    name: 'Armed Reserve',
    description: 'Handles armed reserve forces',
  },
  {
    id: 'dept-007',
    name: 'Traffic',
    description: 'Manages traffic regulation and enforcement',
  },
  {
    id: 'dept-008',
    name: 'Women & Child Protection',
    description: 'Specializes in cases related to women and children',
  },
  
  // Police Station specific departments
  {
    id: 'dept-009',
    name: 'Malkhana',
    description: 'Manages evidence storage and tracking',
  },
  {
    id: 'dept-010',
    name: 'Records',
    description: 'Manages station records and documentation',
  },
  {
    id: 'dept-011',
    name: 'Complaints',
    description: 'Handles complaint registration and processing',
  },
  {
    id: 'dept-012',
    name: 'Patrol',
    description: 'Manages patrol and beat officers',
  },
];
```

## System Roles and Permissions

```typescript
const systemRoles = [
  {
    id: 'role-001',
    name: 'Super Admin',
    description: 'Complete access to all system functions across all tenants',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-002',
    name: 'Organization Admin',
    description: 'Admin access for a specific organization (SP/CP level)',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-003',
    name: 'Unit Head',
    description: 'Admin access for a specific unit (SP Office, Police Station, etc.)',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-004',
    name: 'Department Head',
    description: 'Admin access for a specific department within a unit',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-005',
    name: 'Malkhana Incharge',
    description: 'Full access to Malkhana module within assigned unit',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-006',
    name: 'Complaints Officer',
    description: 'Full access to Complaints module within assigned unit',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-007',
    name: 'Vehicle Manager',
    description: 'Full access to Vehicles module within assigned scope',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-008',
    name: 'Duty Officer',
    description: 'Full access to Duty Roster module within assigned scope',
    systemDefined: true,
    organizationId: null,
  },
  {
    id: 'role-009',
    name: 'Officer',
    description: 'Basic access for all officers',
    systemDefined: true,
    organizationId: null,
  },
];

const systemPermissions = [
  // Organization permissions
  {
    id: 'perm-001',
    resource: 'ORGANIZATION',
    action: 'CREATE',
    description: 'Create new organizations',
  },
  {
    id: 'perm-002',
    resource: 'ORGANIZATION',
    action: 'READ',
    description: 'View organization details',
  },
  {
    id: 'perm-003',
    resource: 'ORGANIZATION',
    action: 'UPDATE',
    description: 'Update organization details',
  },
  {
    id: 'perm-004',
    resource: 'ORGANIZATION',
    action: 'DELETE',
    description: 'Delete organizations',
  },
  
  // Officer permissions
  {
    id: 'perm-005',
    resource: 'OFFICER',
    action: 'CREATE',
    description: 'Create new officer profiles',
  },
  {
    id: 'perm-006',
    resource: 'OFFICER',
    action: 'READ',
    description: 'View officer details',
  },
  {
    id: 'perm-007',
    resource: 'OFFICER',
    action: 'UPDATE',
    description: 'Update officer details',
  },
  {
    id: 'perm-008',
    resource: 'OFFICER',
    action: 'DELETE',
    description: 'Delete officer profiles',
  },
  
  // Station permissions
  {
    id: 'perm-009',
    resource: 'STATION',
    action: 'CREATE',
    description: 'Create new stations',
  },
  {
    id: 'perm-010',
    resource: 'STATION',
    action: 'READ',
    description: 'View station details',
  },
  {
    id: 'perm-011',
    resource: 'STATION',
    action: 'UPDATE',
    description: 'Update station details',
  },
  {
    id: 'perm-012',
    resource: 'STATION',
    action: 'DELETE',
    description: 'Delete stations',
  },
  
  // Department permissions
  {
    id: 'perm-013',
    resource: 'DEPARTMENT',
    action: 'CREATE',
    description: 'Create new departments',
  },
  {
    id: 'perm-014',
    resource: 'DEPARTMENT',
    action: 'READ',
    description: 'View department details',
  },
  {
    id: 'perm-015',
    resource: 'DEPARTMENT',
    action: 'UPDATE',
    description: 'Update department details',
  },
  {
    id: 'perm-016',
    resource: 'DEPARTMENT',
    action: 'DELETE',
    description: 'Delete departments',
  },
  
  // Malkhana permissions
  {
    id: 'perm-017',
    resource: 'MALKHANA',
    action: 'CREATE',
    description: 'Add new items to Malkhana',
  },
  {
    id: 'perm-018',
    resource: 'MALKHANA',
    action: 'READ',
    description: 'View Malkhana items',
  },
  {
    id: 'perm-019',
    resource: 'MALKHANA',
    action: 'UPDATE',
    description: 'Update Malkhana item details',
  },
  {
    id: 'perm-020',
    resource: 'MALKHANA',
    action: 'DELETE',
    description: 'Remove items from Malkhana',
  },
  
  // Similar permissions for other modules...
];
```

## Multiple Officers in Units and Departments

```typescript
// Unit In-charge Officer Assignments
const unitInchargeOfficers = [
  // SP Office with multiple officers
  {
    id: 'unit-officer-001',
    unitId: 'unit-001', // SP Office, Warangal
    officerId: 'officer-001', // SP
    roleType: 'PRIMARY',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'unit-officer-002',
    unitId: 'unit-001', // SP Office, Warangal
    officerId: 'officer-002', // Addl. SP who also helps manage SP Office
    roleType: 'SECONDARY',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'unit-officer-003',
    unitId: 'unit-001', // SP Office, Warangal 
    officerId: 'officer-007', // Administrative officer
    roleType: 'SPECIALIZED', // Specialized role for administration
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  
  // Police Station with multiple officers (Primary OC and specialists)
  {
    id: 'unit-officer-004',
    unitId: 'unit-005', // Hanamkonda Police Station
    officerId: 'officer-005', // Inspector (Primary OC)
    roleType: 'PRIMARY',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'unit-officer-005',
    unitId: 'unit-005', // Hanamkonda Police Station
    officerId: 'officer-011', // Sub-Inspector (Crime)
    roleType: 'SPECIALIZED', // Specialized for crime
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'unit-officer-006',
    unitId: 'unit-005', // Hanamkonda Police Station
    officerId: 'officer-012', // Another Sub-Inspector (Law & Order)
    roleType: 'SPECIALIZED', // Specialized for law & order
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'unit-officer-007',
    unitId: 'unit-005', // Hanamkonda Police Station
    officerId: 'officer-020', // A temporary acting SHO during leave
    roleType: 'ACTING', // Temporarily in charge
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-06-15'), // Two week assignment
    isActive: false, // No longer active
  },
  
  // More examples for other units...
];

// Department Manager Assignments
const departmentManagerOfficers = [
  // Cyber Cell with multiple managers
  {
    id: 'dept-officer-001',
    departmentId: 'dept-instance-002', // Cyber Cell in SP Office
    officerId: 'officer-008', // Primary head
    roleType: 'HEAD',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'dept-officer-002',
    departmentId: 'dept-instance-002', // Cyber Cell in SP Office
    officerId: 'officer-025', // Deputy head
    roleType: 'DEPUTY',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'dept-officer-003',
    departmentId: 'dept-instance-002', // Cyber Cell in SP Office
    officerId: 'officer-026', // Technical specialist
    roleType: 'SPECIALIST',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  
  // Malkhana with multiple managers
  {
    id: 'dept-officer-004',
    departmentId: 'dept-instance-003', // Malkhana in Hanamkonda PS
    officerId: 'officer-011', // Main manager
    roleType: 'HEAD',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'dept-officer-005',
    departmentId: 'dept-instance-003', // Malkhana in Hanamkonda PS
    officerId: 'officer-027', // Assistant
    roleType: 'DEPUTY',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  {
    id: 'dept-officer-006',
    departmentId: 'dept-instance-003', // Malkhana in Hanamkonda PS
    officerId: 'officer-028', // Evidence coordinator
    roleType: 'COORDINATOR',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isActive: true,
  },
  
  // More examples for other departments...
];
```

## Sample Organization Hierarchy (District Police)

```typescript
// Sample organization (District Police)
const sampleDistrictPolice = {
  id: 'org-001',
  type: 'DISTRICT_POLICE',
  name: 'Warangal District Police',
  state: 'Telangana',
  jurisdictionArea: 'Warangal District',
  tenantId: 'tenant-warangal',
};

// Units within the organization
const sampleDistrictUnits = [
  // SP Office
  {
    id: 'unit-001',
    name: 'SP Office, Warangal',
    code: 'WGLSP',
    type: 'SP_OFFICE',
    organizationId: 'org-001',
    jurisdictionArea: 'Warangal District',
    primaryInchargeId: 'officer-001', // SP as primary in-charge
    parentUnitId: null,
    address: 'SP Office Complex, Warangal',
    contactInformation: {
      phone: '0870-2429301',
      email: 'sp-wgl@tgpolice.gov.in',
    },
  },
  
  // Addl. SP Office
  {
    id: 'unit-002',
    name: 'Addl. SP Office North, Warangal',
    code: 'WGLASP1',
    type: 'ADDL_SP_OFFICE',
    organizationId: 'org-001',
    jurisdictionArea: 'Warangal North Division',
    primaryInchargeId: 'officer-002', // Addl. SP as primary in-charge
    parentUnitId: 'unit-001', // Reports to SP Office
    address: 'SP Office Complex, Warangal',
    contactInformation: {
      phone: '0870-2429302',
      email: 'addlsp-north-wgl@tgpolice.gov.in',
    },
  },
  
  // Dy. SP Office
  {
    id: 'unit-003',
    name: 'Dy. SP Office, Hanamkonda',
    code: 'WGLDSP1',
    type: 'DY_SP_OFFICE',
    organizationId: 'org-001',
    jurisdictionArea: 'Hanamkonda Sub-Division',
    primaryInchargeId: 'officer-003', // Dy. SP as primary in-charge
    parentUnitId: 'unit-002', // Reports to Addl. SP Office
    address: 'Police Complex, Hanamkonda',
    contactInformation: {
      phone: '0870-2429303',
      email: 'dysp-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // Circle Office
  {
    id: 'unit-004',
    name: 'Circle Inspector Office, Hanamkonda',
    code: 'WGLCI1',
    type: 'CIRCLE_OFFICE',
    organizationId: 'org-001',
    jurisdictionArea: 'Hanamkonda Circle',
    primaryInchargeId: 'officer-004', // Circle Inspector as primary in-charge
    parentUnitId: 'unit-003', // Reports to Dy. SP Office
    address: 'Circle Office, Hanamkonda',
    contactInformation: {
      phone: '0870-2429304',
      email: 'ci-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // Police Station (reports through Circle Inspector)
  {
    id: 'unit-005',
    name: 'Hanamkonda Police Station',
    code: 'WGLHNK',
    type: 'POLICE_STATION',
    organizationId: 'org-001',
    jurisdictionArea: 'Hanamkonda Area',
    primaryInchargeId: 'officer-005', // Inspector as primary in-charge
    parentUnitId: 'unit-004', // Reports to Circle Office
    address: 'Police Station Building, Hanamkonda',
    contactInformation: {
      phone: '0870-2429305',
      email: 'ps-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // Police Station (reports directly to Dy. SP/SDPO)
  {
    id: 'unit-007',
    name: 'Elkathurthy Police Station',
    code: 'WGLELK',
    type: 'POLICE_STATION',
    organizationId: 'org-001',
    jurisdictionArea: 'Elkathurthy Area',
    primaryInchargeId: 'officer-006', // Inspector as primary in-charge
    parentUnitId: 'unit-003', // Reports directly to Dy. SP Office
    address: 'Police Station Building, Elkathurthy',
    contactInformation: {
      phone: '0870-2429307',
      email: 'ps-elk-wgl@tgpolice.gov.in',
    },
  },
  
  // Police Outpost under Police Station
  {
    id: 'unit-006',
    name: 'Bus Stand Outpost, Hanamkonda',
    code: 'WGLHNKOP1',
    type: 'OUTPOST',
    organizationId: 'org-001',
    jurisdictionArea: 'Hanamkonda Bus Stand Area',
    primaryInchargeId: 'officer-010', // Sub-Inspector as primary in-charge
    parentUnitId: 'unit-005', // Reports to Hanamkonda PS
    address: 'Bus Stand, Hanamkonda',
    contactInformation: {
      phone: '0870-2429306',
      email: 'op-bs-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // More units...
];

// Departments within Units
const sampleUnitDepartments = [
  // Departments in SP Office
  {
    id: 'dept-instance-001',
    name: 'Administration',
    unitId: 'unit-001', // SP Office
    primaryHeadId: 'officer-007', // Primary head
    description: 'Administrative department handling office matters',
  },
  {
    id: 'dept-instance-002',
    name: 'Cyber Cell',
    unitId: 'unit-001', // SP Office
    primaryHeadId: 'officer-008', // Primary head
    description: 'Cyber crime investigation unit',
  },
  
  // Departments in Hanamkonda Police Station
  {
    id: 'dept-instance-003',
    name: 'Malkhana',
    unitId: 'unit-005', // Hanamkonda PS
    primaryHeadId: 'officer-011', // Primary head
    description: 'Evidence storage and management',
  },
  {
    id: 'dept-instance-004',
    name: 'Complaints',
    unitId: 'unit-005', // Hanamkonda PS
    primaryHeadId: 'officer-012', // Primary head
    description: 'Complaint registration and processing',
  },
  
  // More departments...
];

// Sample officers in hierarchy
const sampleDistrictOfficers = [
  {
    id: 'officer-001',
    name: 'Rajiv Kumar',
    badgeNumber: 'SP12345',
    rankId: 'rank-005', // SP
    organizationId: 'org-001',
    unitId: 'unit-001', // SP Office
    departmentId: null, // No specific department
    reportingOfficerId: null, // Reports to DIG, but DIG not in this org
    jurisdictionArea: 'Warangal District',
  },
  {
    id: 'officer-002',
    name: 'Amit Singh',
    badgeNumber: 'ASP6789',
    rankId: 'rank-006', // Addl. SP
    organizationId: 'org-001',
    unitId: 'unit-002', // Addl. SP Office
    departmentId: null,
    reportingOfficerId: 'officer-001', // Reports to SP
    jurisdictionArea: 'Warangal North Division',
  },
  {
    id: 'officer-003',
    name: 'Priya Sharma',
    badgeNumber: 'DSP4567',
    rankId: 'rank-007', // Dy. SP
    organizationId: 'org-001',
    unitId: 'unit-003', // Dy. SP Office
    departmentId: null,
    reportingOfficerId: 'officer-002', // Reports to Addl. SP
    jurisdictionArea: 'Hanamkonda Sub-Division',
  },
  {
    id: 'officer-004',
    name: 'Ravi Teja',
    badgeNumber: 'CI7890',
    rankId: 'rank-008', // Circle Inspector
    organizationId: 'org-001',
    unitId: 'unit-004', // Circle Office
    departmentId: null,
    reportingOfficerId: 'officer-003', // Reports to Dy. SP
    jurisdictionArea: 'Hanamkonda Circle',
  },
  {
    id: 'officer-005',
    name: 'Krishna Reddy',
    badgeNumber: 'IN5678',
    rankId: 'rank-009', // Inspector (OC - Officer in Charge)
    organizationId: 'org-001',
    unitId: 'unit-005', // Hanamkonda Police Station (OC PS)
    departmentId: null, // Overall incharge, no specific department
    reportingOfficerId: 'officer-004', // Reports to Circle Inspector
    jurisdictionArea: 'Hanamkonda Station Limits',
  },
  {
    id: 'officer-006',
    name: 'Venkat Rao',
    badgeNumber: 'IN1234',
    rankId: 'rank-009', // Inspector (IC - In Charge)
    organizationId: 'org-001',
    unitId: 'unit-007', // Elkathurthy Police Station (IC PS)
    departmentId: null, // Overall incharge, no specific department
    reportingOfficerId: 'officer-003', // Reports directly to Dy. SP/SDPO
    jurisdictionArea: 'Elkathurthy Station Limits',
  },
  // More officers with specific department assignments
  {
    id: 'officer-011',
    name: 'Suresh Kumar',
    badgeNumber: 'SI1122',
    rankId: 'rank-010', // Sub-Inspector
    organizationId: 'org-001',
    unitId: 'unit-005', // Hanamkonda Police Station (OC PS)
    departmentId: 'dept-instance-003', // Malkhana
    reportingOfficerId: 'officer-005', // Reports to OC
    jurisdictionArea: 'Hanamkonda Station Limits',
  },
  {
    id: 'officer-012',
    name: 'Lakshmi Narayana',
    badgeNumber: 'SI3344',
    rankId: 'rank-010', // Sub-Inspector
    organizationId: 'org-001',
    unitId: 'unit-005', // Hanamkonda Police Station (OC PS)
    departmentId: 'dept-instance-004', // Complaints
    reportingOfficerId: 'officer-005', // Reports to OC
    jurisdictionArea: 'Hanamkonda Station Limits',
  },
  {
    id: 'officer-015',
    name: 'Ramesh Babu',
    badgeNumber: 'SI5566',
    rankId: 'rank-010', // Sub-Inspector
    organizationId: 'org-001',
    unitId: 'unit-008', // Railway Station Outpost (under IC PS)
    departmentId: null,
    reportingOfficerId: 'officer-006', // Reports to IC
    jurisdictionArea: 'Elkathurthy Railway Station Area',
  },
  {
    id: 'officer-016',
    name: 'Srinivas Rao',
    badgeNumber: 'SI7788',
    rankId: 'rank-010', // Sub-Inspector
    organizationId: 'org-001',
    unitId: 'unit-007', // Elkathurthy Police Station (IC PS)
    departmentId: 'dept-instance-006', // Malkhana
    reportingOfficerId: 'officer-006', // Reports to IC
    jurisdictionArea: 'Elkathurthy Station Limits',
  },
];

// Example of officers with multiple assignments
const officersWithMultipleRoles = [
  // Officer 002 (Addl. SP) has multiple roles:
  // 1. Primary in-charge of Addl. SP Office (unit-002)
  // 2. Secondary in-charge in SP Office (unit-001)
  
  // Officer 011 (Sub-Inspector) has multiple roles:
  // 1. Specialized role in Hanamkonda PS for crime (unit-005)
  // 2. Head of Malkhana department (dept-instance-003)
  
  // These relationships are established through the unitInchargeOfficers 
  // and departmentManagerOfficers collections above.
];

// Functional assignments for specialized roles
const sampleFunctionalAssignments = [
  {
    id: 'func-assign-001',
    officerId: 'officer-011', // Sub-Inspector in Hanamkonda PS (OC PS)
    function: 'MALKHANA',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: 'dept-instance-003', // Malkhana Department
    startDate: new Date('2023-01-01'),
    isActive: true,
  },
  {
    id: 'func-assign-002',
    officerId: 'officer-012', // Another Sub-Inspector in Hanamkonda PS (OC PS)
    function: 'COMPLAINTS',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: 'dept-instance-004', // Complaints Department
    startDate: new Date('2023-01-01'),
    isActive: true,
  },
  {
    id: 'func-assign-003',
    officerId: 'officer-016', // Sub-Inspector in Elkathurthy PS (IC PS)
    function: 'MALKHANA',
    unitId: 'unit-007', // Elkathurthy Police Station
    departmentId: 'dept-instance-006', // Malkhana Department
    startDate: new Date('2023-01-01'),
    isActive: true,
  },
  // More assignments...
];
```

## Sample Organization Hierarchy (Commissionerate)

```typescript
// Sample organization (Commissionerate)
const sampleCommissionerate = {
  id: 'org-002',
  type: 'COMMISSIONERATE',
  name: 'Hyderabad City Police',
  state: 'Telangana',
  jurisdictionArea: 'Hyderabad City',
  tenantId: 'tenant-hyderabad',
};

// Units within the organization
const sampleCommissionerateUnits = [
  // CP Office
  {
    id: 'unit-101',
    name: 'Commissioner of Police Office, Hyderabad',
    code: 'HYDCP',
    type: 'CP_OFFICE', 
    organizationId: 'org-002',
    jurisdictionArea: 'Hyderabad City',
    inchargeOfficerId: 'officer-101', // CP
    parentUnitId: null,
    isDirectReporting: false, // Not applicable for CP Office
    address: 'CP Office, Basheerbagh, Hyderabad',
    contactInformation: {
      phone: '040-23232323',
      email: 'cp-hyd@tgpolice.gov.in',
    },
  },
  
  // DCP Office
  {
    id: 'unit-103',
    name: 'DCP Office, Banjara Hills, Hyderabad',
    code: 'HYDDCP1',
    type: 'DCP_OFFICE',
    organizationId: 'org-002',
    jurisdictionArea: 'Banjara Hills Division, Hyderabad',
    inchargeOfficerId: 'officer-103', // DCP
    parentUnitId: 'unit-101', // Reports to CP Office
    isDirectReporting: false, // Not applicable for DCP Office
    address: 'DCP Office, Road No. 12, Banjara Hills, Hyderabad',
    contactInformation: {
      phone: '040-23232325',
      email: 'dcp-bh-hyd@tgpolice.gov.in',
    },
  },
  
  // ACP Office
  {
    id: 'unit-104',
    name: 'ACP Office, Banjara Hills, Hyderabad',
    code: 'HYDACP1',
    type: 'ACP_OFFICE',
    organizationId: 'org-002',
    jurisdictionArea: 'Banjara Hills Sub-Division, Hyderabad',
    inchargeOfficerId: 'officer-104', // ACP
    parentUnitId: 'unit-103', // Reports to DCP Office
    isDirectReporting: false, // Not applicable for ACP Office
    address: 'ACP Office, Banjara Hills, Hyderabad',
    contactInformation: {
      phone: '040-23232326',
      email: 'acp-bh-hyd@tgpolice.gov.in',
    },
  },
  
  // Police Station (IC PS - reports directly to ACP)
  {
    id: 'unit-105',
    name: 'Banjara Hills Police Station',
    code: 'HYDBH',
    type: 'POLICE_STATION',
    organizationId: 'org-002',
    jurisdictionArea: 'Banjara Hills Area, Hyderabad',
    inchargeOfficerId: 'officer-105', // Inspector (IC PS)
    parentUnitId: 'unit-104', // Reports to ACP Office
    isDirectReporting: true, // Direct reporting to ACP
    address: 'Police Station, Road No. 12, Banjara Hills, Hyderabad',
    contactInformation: {
      phone: '040-23232327',
      email: 'ps-bh-hyd@tgpolice.gov.in',
    },
  },
  
  // Police Station (OC PS - reports to Circle Inspector, if present)
  {
    id: 'unit-106',
    name: 'Jubilee Hills Police Station',
    code: 'HYDJH',
    type: 'POLICE_STATION',
    organizationId: 'org-002',
    jurisdictionArea: 'Jubilee Hills Area, Hyderabad',
    inchargeOfficerId: 'officer-106', // Inspector (OC PS)
    parentUnitId: 'unit-104', // Reports to ACP Office
    isDirectReporting: false, // May go through Circle Inspector in some cases
    address: 'Police Station, Road No. 36, Jubilee Hills, Hyderabad',
    contactInformation: {
      phone: '040-23232328',
      email: 'ps-jh-hyd@tgpolice.gov.in',
    },
  },
];

// Sample officers in hierarchy
const sampleCommissionerateOfficers = [
  {
    id: 'officer-101',
    name: 'Anil Kumar',
    badgeNumber: 'CP5678',
    rankId: 'rank-014', // Commissioner of Police
    organizationId: 'org-002',
    unitId: 'unit-101', // CP Office
    departmentId: null,
    reportingOfficerId: null, // Reports to DGP, but not in this org
    jurisdictionArea: 'Hyderabad City',
  },
  {
    id: 'officer-103',
    name: 'Mohammed Khan',
    badgeNumber: 'DCP5678',
    rankId: 'rank-017', // DCP
    organizationId: 'org-002',
    unitId: 'unit-103', // DCP Office
    departmentId: null,
    reportingOfficerId: 'officer-101', // Reports to CP
    jurisdictionArea: 'Banjara Hills Division, Hyderabad',
  },
  {
    id: 'officer-104',
    name: 'Lakshmi Prasad',
    badgeNumber: 'ACP9012',
    rankId: 'rank-018', // ACP
    organizationId: 'org-002',
    unitId: 'unit-104', // ACP Office
    departmentId: null,
    reportingOfficerId: 'officer-103', // Reports to DCP
    jurisdictionArea: 'Banjara Hills Sub-Division, Hyderabad',
  },
  {
    id: 'officer-105',
    name: 'Vikram Singh',
    badgeNumber: 'IN3456',
    rankId: 'rank-009', // Inspector (IC PS)
    organizationId: 'org-002',
    unitId: 'unit-105', // Banjara Hills Police Station
    departmentId: null,
    reportingOfficerId: 'officer-104', // Reports directly to ACP
    jurisdictionArea: 'Banjara Hills Station Limits, Hyderabad',
  },
  {
    id: 'officer-106',
    name: 'Rohit Saxena',
    badgeNumber: 'IN7890',
    rankId: 'rank-009', // Inspector (OC PS)
    organizationId: 'org-002',
    unitId: 'unit-106', // Jubilee Hills Police Station
    departmentId: null,
    reportingOfficerId: 'officer-104', // Reports to ACP, potentially through CI if present
    jurisdictionArea: 'Jubilee Hills Station Limits, Hyderabad',
  },
  // More officers...
];
``` 

## Police Station Reporting Paths

Here are the two distinct reporting paths for police stations in the Indian Police system:

### 1. Direct Reporting Path (IC PS - In-Charge Police Station)
* Reports directly to Dy.SP/SDPO in District Police
* Reports directly to ACP in Commissionerate
* Identified by the `isDirectReporting: true` flag in the Unit entity
* Example in District Police: Elkathurthy Police Station
* Example in Commissionerate: Banjara Hills Police Station

### 2. Circle-Level Reporting Path (OC PS - Officer in Charge Police Station)
* Reports to Dy.SP/SDPO through a Circle Inspector in District Police
* May have a similar intermediary reporting structure in Commissionerate
* Identified by the `isDirectReporting: false` flag in the Unit entity
* Example in District Police: Hanamkonda Police Station
* Example in Commissionerate: Jubilee Hills Police Station (if Circle Inspector is present)

Both types of police stations may have outposts under them, and both have similar department structures internally. 