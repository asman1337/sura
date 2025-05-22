import { useState, useCallback } from 'react';
import { useData } from '../../../core/data/data-context';
import { 
  DutyRoster, 
  CreateDutyRosterDto, 
  UpdateDutyRosterDto 
} from '../types';
import { DutyRosterRepository } from '../repositories/duty-roster-repository';

/**
 * Hook for duty roster operations
 */
export function useDutyRoster() {
  const dataContext = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Create repository instance
  const repository = new DutyRosterRepository(
    dataContext.api,
    dataContext.cache,
    dataContext.sync,
    dataContext.storage
  );
  
  // Get all duty rosters
  const getAllRosters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const rosters = await repository.getAll();
      setLoading(false);
      return rosters;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  // Get roster by ID
  const getRosterById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const roster = await repository.getById(id);
      setLoading(false);
      return roster;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  // Get rosters by unit
  const getRostersByUnit = useCallback(async (unitId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const rosters = await repository.getRostersByUnit(unitId);
      setLoading(false);
      return rosters;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  // Create a new roster
  const createRoster = useCallback(async (data: CreateDutyRosterDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const roster = await repository.create(data);
      setLoading(false);
      return roster;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  // Update a roster
  const updateRoster = useCallback(async (id: string, data: UpdateDutyRosterDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const roster = await repository.update(id, data);
      setLoading(false);
      return roster;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  // Delete a roster
  const deleteRoster = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await repository.delete(id);
      setLoading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  // Publish a roster
  const publishRoster = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const roster = await repository.publishRoster(id);
      setLoading(false);
      return roster;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [repository]);
  
  return {
    loading,
    error,
    getAllRosters,
    getRosterById,
    getRostersByUnit,
    createRoster,
    updateRoster,
    deleteRoster,
    publishRoster
  };
} 