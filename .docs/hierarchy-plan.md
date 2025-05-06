# Police Hierarchy and Access Control Implementation Plan

## 1. Database Schema Design (Revised)

### Core Entities

```typescript
// Organization
interface Organization {
  id: string;
  type: 'DISTRICT_POLICE' | 'COMMISSIONERATE';
  name: string;
  state: string;
  jurisdictionArea: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Unit (Represents physical/organizational entities like SP Office, Police Stations, etc.)
interface Unit {
  id: string;
  name: string;
  code: string;
  type: 'SP_OFFICE' | 'ADDL_SP_OFFICE' | 'DY_SP_OFFICE' | 'CIRCLE_OFFICE' | 
        'POLICE_STATION' | 'OUTPOST' | 'CP_OFFICE' | 'DCP_OFFICE' | 'ACP_OFFICE' | 'OTHER';
  organizationId: string;
  jurisdictionArea: string;
  primaryInchargeId: string | null; // Primary officer in charge (for backward compatibility)
  parentUnitId: string | null; // For hierarchical relationships (supports n-level deep hierarchy)
  address: string | null;
  contactInformation: {
    phone: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Unit-Officer Many-to-Many Relationship
interface UnitInchargeOfficer {
  id: string;
  unitId: string;
  officerId: string;
  roleType: 'PRIMARY' | 'SECONDARY' | 'ACTING' | 'SPECIALIZED';
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Department (Functional divisions within units)
interface Department {
  id: string;
  name: string;
  description: string;
  unitId: string; // Department belongs to a specific unit
  primaryHeadId: string | null; // Primary manager of the department (for backward compatibility)
  createdAt: Date;
  updatedAt: Date;
}

// Department-Officer Many-to-Many Relationship
interface DepartmentManagerOfficer {
  id: string;
  departmentId: string;
  officerId: string;
  roleType: 'HEAD' | 'DEPUTY' | 'COORDINATOR' | 'SPECIALIST';
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Officer Rank
interface OfficerRank {
  id: string;
  name: string;  // DGP, IG, SP, CP, etc.
  level: number; // Numeric level for hierarchy (e.g., DGP=1, IG=2)
  systemType: 'BOTH' | 'DISTRICT' | 'COMMISSIONERATE';
  abbreviation: string; // e.g., "SP" for "Superintendent of Police"
  createdAt: Date;
  updatedAt: Date;
}

// Officer
interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  rankId: string;
  organizationId: string;
  primaryUnitId: string; // Primary unit assignment (e.g., SP Office, Police Station)
  primaryDepartmentId: string | null; // Optional primary department assignment
  reportingOfficerId: string | null;
  jurisdictionArea: string | null;
  contactInformation: {
    phone: string;
    email: string;
    address: string;
  };
  // User authentication details
  userId: string; // Link to auth user
  createdAt: Date;
  updatedAt: Date;
}
```

### Access Control Entities

```typescript
// Role
interface Role {
  id: string;
  name: string;
  description: string;
  systemDefined: boolean;
  organizationId: string | null; // null for system roles
  createdAt: Date;
  updatedAt: Date;
}

// Permission
interface Permission {
  id: string;
  resource: string; // e.g., 'MALKHANA', 'COMPLAINTS'
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'APPROVE';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// RolePermission (Many-to-Many)
interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  constraints: any; // JSON for conditional access
  createdAt: Date;
  updatedAt: Date;
}

// OfficerRole (Many-to-Many with context)
interface OfficerRole {
  id: string;
  officerId: string;
  roleId: string;
  scope: 'GLOBAL' | 'ORGANIZATION' | 'UNIT' | 'DEPARTMENT';
  scopeId: string; // ID of the scope entity
  createdAt: Date;
  updatedAt: Date;
}
```

### Functional Role Entities

```typescript
// Function-specific roles (e.g., Malkhana In-charge)
interface FunctionalAssignment {
  id: string;
  officerId: string;
  function: 'MALKHANA' | 'COMPLAINTS' | 'VEHICLES' | 'DUTY_ROSTER' | 'GRIEVANCE';
  unitId: string; // Assigned to specific unit (usually a police station)
  departmentId: string | null; // Optional specific department assignment
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 2. Implementation Steps

### Phase 1: Core Structure Implementation

1. **Create Database Migrations**:
   - Generate TypeORM entities and migrations for all core schemas
   - Set up multi-tenant architecture with schema isolation
   - Configure many-to-many relationships for units and officers, departments and officers

2. **Implement Organizations Module**:
   - Create CRUD operations for organizations
   - Implement tenant creation on organization creation
   - Set up organization type-specific configuration

3. **Implement Units Module**:
   - Create unit management with different types (SP Office, Police Stations, etc.)
   - Implement hierarchical unit structure supporting n-level deep hierarchy
   - Develop unit-level configuration
   - Implement multiple in-charge officers assignment system

4. **Implement Officer Ranks**:
   - Create seed data for standard ranks in both systems
   - Develop rank management interface
   - Implement rank-based hierarchy validation

5. **Implement Departments**:
   - Create CRUD operations for departments
   - Develop department-unit assignment
   - Set up department-specific configuration
   - Implement multiple managers assignment system

### Phase 2: Officer and Unit Management

1. **Implement Officers Module**:
   - Develop officer profile management
   - Create reporting structure visualization
   - Implement officer-unit/department assignment

2. **Implement Unit Hierarchy**:
   - Create organizational chart for unit hierarchy
   - Develop jurisdictional mapping
   - Implement dual reporting paths for police stations
   - Support IC PS (In-Charge PS) direct reporting to SDPO/Dy. SP
   - Support OC PS (Officer in Charge PS) reporting through Circle Inspector
   - Implement officer-unit assignments

3. **Implement Unit Departments**:
   - Create unit-department linkages
   - Develop in-charge assignment system
   - Implement department-specific dashboards

### Phase 3: Access Control Implementation

1. **Implement Authentication**:
   - Develop JWT-based auth system
   - Create user-officer linkage
   - Implement secure password management

2. **Implement Role Management**:
   - Create predefined system roles
   - Develop custom role creation
   - Implement role assignment workflows

3. **Implement Permission System**:
   - Develop resource-action permissions
   - Create permission assignment to roles
   - Implement conditional permission logic

4. **Create Guards and Decorators**:
   - Develop NestJS guards for permission checking
   - Create decorators for role-based access control
   - Implement hierarchical data filtering

### Phase 4: Functional Role Implementation

1. **Implement Functional Assignments**:
   - Create specialized role assignment system
   - Develop function-specific dashboards
   - Implement approval workflows based on functional roles

2. **Integrate with Modules**:
   - Connect Malkhana module with assigned officers
   - Link complaint handling to assigned officers
   - Integrate vehicle management with assigned officers

## 3. Frontend Implementation

1. **Organization Setup Wizard**:
   - Create step-by-step setup for new organizations
   - Develop unit structure creation wizard
   - Implement hierarchy management interface

2. **Unit Management Dashboard**:
   - Create unit directory with filtering
   - Develop unit hierarchy visualization
   - Implement unit configuration management
   - Support assignment of multiple in-charge officers with different roles

3. **Officer Management Dashboard**:
   - Create officer directory with filtering
   - Develop reporting structure visualization
   - Implement officer profile management
   - Support visualization of officer's multiple roles across units/departments

4. **Department Management Dashboard**:
   - Create department directory with filtering
   - Implement department configuration management
   - Support assignment of multiple managers with different roles

5. **Access Control Interface**:
   - Create role management screens
   - Develop permission assignment interface
   - Implement user-role-permission visualization

## 4. API Structure

```
/api/v1/organizations
/api/v1/organizations/:id/units
/api/v1/organizations/:id/officers

/api/v1/units
/api/v1/units/:id/departments
/api/v1/units/:id/officers
/api/v1/units/:id/incharge-officers // For unit officers with management roles
/api/v1/units/:id/children  // For subordinate units
/api/v1/units/:id/reporting-path // To determine reporting structure

/api/v1/departments
/api/v1/departments/:id/officers
/api/v1/departments/:id/managers // For department officers with management roles

/api/v1/officers
/api/v1/officers/:id/subordinates
/api/v1/officers/:id/managed-units // Units where officer is in-charge
/api/v1/officers/:id/managed-departments // Departments where officer is manager
/api/v1/officers/:id/roles
/api/v1/officers/:id/permissions

/api/v1/roles
/api/v1/permissions

/api/v1/functional-assignments
/api/v1/functional-assignments/units/:unitId

/api/v1/auth/login
/api/v1/auth/profile
```

## 5. Security Considerations

1. **Data Isolation**:
   - Implement tenant-based data isolation
   - Create middleware for tenant context
   - Develop hierarchical data access rules

2. **Audit Logging**:
   - Log all hierarchy and permission changes
   - Track sensitive data access
   - Implement audit report generation

3. **Permission Validation**:
   - Create permission validation at controller level
   - Implement data filtering based on jurisdiction
   - Develop conditional access rules

## 6. Mobile App Considerations

1. **Offline Hierarchy Access**:
   - Cache organizational structure for offline use
   - Implement sync mechanism for hierarchy updates
   - Develop offline permission validation

2. **Role-based UI Adaptation**:
   - Customize mobile UI based on officer role
   - Show/hide features based on permissions
   - Implement function-specific workflows 

## Special Considerations for Police Station Reporting Paths

In the implementation, we need to account for the two different reporting paths that exist in the police hierarchy:

1. **Path 1: Direct Reporting (IC PS)**
   - These are In-Charge Police Stations that report directly to the Dy.SP/SDPO
   - No Circle Inspector in between
   - Unit entity will have `isDirectReporting` flag set to `true`
   - Direct parent-child relationship between Dy.SP unit and IC PS unit

2. **Path 2: Circle-Level Reporting (OC PS)**
   - These are Officer in Charge Police Stations that report to Circle Inspector
   - Circle Inspector then reports to Dy.SP/SDPO
   - Unit entity will have `isDirectReporting` flag set to `false`
   - Parent-child relationship chain: Dy.SP unit -> Circle Office unit -> OC PS unit

Both structures need to be properly represented in the database schema and visualized in the user interface. 