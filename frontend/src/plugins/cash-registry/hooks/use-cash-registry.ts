import { useState, useCallback } from 'react';
import { useData } from '../../../core/data/data-context';
import { 
  CashRegistryEntry, 
  CreateCashEntryDto, 
  UpdateCashEntryDto, 
  TransactionType,
  CashEntryQueryParams 
} from '../types';
import { getCashRegistryRepository } from '../repositories/cash-registry-repository';

/**
 * Hook for interacting with the cash registry
 */
export function useCashRegistry() {
  const { api, cache, sync, storage } = useData();
  const repository = getCashRegistryRepository(api, cache, sync, storage);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [entries, setEntries] = useState<CashRegistryEntry[]>([]);
  
  // Load all entries with optional filters
  const loadEntries = useCallback(async (params?: CashEntryQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await repository.getEntries(params);
      setEntries(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load entries'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Get a single entry by ID
  const getEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await repository.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load entry ${id}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Create a new entry
  const createEntry = useCallback(async (entry: CreateCashEntryDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const created = await repository.createEntry(entry);
      setEntries(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create entry'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Update an existing entry
  const updateEntry = useCallback(async (id: string, updates: UpdateCashEntryDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await repository.updateEntry(id, updates);
      setEntries(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update entry ${id}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Load entries by type (receipts or disbursements)
  const loadEntriesByType = useCallback(async (type: TransactionType) => {
    return loadEntries({ transactionType: type });
  }, [loadEntries]);
  
  // Load entries for a date range
  const loadEntriesForDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    return loadEntries({ startDate, endDate });
  }, [loadEntries]);
  
  // Generate a document number
  const generateDocumentNumber = useCallback(async (type: TransactionType) => {
    setLoading(true);
    setError(null);
    
    try {
      return await repository.generateDocumentNumber(type);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate document number'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  return {
    entries,
    loading,
    error,
    loadEntries,
    getEntry,
    createEntry,
    updateEntry,
    loadEntriesByType,
    loadEntriesForDateRange,
    generateDocumentNumber
  };
} 