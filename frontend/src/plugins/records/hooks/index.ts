import { useState, useEffect } from 'react';
import { useData } from '../../../core/data';
import { RecordsService, getRecordsService, setGlobalApiInstance } from '../services';

/**
 * Hook for using the RecordsService
 */
export const useRecordsApi = () => {
  const { api } = useData();
  const [recordsApi, setRecordsApi] = useState<RecordsService | null>(null);
  
  useEffect(() => {
    // Initialize the API when the core API becomes available
    if (api) {
      const recordsService = getRecordsService();
      recordsService.initialize(api);
      setGlobalApiInstance(api);
      setRecordsApi(recordsService);
    }
  }, [api]);
  
  return recordsApi || getRecordsService();
}; 