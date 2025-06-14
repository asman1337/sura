import {
  RecordData,
  RecordsStats,
  RecordType,
  StolenPropertyRecord,
} from "./types";

// Global API instance for reuse
let globalApiInstance: any = null;

export const setGlobalApiInstance = (apiInstance: any) => {
  globalApiInstance = apiInstance;
};

export class RecordsService {
  private api: any;
  private isInitialized: boolean = false;
  private baseUrl = "";
  public lastResponse: { records: RecordData[]; total: number } | null = null;

  constructor(api?: any) {
    this.api = api || globalApiInstance;
    this.isInitialized = !!this.api;
  }

  get isReady(): boolean {
    return this.isInitialized;
  }

  // Initialize with API instance if not already initialized
  initialize(api: any): void {
    if (!this.isInitialized && api) {
      console.log("Initializing RecordsService with API");
      this.api = api;
      this.isInitialized = true;
    } else if (!api) {
      console.warn(
        "Attempted to initialize RecordsService with null/undefined API"
      );
    }
  }

  // Ensure API is ready and handle errors consistently
  private ensureReady(): void {
    if (!this.isReady) {
      console.error("API not initialized in RecordsService");
      throw new Error("API not initialized");
    }

    if (!this.api) {
      console.error("API instance is null/undefined in RecordsService");
      throw new Error("API instance is null");
    }
  }

  // Fetch all records
  async getAllRecords(): Promise<RecordData[]> {
    this.ensureReady();

    try {
      console.log("Fetching all records");
      const response = await this.api.get(`${this.baseUrl}/records`);
      console.log("All records response:", response);

      // Safely handle different response formats
      if (!response) {
        console.warn("API returned empty response");
        return [];
      }

      // Store response metadata for pagination
      if (response.records && response.total !== undefined) {
        this.lastResponse = {
          records: response.records,
          total: response.total,
        };
      } else if (
        response.data &&
        response.data.records &&
        response.data.total !== undefined
      ) {
        this.lastResponse = {
          records: response.data.records,
          total: response.data.total,
        };
      } else {
        this.lastResponse = null;
      }

      // Handle case where records is a property of response
      if (response.records && Array.isArray(response.records)) {
        return response.records;
      }

      // Handle case where records is a property of response.data
      if (
        response.data &&
        response.data.records &&
        Array.isArray(response.data.records)
      ) {
        return response.data.records;
      }

      // Handle case where response.data is an array directly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Handle case where response is an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // If we got here but don't recognize the format, log a warning and return empty array
      console.warn("Unrecognized API response format:", response);
      return [];
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  }
  // Fetch records by type
  async getRecordsByType(type: RecordType): Promise<RecordData[]> {
    this.ensureReady();

    try {
      let endpoint = "";
      switch (type) {
        case "ud_case":
          endpoint = `${this.baseUrl}/ud-cases`;
          break;
        case "stolen_property":
          endpoint = `${this.baseUrl}/stolen-property`;
          break;
        case "paper_dispatch":
          endpoint = `${this.baseUrl}/paper-dispatch`;
          break;
        case "arrest_record":
          endpoint = `${this.baseUrl}/arrests`;
          break;
        default:
          endpoint = `${this.baseUrl}/records?type=${type}`;
      }

      console.log(`Fetching ${type} records from ${endpoint}`);
      const response = await this.api.get(endpoint);
      console.log(`API response for ${type}:`, response);

      // Safely handle different response formats
      if (!response) {
        console.warn(`API returned empty response for ${type}`);
        return [];
      }

      // Store response metadata for pagination
      if (response.records && response.total !== undefined) {
        console.log(`Using response.records and total: ${response.total}`);
        this.lastResponse = {
          records: response.records,
          total: response.total,
        };
      } else if (
        response.data &&
        response.data.records &&
        response.data.total !== undefined
      ) {
        console.log(
          `Using response.data.records and total: ${response.data.total}`
        );
        this.lastResponse = {
          records: response.data.records,
          total: response.data.total,
        };
      } else {
        console.log(`No pagination metadata found in response`);
        this.lastResponse = null;
      }

      // Handle case where records is a property of response
      if (response.records && Array.isArray(response.records)) {
        return response.records;
      }

      // Handle case where records is a property of response.data
      if (
        response.data &&
        response.data.records &&
        Array.isArray(response.data.records)
      ) {
        return response.data.records;
      }

      // Handle case where response.data is an array directly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Handle case where response is an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // If we got here but don't recognize the format, log a warning and return empty array
      console.warn(`Unrecognized API response format for ${type}:`, response);
      return [];
    } catch (error) {
      console.error(`Error fetching ${type} records:`, error);
      throw error;
    }
  }

  // Get statistics
  async getStats(): Promise<RecordsStats> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      console.log("Fetching stats from:", `${this.baseUrl}/records/stats`);
      const response = await this.api.get(`${this.baseUrl}/records/stats`);
      console.log("Stats API raw response:", response);

      if (!response) {
        console.warn("API returned null/undefined stats response");
        return {
          totalRecords: 0,
          recordsByType: {},
          recentlyAdded: 0,
          archivedRecords: 0,
        };
      }

      // Handle different response formats
      let statsData = response;

      // If response has a data property, use that
      if (response.data) {
        console.log("Using response.data for stats:", response.data);
        statsData = response.data;
      }

      // If the response is wrapped in another layer, unwrap it
      if (statsData.data && typeof statsData.data === "object") {
        console.log("Using nested data property for stats:", statsData.data);
        statsData = statsData.data;
      }

      console.log("Final stats data being returned:", statsData);

      // Ensure we have all required properties with defaults
      const result: RecordsStats = {
        totalRecords: statsData.totalRecords || 0,
        recordsByType: statsData.recordsByType || {},
        recentlyAdded: statsData.recentlyAdded || 0,
        archivedRecords: statsData.archivedRecords || 0,
      };

      console.log("Processed stats result:", result);
      return result;
    } catch (error) {
      console.error("Error fetching records stats:", error);
      // Return default stats object on error
      return {
        totalRecords: 0,
        recordsByType: {},
        recentlyAdded: 0,
        archivedRecords: 0,
      };
    }
  }
  // Create a record
  async createRecord(record: Partial<RecordData>): Promise<RecordData> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      let endpoint = "";
      let payload = record;
      
      switch (record.type) {
        case "ud_case":
          endpoint = `${this.baseUrl}/ud-cases`;
          break;
        case "stolen_property":
          endpoint = `${this.baseUrl}/stolen-property`;
          break;
        case "paper_dispatch":
          endpoint = `${this.baseUrl}/paper-dispatch`;
          break;
        case "arrest_record":
          endpoint = `${this.baseUrl}/arrests`;
          // Filter the data to only include DTO fields
          payload = this.filterCreateArrestRecordData(record);
          break;
        default:
          throw new Error(`Unsupported record type: ${record.type}`);
      }

      const response = await this.api.post(endpoint, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  }

  // Get record by ID
  async getRecordById(id: string, type?: RecordType): Promise<RecordData> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      let endpoint = "";
      if (type) {
        switch (type) {
          case "ud_case":
            endpoint = `${this.baseUrl}/ud-cases/${id}`;
            break;
          case "stolen_property":
            endpoint = `${this.baseUrl}/stolen-property/${id}`;
            break;
          case "paper_dispatch":
            endpoint = `${this.baseUrl}/paper-dispatch/${id}`;
            break;
          case "arrest_record":
            endpoint = `${this.baseUrl}/arrests/${id}`;
            break;
          default:
            endpoint = `${this.baseUrl}/records/${id}`;
        }
      } else {
        endpoint = `${this.baseUrl}/records/${id}`;
      }

      const response = await this.api.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching record ${id}:`, error);
      throw error;
    }
  }
  // Update a record
  async updateRecord(
    recordId: string,
    data: Partial<RecordData>
  ): Promise<RecordData> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      let endpoint = "";
      let payload = data;
      
      switch (data.type) {
        case "ud_case":
          endpoint = `${this.baseUrl}/ud-cases/${recordId}`;
          break;
        case "stolen_property":
          endpoint = `${this.baseUrl}/stolen-property/${recordId}`;
          break;
        case "paper_dispatch":
          endpoint = `${this.baseUrl}/paper-dispatch/${recordId}`;
          break;
        case "arrest_record":
          endpoint = `${this.baseUrl}/arrests/${recordId}`;
          // Filter the data to only include DTO fields
          payload = this.filterUpdateArrestRecordData(data);
          break;
        default:
          endpoint = `${this.baseUrl}/records/${recordId}`;
      }

      const response = await this.api.patch(endpoint, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating record ${recordId}:`, error);
      throw error;
    }
  }

  // Delete a record
  async deleteRecord(recordId: string, type?: RecordType): Promise<boolean> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      let endpoint = "";
      if (type) {
        switch (type) {
          case "ud_case":
            endpoint = `${this.baseUrl}/ud-cases/${recordId}`;
            break;
          case "stolen_property":
            endpoint = `${this.baseUrl}/stolen-property/${recordId}`;
            break;
          case "paper_dispatch":
            endpoint = `${this.baseUrl}/paper-dispatch/${recordId}`;
            break;
          case "arrest_record":
            endpoint = `${this.baseUrl}/arrests/${recordId}`;
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
  async markPropertyAsRecovered(
    propertyId: string,
    recoveryDetails: {
      recoveryDate: string;
      remarks?: string;
      notes?: string;
    }
  ): Promise<StolenPropertyRecord> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      const endpoint = `${this.baseUrl}/stolen-property/${propertyId}/recover`;
      const response = await this.api.patch(endpoint, recoveryDetails);
      return response.data;
    } catch (error) {
      console.error(
        `Error marking property ${propertyId} as recovered:`,
        error
      );
      throw error;
    }
  }
  // Mark stolen property as sold
  async markPropertyAsSold(
    propertyId: string,
    saleDetails: {
      soldPrice: number;
      dateOfRemittance: string;
      disposalMethod: string;
      remarks?: string;
      notes?: string;
    }
  ): Promise<StolenPropertyRecord> {
    if (!this.isReady) {
      throw new Error("API not initialized");
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

  // Paper Dispatch specific methods
  async getPaperDispatchStats(unitId?: string): Promise<any> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      const endpoint = `${this.baseUrl}/paper-dispatch/stats${
        unitId ? `?unitId=${unitId}` : ""
      }`;
      const response = await this.api.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching paper dispatch stats:", error);
      throw error;
    }
  }

  async transitionOverduePaperDispatchRecords(): Promise<{
    count: number;
    message: string;
  }> {
    if (!this.isReady) {
      throw new Error("API not initialized");
    }

    try {
      const endpoint = `${this.baseUrl}/paper-dispatch/transition-overdue`;
      const response = await this.api.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error(
        "Error transitioning overdue paper dispatch records:",
        error
      );
      throw error;
    }
  }

  // Arrest Records Service Methods
  async getArrestRecordStatistics(unitId?: string): Promise<any> {
    this.ensureReady();

    try {
      const params = unitId ? `?unitId=${unitId}` : "";
      const endpoint = `${this.baseUrl}/arrest/statistics${params}`;
      const response = await this.api.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching arrest record statistics:", error);
      throw error;
    }
  }

  async searchArrestRecordsByName(
    name: string,
    unitId?: string
  ): Promise<any[]> {
    this.ensureReady();

    try {
      const params = new URLSearchParams();
      params.append("name", name);
      if (unitId) params.append("unitId", unitId);

      const endpoint = `${
        this.baseUrl
      }/arrest/search/by-name?${params.toString()}`;
      const response = await this.api.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error searching arrest records by name:", error);
      throw error;
    }
  }

  async findArrestRecordBySerial(serialNumber: string): Promise<any> {
    this.ensureReady();

    try {
      const endpoint = `${this.baseUrl}/arrest/search/by-serial/${serialNumber}`;
      const response = await this.api.get(endpoint);
      return response.data || response;
    } catch (error) {
      console.error("Error finding arrest record by serial:", error);
      throw error;
    }
  }  // Helper function to filter arrest record data for create DTO
  private filterCreateArrestRecordData(record: any): any {
    // Only include fields that are expected by CreateArrestRecordDto
    const filtered: any = {
      partType: record.partType,
      accusedName: record.accusedName,
      accusedAddress: record.accusedAddress,
      accusedPhone: record.accusedPhone,
      accusedPCN: record.accusedPCN,
      dateOfArrest: record.dateOfArrest,
      arrestingOfficerName: record.arrestingOfficerName,
      dateForwardedToCourt: record.dateForwardedToCourt,
      courtName: record.courtName,
      courtAddress: record.courtAddress,
      judgeNameOrCourtNumber: record.judgeNameOrCourtNumber,
      caseReference: record.caseReference,
      trialResult: record.trialResult,
      age: record.age,
      identifyingMarks: record.identifyingMarks,
      height: record.height,
      weight: record.weight,
      eyeColor: record.eyeColor,
      hairColor: record.hairColor,
      complexion: record.complexion,
      otherPhysicalFeatures: record.otherPhysicalFeatures,
      photoUrls: record.photoUrls,
      arrestCircumstances: record.arrestCircumstances,
      arrestLocation: record.arrestLocation,
      recordDate: record.recordDate,
      isIdentificationRequired: record.isIdentificationRequired,
      remarks: record.remarks,
      notes: record.notes,
    };

    // unitId is required by the DTO
    if (!record.unitId || record.unitId.trim() === '') {
      throw new Error('Unit ID is required. Please ensure you are logged in and have a valid unit assigned.');
    }
    filtered.unitId = record.unitId;

    return filtered;
  }

  // Helper function to filter arrest record data for update DTO
  private filterUpdateArrestRecordData(record: any): any {
    // UpdateArrestRecordDto extends PartialType(CreateArrestRecordDto)
    // so it accepts the same fields but all are optional
    const filtered = this.filterCreateArrestRecordData(record);
    
    // Remove undefined values to avoid sending them
    Object.keys(filtered).forEach(key => {
      if (filtered[key] === undefined) {
        delete filtered[key];
      }
    });
    
    return filtered;
  }
}

// Export a singleton instance
export const getRecordsService = (): RecordsService => {
  return new RecordsService();
};

export default { initialize: (api: any) => new RecordsService(api) };
