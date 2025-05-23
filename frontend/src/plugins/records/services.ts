import { v4 as uuidv4 } from 'uuid';
import { Record, RecordsStats, RecordType, UDCaseRecord, StolenPropertyRecord } from './types';

// Global API instance for reuse
let globalApiInstance: any = null;

export const setGlobalApiInstance = (apiInstance: any) => {
  globalApiInstance = apiInstance;
};

export class RecordsService {
  private api: any;
  private isInitialized: boolean = false;

  constructor(api?: any) {
    this.api = api || globalApiInstance;
    this.isInitialized = !!this.api;
  }

  get isReady(): boolean {
    return this.isInitialized;
  }

  // Initialize with API instance if not already initialized
  initialize(api: any): void {
    if (!this.isInitialized) {
      this.api = api;
      this.isInitialized = true;
    }
  }

  // Fetch all records
  async getAllRecords(): Promise<Record[]> {
    // In a real app, this would be an API call
    // For now, return mock data
    await this.simulateNetworkDelay();
    return this.getMockRecords();
  }

  // Fetch records by type
  async getRecordsByType(type: RecordType): Promise<Record[]> {
    await this.simulateNetworkDelay();
    const allRecords = this.getMockRecords();
    return allRecords.filter(record => record.type === type);
  }

  // Get statistics
  async getStats(): Promise<RecordsStats> {
    await this.simulateNetworkDelay();
    
    const allRecords = this.getMockRecords();
    const recordsByType: { [key: string]: number } = {};
    
    // Count records by type
    allRecords.forEach(record => {
      if (recordsByType[record.type]) {
        recordsByType[record.type]++;
      } else {
        recordsByType[record.type] = 1;
      }
    });
    
    return {
      totalRecords: allRecords.length,
      recordsByType,
      recentlyAdded: 5, // Mock data
      archivedRecords: 2 // Mock data
    };
  }

  // Create a record
  async createRecord(record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>): Promise<Record> {
    await this.simulateNetworkDelay();
    
    const newRecord = {
      ...record,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Record;
    
    return newRecord;
  }

  // Update a record
  async updateRecord(recordId: string, data: Partial<Record>): Promise<Record> {
    await this.simulateNetworkDelay();
    
    const allRecords = this.getMockRecords();
    const recordIndex = allRecords.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error(`Record with ID ${recordId} not found`);
    }
    
    const updatedRecord = {
      ...allRecords[recordIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return updatedRecord as Record;
  }

  // Delete a record
  async deleteRecord(recordId: string): Promise<boolean> {
    await this.simulateNetworkDelay();
    return true;
  }

  // Helper method for simulating API delay
  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate mock records for testing
  private getMockRecords(): Record[] {
    const records: Record[] = [];
    
    // UD Case mock records
    const udCaseRecords: UDCaseRecord[] = [
      {
        id: '1',
        type: 'ud_case',
        caseNumber: 'UD-2023-001',
        dateOfOccurrence: '2023-01-15T10:30:00Z',
        description: 'Unidentified body found near river',
        location: 'Ganges River, North Bank',
        assignedOfficer: 'Inspector Sharma',
        createdAt: '2023-01-15T14:20:00Z',
        updatedAt: '2023-01-15T18:45:00Z',
        createdBy: 'admin',
        status: 'active',
        remarks: 'Autopsy pending'
      },
      {
        id: '2',
        type: 'ud_case',
        caseNumber: 'UD-2023-002',
        dateOfOccurrence: '2023-02-20T08:15:00Z',
        description: 'Abandoned vehicle found',
        location: 'Highway NH-8, Milestone 45',
        assignedOfficer: 'SI Patel',
        createdAt: '2023-02-20T10:30:00Z',
        updatedAt: '2023-02-21T09:15:00Z',
        createdBy: 'admin',
        status: 'active'
      }
    ];
    
    // Stolen property mock records
    const stolenPropertyRecords: StolenPropertyRecord[] = [
      {
        id: '3',
        type: 'stolen_property',
        propertyId: 'SP-2023-001',
        propertyType: 'Vehicle',
        description: 'Honda City, White, MH-01-AB-1234',
        estimatedValue: 800000,
        dateOfTheft: '2023-03-10T22:15:00Z',
        location: 'Sector 18 Parking Lot',
        ownerName: 'Raj Kumar',
        ownerContact: '9876543210',
        createdAt: '2023-03-11T09:20:00Z',
        updatedAt: '2023-03-11T09:20:00Z',
        createdBy: 'admin',
        status: 'active',
        linkedCaseNumber: 'FIR-2023-056'
      },
      {
        id: '4',
        type: 'stolen_property',
        propertyId: 'SP-2023-002',
        propertyType: 'Electronics',
        description: 'iPhone 14 Pro, Black, IMEI: 123456789012345',
        estimatedValue: 120000,
        dateOfTheft: '2023-03-15T14:30:00Z',
        location: 'Metro Station',
        ownerName: 'Priya Singh',
        ownerContact: '9876543211',
        createdAt: '2023-03-15T18:45:00Z',
        updatedAt: '2023-03-16T10:20:00Z',
        createdBy: 'user1',
        status: 'active',
        linkedCaseNumber: 'FIR-2023-058'
      },
      {
        id: '5',
        type: 'stolen_property',
        propertyId: 'SP-2023-003',
        propertyType: 'Jewelry',
        description: 'Gold necklace, 20 grams with pendant',
        estimatedValue: 150000,
        dateOfTheft: '2023-03-20T19:00:00Z',
        location: 'Residential burglary, Sector 10',
        ownerName: 'Meena Gupta',
        ownerContact: '9876543212',
        createdAt: '2023-03-21T10:15:00Z',
        updatedAt: '2023-03-21T10:15:00Z',
        createdBy: 'admin',
        status: 'active',
        linkedCaseNumber: 'FIR-2023-062'
      }
    ];
    
    return [...udCaseRecords, ...stolenPropertyRecords];
  }
}

// Export a singleton instance
export const getRecordsService = (): RecordsService => {
  return new RecordsService();
};

export default { initialize: (api: any) => new RecordsService(api) }; 