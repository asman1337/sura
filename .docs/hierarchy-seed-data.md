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
  'DY_SP_OFFICE',      // Deputy SP Office
  'CIRCLE_OFFICE',     // Circle Inspector Office
  'POLICE_STATION',    // Police Station
  'OUTPOST',           // Police Outpost
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
    inchargeOfficerId: 'officer-001', // SP
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
    inchargeOfficerId: 'officer-002', // Addl. SP
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
    inchargeOfficerId: 'officer-003', // Dy. SP
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
    inchargeOfficerId: 'officer-004', // Circle Inspector
    parentUnitId: 'unit-003', // Reports to Dy. SP Office
    address: 'Circle Office, Hanamkonda',
    contactInformation: {
      phone: '0870-2429304',
      email: 'ci-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // Police Station
  {
    id: 'unit-005',
    name: 'Hanamkonda Police Station',
    code: 'WGLHNK',
    type: 'POLICE_STATION',
    organizationId: 'org-001',
    jurisdictionArea: 'Hanamkonda Area',
    inchargeOfficerId: 'officer-005', // Inspector (SHO)
    parentUnitId: 'unit-004', // Reports to Circle Office
    address: 'Police Station Building, Hanamkonda',
    contactInformation: {
      phone: '0870-2429305',
      email: 'ps-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // Police Outpost
  {
    id: 'unit-006',
    name: 'Bus Stand Outpost, Hanamkonda',
    code: 'WGLHNKOP1',
    type: 'OUTPOST',
    organizationId: 'org-001',
    jurisdictionArea: 'Hanamkonda Bus Stand Area',
    inchargeOfficerId: 'officer-010', // Sub-Inspector
    parentUnitId: 'unit-005', // Reports to Hanamkonda PS
    address: 'Bus Stand, Hanamkonda',
    contactInformation: {
      phone: '0870-2429306',
      email: 'op-bs-hnk-wgl@tgpolice.gov.in',
    },
  },
  
  // Another Police Station
  {
    id: 'unit-007',
    name: 'Kazipet Police Station',
    code: 'WGLKZT',
    type: 'POLICE_STATION',
    organizationId: 'org-001',
    jurisdictionArea: 'Kazipet Area',
    inchargeOfficerId: 'officer-006', // Inspector (SHO)
    parentUnitId: 'unit-004', // Reports to same Circle Office
    address: 'Police Station Building, Kazipet',
    contactInformation: {
      phone: '0870-2429307',
      email: 'ps-kzt-wgl@tgpolice.gov.in',
    },
  },
];

// Departments within Units
const sampleUnitDepartments = [
  // Departments in SP Office
  {
    id: 'dept-instance-001',
    name: 'Administration',
    unitId: 'unit-001', // SP Office
    inchargeOfficerId: 'officer-007', // Another officer
    description: 'Administrative department handling office matters',
  },
  {
    id: 'dept-instance-002',
    name: 'Cyber Cell',
    unitId: 'unit-001', // SP Office
    inchargeOfficerId: 'officer-008', // Another officer
    description: 'Cyber crime investigation unit',
  },
  
  // Departments in Hanamkonda Police Station
  {
    id: 'dept-instance-003',
    name: 'Malkhana',
    unitId: 'unit-005', // Hanamkonda PS
    inchargeOfficerId: 'officer-011', // Another Sub-Inspector
    description: 'Evidence storage and management',
  },
  {
    id: 'dept-instance-004',
    name: 'Complaints',
    unitId: 'unit-005', // Hanamkonda PS
    inchargeOfficerId: 'officer-012', // Another officer
    description: 'Complaint registration and processing',
  },
  {
    id: 'dept-instance-005',
    name: 'Records',
    unitId: 'unit-005', // Hanamkonda PS
    inchargeOfficerId: 'officer-013', // Another officer
    description: 'Records management and documentation',
  },
];

// Sample officers in hierarchy (similar to before but with unit assignments)
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
    rankId: 'rank-009', // Inspector (Station House Officer)
    organizationId: 'org-001',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: null, // Overall incharge, no specific department
    reportingOfficerId: 'officer-004', // Reports to Circle Inspector
    jurisdictionArea: 'Hanamkonda Station Limits',
  },
  // More officers with specific department assignments
  {
    id: 'officer-011',
    name: 'Suresh Kumar',
    badgeNumber: 'SI1122',
    rankId: 'rank-010', // Sub-Inspector
    organizationId: 'org-001',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: 'dept-instance-003', // Malkhana
    reportingOfficerId: 'officer-005', // Reports to SHO
    jurisdictionArea: 'Hanamkonda Station Limits',
  },
  {
    id: 'officer-012',
    name: 'Lakshmi Narayana',
    badgeNumber: 'SI3344',
    rankId: 'rank-010', // Sub-Inspector
    organizationId: 'org-001',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: 'dept-instance-004', // Complaints
    reportingOfficerId: 'officer-005', // Reports to SHO
    jurisdictionArea: 'Hanamkonda Station Limits',
  },
];

// Functional assignments for specialized roles
const sampleFunctionalAssignments = [
  {
    id: 'func-assign-001',
    officerId: 'officer-011', // Sub-Inspector in Hanamkonda PS
    function: 'MALKHANA',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: 'dept-instance-003', // Malkhana Department
    startDate: new Date('2023-01-01'),
    isActive: true,
  },
  {
    id: 'func-assign-002',
    officerId: 'officer-012', // Another Sub-Inspector in Hanamkonda PS
    function: 'COMPLAINTS',
    unitId: 'unit-005', // Hanamkonda Police Station
    departmentId: 'dept-instance-004', // Complaints Department
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
    type: 'SP_OFFICE', // Using the same type for consistency, we can consider adding CP_OFFICE
    organizationId: 'org-002',
    jurisdictionArea: 'Hyderabad City',
    inchargeOfficerId: 'officer-101', // CP
    parentUnitId: null,
    address: 'CP Office, Basheerbagh, Hyderabad',
    contactInformation: {
      phone: '040-23232323',
      email: 'cp-hyd@tgpolice.gov.in',
    },
  },
  
  // Jt. CP Office
  {
    id: 'unit-102',
    name: 'Joint CP Office, West Zone, Hyderabad',
    code: 'HYDJCP1',
    type: 'ADDL_SP_OFFICE', // Using similar type for consistency
    organizationId: 'org-002',
    jurisdictionArea: 'West Zone, Hyderabad',
    inchargeOfficerId: 'officer-102', // Jt. CP
    parentUnitId: 'unit-101', // Reports to CP Office
    address: 'West Zone Office, Hyderabad',
    contactInformation: {
      phone: '040-23232324',
      email: 'jcp-west-hyd@tgpolice.gov.in',
    },
  },
  
  // DCP Office
  {
    id: 'unit-103',
    name: 'DCP Office, Banjara Hills, Hyderabad',
    code: 'HYDDCP1',
    type: 'DY_SP_OFFICE', // Similar rank equivalent
    organizationId: 'org-002',
    jurisdictionArea: 'Banjara Hills Division, Hyderabad',
    inchargeOfficerId: 'officer-103', // DCP
    parentUnitId: 'unit-102', // Reports to Jt. CP Office
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
    type: 'CIRCLE_OFFICE', // Similar rank equivalent
    organizationId: 'org-002',
    jurisdictionArea: 'Banjara Hills Sub-Division, Hyderabad',
    inchargeOfficerId: 'officer-104', // ACP
    parentUnitId: 'unit-103', // Reports to DCP Office
    address: 'ACP Office, Banjara Hills, Hyderabad',
    contactInformation: {
      phone: '040-23232326',
      email: 'acp-bh-hyd@tgpolice.gov.in',
    },
  },
  
  // Police Station
  {
    id: 'unit-105',
    name: 'Banjara Hills Police Station',
    code: 'HYDBH',
    type: 'POLICE_STATION',
    organizationId: 'org-002',
    jurisdictionArea: 'Banjara Hills Area, Hyderabad',
    inchargeOfficerId: 'officer-105', // Inspector (SHO)
    parentUnitId: 'unit-104', // Reports to ACP Office
    address: 'Police Station, Road No. 12, Banjara Hills, Hyderabad',
    contactInformation: {
      phone: '040-23232327',
      email: 'ps-bh-hyd@tgpolice.gov.in',
    },
  },
];

// Sample officers in hierarchy (adapted for units and departments)
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
    id: 'officer-102',
    name: 'Sunita Rao',
    badgeNumber: 'JCP1234',
    rankId: 'rank-015', // Joint CP
    organizationId: 'org-002',
    unitId: 'unit-102', // Jt. CP Office
    departmentId: null,
    reportingOfficerId: 'officer-101', // Reports to CP
    jurisdictionArea: 'West Zone, Hyderabad',
  },
  {
    id: 'officer-103',
    name: 'Mohammed Khan',
    badgeNumber: 'DCP5678',
    rankId: 'rank-017', // DCP
    organizationId: 'org-002',
    unitId: 'unit-103', // DCP Office
    departmentId: null,
    reportingOfficerId: 'officer-102', // Reports to Joint CP
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
    rankId: 'rank-009', // Inspector (Station House Officer)
    organizationId: 'org-002',
    unitId: 'unit-105', // Banjara Hills Police Station
    departmentId: null,
    reportingOfficerId: 'officer-104', // Reports to ACP
    jurisdictionArea: 'Banjara Hills Station Limits, Hyderabad',
  },
  // More officers...
];
``` 