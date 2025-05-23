import { useState, useEffect } from 'react';
import { useRecordsApi } from './index';
import { Record, RecordsStats, RecordType } from '../types';

/**
 * Hook for working with records data
 */
export const useRecords = (recordType?: RecordType) => {
  const recordsApi = useRecordsApi();
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<RecordsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load records on component mount
  useEffect(() => {
    const loadRecords = async () => {
      if (!recordsApi.isReady) return;
      
      try {
        setLoading(true);
        
        let result: Record[];
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

  // Function to create a new record
  const createRecord = async (record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => {
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
  const updateRecord = async (recordId: string, data: Partial<Record>) => {
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
  const deleteRecord = async (recordId: string) => {
    if (!recordsApi.isReady) throw new Error('API not ready');
    
    try {
      setLoading(true);
      await recordsApi.deleteRecord(recordId);
      
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

  return {
    records,
    stats,
    loading,
    error,
    refreshData,
    createRecord,
    updateRecord,
    deleteRecord,
    isReady: recordsApi.isReady
  };
}; 