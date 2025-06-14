# Arrest Records Module

This module implements the arrest records functionality for the SURA system, allowing police departments to manage arrest records with Part 1 and Part 2 classifications.

## Features

### Serial Number Generation
- **Format**: `YYYYMMNNN` (e.g., `202501001`)
- **Year**: Current year (YYYY)
- **Month**: Current month (MM)
- **Count**: Sequential number for the month (NNN)
- **Uniqueness**: Each serial number is unique across the system

### Record Types
- **Part 1**: Full arrest record with required criminal identification fields
- **Part 2**: Simplified arrest record with optional identification fields

### Core Fields

#### Accused Person Details
- Name (required)
- Address (required)
- Phone number (optional)
- P.C.N (Personal Complaint Number) (optional)

#### Arrest Details
- Date of arrest (required)
- Arresting officer name (required)
- Date forwarded to court (optional)
- Arrest circumstances (optional)
- Arrest location (optional)

#### Court Details
- Court name (optional)
- Court address (optional)
- Judge name or court number (optional)
- Case reference (optional)
- Trial result (optional)

#### Criminal Identification (mainly for Part 1)
- Age
- Identifying marks
- Height (in cm)
- Weight (in kg)
- Eye color
- Hair color
- Complexion
- Other physical features

#### Photo Attachments
- Support for 1-4 photos (optional)
- URLs to uploaded photos stored as array

## API Endpoints

### Base URL: `/records/arrest`

#### Create Arrest Record
```http
POST /records/arrest
Content-Type: application/json

{
  "partType": "part1",
  "accusedName": "John Doe",
  "accusedAddress": "123 Main St, City",
  "accusedPhone": "1234567890",
  "accusedPCN": "PCN123",
  "dateOfArrest": "2025-06-14T10:00:00Z",
  "arrestingOfficerName": "Officer Smith",
  "dateForwardedToCourt": "2025-06-15T09:00:00Z",
  "courtName": "District Court",
  "caseReference": "CASE2025001",
  "age": 30,
  "height": 175.5,
  "weight": 70.2,
  "identifyingMarks": "Scar on left arm",
  "eyeColor": "Brown",
  "hairColor": "Black",
  "complexion": "Fair",
  "arrestLocation": "Downtown area",
  "recordDate": "2025-06-14T10:00:00Z",
  "unitId": "unit-uuid",
  "remarks": "Arrested for theft"
}
```

#### Get All Arrest Records
```http
GET /records/arrest?unitId=unit-uuid
```

#### Get Single Arrest Record
```http
GET /records/arrest/{id}
```

#### Search by Accused Name
```http
GET /records/arrest/search/by-name?name=John&unitId=unit-uuid
```

#### Search by Serial Number
```http
GET /records/arrest/search/by-serial/202501001
```

#### Get Statistics
```http
GET /records/arrest/statistics?unitId=unit-uuid
```

Response:
```json
{
  "totalRecords": 150,
  "part1Records": 90,
  "part2Records": 60,
  "monthlyRecords": 15,
  "pendingCourt": 25
}
```

#### Update Arrest Record
```http
PATCH /records/arrest/{id}
Content-Type: application/json

{
  "trialResult": "Convicted - 6 months imprisonment",
  "remarks": "Case closed"
}
```

#### Delete Arrest Record (Soft Delete)
```http
DELETE /records/arrest/{id}
```

## Database Schema

### Table: `arrest_record`

The table extends the base `records` table with arrest-specific fields:

- **Serial Number Tracking**: `serialNumber`, `serialCount`, `serialYear`, `serialMonth`
- **Record Classification**: `partType` (part1/part2)
- **Accused Details**: `accusedName`, `accusedAddress`, `accusedPhone`, `accusedPCN`
- **Arrest Information**: `dateOfArrest`, `arrestingOfficerName`, `dateForwardedToCourt`
- **Court Details**: `courtName`, `courtAddress`, `judgeNameOrCourtNumber`
- **Case Information**: `caseReference`, `trialResult`
- **Physical Description**: `age`, `height`, `weight`, `identifyingMarks`, etc.
- **Media**: `photoUrls` (array)
- **Additional**: `arrestCircumstances`, `arrestLocation`, `recordDate`

### Indexes
- Unit ID for fast filtering by police station
- Created by officer for audit trails
- Accused name for search functionality
- Date of arrest for chronological queries
- Serial year/month for efficient serial number generation
- Part type for record classification
- Status and active flag for soft deletes

## Entity Relationships

```
BaseRecord (parent)
├── ArrestRecord (child)
│   ├── Unit (many-to-one)
│   ├── CreatedBy Officer (many-to-one)
│   └── LastModifiedBy Officer (many-to-one)
```

## Migration

The migration `1740000000000-CreateArrestRecordTable.ts` includes:
1. Adding `arrest_record` to the base record type enum
2. Creating the `arrest_record_parttype_enum` enum
3. Creating the `arrest_record` table with all fields
4. Adding indexes for optimal query performance

## Usage Examples

### Creating a Part 1 Record (Full Details)
```typescript
const part1Record = await arrestRecordService.create({
  partType: 'part1',
  accusedName: 'John Doe',
  accusedAddress: '123 Main St',
  dateOfArrest: '2025-06-14T10:00:00Z',
  arrestingOfficerName: 'Officer Smith',
  age: 30,
  height: 175.5,
  weight: 70.2,
  identifyingMarks: 'Scar on left arm',
  // ... other identification fields required for Part 1
  recordDate: '2025-06-14T10:00:00Z',
  unitId: 'unit-uuid'
}, 'officer-uuid');
```

### Creating a Part 2 Record (Simplified)
```typescript
const part2Record = await arrestRecordService.create({
  partType: 'part2',
  accusedName: 'Jane Smith',
  accusedAddress: '456 Oak Ave',
  dateOfArrest: '2025-06-14T14:00:00Z',
  arrestingOfficerName: 'Officer Johnson',
  // identification fields are optional for Part 2
  recordDate: '2025-06-14T14:00:00Z',
  unitId: 'unit-uuid'
}, 'officer-uuid');
```

### Searching Records
```typescript
// Search by name
const records = await arrestRecordService.findByAccusedName('John', 'unit-uuid');

// Find by serial number
const record = await arrestRecordService.findBySerialNumber('202501001');

// Get statistics
const stats = await arrestRecordService.getStatistics('unit-uuid');
```

## Integration Notes

1. **Authentication**: The controller expects user information from JWT tokens (currently defaults to 'system' for development)
2. **Authorization**: Consider adding role-based guards for different operations
3. **File Upload**: Photo URLs assume external file upload service
4. **Validation**: All DTOs include comprehensive validation rules
5. **Soft Deletes**: Records are never permanently deleted, only marked as inactive

This module seamlessly integrates with the existing SURA records system while providing specialized functionality for arrest record management.
