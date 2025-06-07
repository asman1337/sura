import { useState, useEffect, useCallback } from 'react';
import { useRecordsApi } from './index';
import { RecordData, RecordsStats, RecordType, CreateRecord } from '../types';

interface UseRecordsOptions {
  skipInitialFetch?: boolean; // Skip fetching records on initialization
  skipStatsFetch?: boolean;   // Skip fetching stats on initialization
}

/**
 * Hook for working with records data
 */
export const useRecords = (recordType?: RecordType, options: UseRecordsOptions = {}) => {
  const recordsApi = useRecordsApi();
  const [records, setRecords] = useState<RecordData[]>([]);
  const [stats, setStats] = useState<RecordsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { skipInitialFetch = false, skipStatsFetch = false } = options;

  // Load records on component mount
  useEffect(() => {
    const loadRecords = async () => {
      if (!recordsApi.isReady || skipInitialFetch) return;
      
      try {
        setLoading(true);
        
        let result: RecordData[];
        if (recordType) {
          result = await recordsApi.getRecordsByType(recordType);
        } else {
          result = await recordsApi.getAllRecords();
        }
        
        // An empty array of records is a valid response, not an error
        setRecords(result);
        setError(null);
      } catch (err) {
        setError('Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecords();
  }, [recordsApi.isReady, recordType, skipInitialFetch]);

  // Load stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      if (!recordsApi.isReady || skipStatsFetch) return;
      
      try {
        const result = await recordsApi.getStats();
        setStats(result);
      } catch (err) {
        setError('Failed to load record stats');
      }
    };

    loadStats();
  }, [recordsApi.isReady, skipStatsFetch]);

  // Function to refresh data
  const refreshData = useCallback(async () => {
    if (!recordsApi.isReady) return;
    
    try {
      setLoading(true);
      
      let recordsResult;
      if (recordType) {
        recordsResult = await recordsApi.getRecordsByType(recordType);
      } else {
        recordsResult = await recordsApi.getAllRecords();
      }

      // An empty array of records is a valid response, not an error
      setRecords(recordsResult);
      
      // Refresh stats
      const statsResult = await recordsApi.getStats();
      setStats(statsResult);
      
      setError(null);
    } catch (err) {
      setError('Failed to refresh records data');
    } finally {
      setLoading(false);
    }
  }, [recordsApi, recordType]);

  // Function to get a single record - memoized to prevent unnecessary rerenders
  const getRecord = useCallback(async (id: string, type?: RecordType) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      const result = await recordsApi.getRecordById(id, type);
      return result;
    } catch (err) {
      setError(`Failed to get record ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [recordsApi]);  // Function to create a new record
  const createRecord = async (record: CreateRecord) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const result = await recordsApi.createRecord(record);
      
      // Update local state
      setRecords(prev => [...prev, result]);
      
      // Refresh stats
      const updatedStats = await recordsApi.getStats();
      setStats(updatedStats);
      
      return result;
    } catch (err: any) {
      // Don't set error state here since form components handle their own error display
      // This prevents duplicate error messages
      throw err; // Re-throw the original error to preserve the full error structure
    } finally {
      setLoading(false);
    }
  };  // Function to update a record
  const updateRecord = async (recordId: string, data: Partial<RecordData>) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const result = await recordsApi.updateRecord(recordId, data);
      
      // Update local state
      setRecords(prev => 
        prev.map(item => item.id === recordId ? result : item)
      );
      
      return result;
    } catch (err: any) {
      // Don't set error state here since form components handle their own error display
      // This prevents duplicate error messages
      throw err; // Re-throw the original error to preserve the full error structure
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a record
  const deleteRecord = useCallback(async (recordId: string, type?: RecordType) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      await recordsApi.deleteRecord(recordId, type);
      
      // Update local state
      setRecords(prev => prev.filter(item => item.id !== recordId));
      
      // Refresh stats
      const updatedStats = await recordsApi.getStats();
      setStats(updatedStats);
      
      return true;
    } catch (err) {
      setError('Failed to delete record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [recordsApi]);

  // Function to mark property as recovered
  const markAsRecovered = async (propertyId: string, recoveryDetails: {
    recoveryDate: string;
    remarks?: string;
    notes?: string;
  }) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      const result = await recordsApi.markPropertyAsRecovered(propertyId, recoveryDetails);
      
      // Update local state
      setRecords(prev => 
        prev.map(item => item.id === propertyId ? result : item)
      );
      
      return result;
    } catch (err) {
      setError('Failed to mark property as recovered');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to mark property as sold
  const markAsSold = async (propertyId: string, saleDetails: {
    soldPrice: number;
    dateOfRemittance: string;
    disposalMethod: string;
    remarks?: string;
    notes?: string;
  }) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      const result = await recordsApi.markPropertyAsSold(propertyId, saleDetails);
      
      // Update local state
      setRecords(prev => 
        prev.map(item => item.id === propertyId ? result : item)
      );
      
      return result;
    } catch (err) {
      setError('Failed to mark property as sold');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    stats,
    loading,
    error,
    refreshData,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    markAsRecovered,
    markAsSold,
    isReady: recordsApi.isReady
  };
}; 