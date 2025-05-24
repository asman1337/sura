import { RecordData, RecordsStats, RecordType, StolenPropertyRecord } from './types';

// Global API instance for reuse
let globalApiInstance: any = null;

export const setGlobalApiInstance = (apiInstance: any) => {
  globalApiInstance = apiInstance;
};

export class RecordsService {
  private api: any;
  private isInitialized: boolean = false;
  private baseUrl = '';  // Removed '/api' prefix

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
  async getAllRecords(): Promise<RecordData[]> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      const response = await this.api.get(`${this.baseUrl}/records`);
      return response.data.records || [];
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  // Fetch records by type
  async getRecordsByType(type: RecordType): Promise<RecordData[]> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      let endpoint = '';
      
      switch (type) {
        case 'ud_case':
          endpoint = `${this.baseUrl}/ud-cases`;
          break;
        case 'stolen_property':
          endpoint = `${this.baseUrl}/stolen-property`;
          break;
        default:
          endpoint = `${this.baseUrl}/records?type=${type}`;
      }
      
      const response = await this.api.get(endpoint);
      return response.data.records || [];
    } catch (error) {
      console.error(`Error fetching ${type} records:`, error);
      throw error;
    }
  }

  // Get statistics
  async getStats(): Promise<RecordsStats> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      const response = await this.api.get(`${this.baseUrl}/records/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching records stats:', error);
      throw error;
    }
  }

  // Create a record
  async createRecord(record: Partial<RecordData>): Promise<RecordData> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      let endpoint = '';
      
      switch (record.type) {
        case 'ud_case':
          endpoint = `${this.baseUrl}/ud-cases`;
          break;
        case 'stolen_property':
          endpoint = `${this.baseUrl}/stolen-property`;
          break;
        default:
          throw new Error(`Unsupported record type: ${record.type}`);
      }
      
      const response = await this.api.post(endpoint, record);
      return response.data;
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  }

  // Get record by ID
  async getRecordById(id: string, type?: RecordType): Promise<RecordData> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      let endpoint = '';
      
      if (type) {
        switch (type) {
          case 'ud_case':
            endpoint = `${this.baseUrl}/ud-cases/${id}`;
            break;
          case 'stolen_property':
            endpoint = `${this.baseUrl}/stolen-property/${id}`;
            break;
          default:
            endpoint = `${this.baseUrl}/records/${id}`;
        }
      } else {
        endpoint = `${this.baseUrl}/records/${id}`;
      }
      
      const response = await this.api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching record ${id}:`, error);
      throw error;
    }
  }

  // Update a record
  async updateRecord(recordId: string, data: Partial<RecordData>): Promise<RecordData> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      let endpoint = '';
      
      switch (data.type) {
        case 'ud_case':
          endpoint = `${this.baseUrl}/ud-cases/${recordId}`;
          break;
        case 'stolen_property':
          endpoint = `${this.baseUrl}/stolen-property/${recordId}`;
          break;
        default:
          endpoint = `${this.baseUrl}/records/${recordId}`;
      }
      
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating record ${recordId}:`, error);
      throw error;
    }
  }

  // Delete a record
  async deleteRecord(recordId: string, type?: RecordType): Promise<boolean> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      let endpoint = '';
      
      if (type) {
        switch (type) {
          case 'ud_case':
            endpoint = `${this.baseUrl}/ud-cases/${recordId}`;
            break;
          case 'stolen_property':
            endpoint = `${this.baseUrl}/stolen-property/${recordId}`;
            break;
          default:
            endpoint = `${this.baseUrl}/records/${recordId}`;
        }
      } else {
        endpoint = `${this.baseUrl}/records/${recordId}`;
      }
      
      await this.api.delete(endpoint);
      return true;
    } catch (error) {
      console.error(`Error deleting record ${recordId}:`, error);
      throw error;
    }
  }

  // Mark stolen property as recovered
  async markPropertyAsRecovered(propertyId: string, recoveryDetails: {
    recoveryDate: string;
    remarks?: string;
    notes?: string;
  }): Promise<StolenPropertyRecord> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      const endpoint = `${this.baseUrl}/stolen-property/${propertyId}/recover`;
      const response = await this.api.patch(endpoint, recoveryDetails);
      return response.data;
    } catch (error) {
      console.error(`Error marking property ${propertyId} as recovered:`, error);
      throw error;
    }
  }

  // Mark stolen property as sold
  async markPropertyAsSold(propertyId: string, saleDetails: {
    soldPrice: number;
    dateOfRemittance: string;
    disposalMethod: string;
    remarks?: string;
    notes?: string;
  }): Promise<StolenPropertyRecord> {
    if (!this.isReady) {
      throw new Error('API not initialized');
    }

    try {
      const endpoint = `${this.baseUrl}/stolen-property/${propertyId}/sell`;
      const response = await this.api.patch(endpoint, saleDetails);
      return response.data;
    } catch (error) {
      console.error(`Error marking property ${propertyId} as sold:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const getRecordsService = (): RecordsService => {
  return new RecordsService();
};

export default { initialize: (api: any) => new RecordsService(api) }; 