import { useState, useEffect, useRef } from 'react';
import { useData } from '../../../core/data';
import { RecordsService, getRecordsService, setGlobalApiInstance } from '../services';

/**
 * Hook for using the RecordsService
 * Uses a singleton pattern to ensure we have a single instance across the application
 */
export const useRecordsApi = () => {
  const { api } = useData();
  const serviceRef = useRef<RecordsService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create the service instance if it doesn't exist
  if (!serviceRef.current) {
    console.log('Creating new RecordsService instance');
    serviceRef.current = getRecordsService();
  }
  
  // Initialize the API when it becomes available
  useEffect(() => {
    if (api && serviceRef.current && !isInitialized) {
      try {
        console.log('Initializing RecordsService with API in hook');
        serviceRef.current.initialize(api);
        setGlobalApiInstance(api);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing RecordsService:', err);
      }
    }
  }, [api, isInitialized]);
  
  return serviceRef.current;
}; 