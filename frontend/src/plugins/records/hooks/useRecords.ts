import { useState, useEffect } from 'react';
import { useRecordsApi } from './index';
import { RecordData, RecordsStats, RecordType, CreateRecord } from '../types';

/**
 * Hook for working with records data
 */
export const useRecords = (recordType?: RecordType) => {
  const recordsApi = useRecordsApi();
  const [records, setRecords] = useState<RecordData[]>([]);
  const [stats, setStats] = useState<RecordsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load records on component mount
  useEffect(() => {
    const loadRecords = async () => {
      if (!recordsApi.isReady) return;
      
      try {
        setLoading(true);
        
        let result: RecordData[];
        if (recordType) {
          result = await recordsApi.getRecordsByType(recordType);
        } else {
          result = await recordsApi.getAllRecords();
        }
        
        setRecords(result);
        setError(null);
      } catch (err) {
        console.error('Error loading records:', err);
        setError('Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecords();
  }, [recordsApi.isReady, recordType]);

  // Load stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      if (!recordsApi.isReady) return;
      
      try {
        const result = await recordsApi.getStats();
        setStats(result);
      } catch (err) {
        console.error('Error loading record stats:', err);
      }
    };
    
    loadStats();
  }, [recordsApi.isReady]);

  // Function to refresh data
  const refreshData = async () => {
    if (!recordsApi.isReady) return;
    
    try {
      setLoading(true);
      
      const [recordsResult, statsResult] = await Promise.all([
        recordType
          ? recordsApi.getRecordsByType(recordType)
          : recordsApi.getAllRecords(),
        recordsApi.getStats()
      ]);
      
      setRecords(recordsResult);
      setStats(statsResult);
      setError(null);
    } catch (err) {
      console.error('Error refreshing records data:', err);
      setError('Failed to refresh records data');
    } finally {
      setLoading(false);
    }
  };

  // Function to get a single record
  const getRecord = async (id: string, type?: RecordType) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      const result = await recordsApi.getRecordById(id, type);
      return result;
    } catch (err) {
      console.error(`Error getting record ${id}:`, err);
      setError(`Failed to get record ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new record
  const createRecord = async (record: CreateRecord) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      const result = await recordsApi.createRecord(record);
      
      // Update local state
      setRecords(prev => [...prev, result]);
      
      // Refresh stats
      const updatedStats = await recordsApi.getStats();
      setStats(updatedStats);
      
      return result;
    } catch (err) {
      console.error('Error creating record:', err);
      setError('Failed to create record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to update a record
  const updateRecord = async (recordId: string, data: Partial<RecordData>) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      const result = await recordsApi.updateRecord(recordId, data);
      
      // Update local state
      setRecords(prev => 
        prev.map(item => item.id === recordId ? result : item)
      );
      
      return result;
    } catch (err) {
      console.error('Error updating record:', err);
      setError('Failed to update record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a record
  const deleteRecord = async (recordId: string, type?: RecordType) => {
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
      console.error('Error deleting record:', err);
      setError('Failed to delete record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
      console.error(`Error marking property ${propertyId} as recovered:`, err);
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
      console.error(`Error marking property ${propertyId} as sold:`, err);
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