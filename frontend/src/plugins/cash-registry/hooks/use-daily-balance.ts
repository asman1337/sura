import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../core/data/data-context';
import { 
  CashRegistryDailyBalance, 
  CreateDailyBalanceDto, 
  VerifyDailyBalanceDto, 
  CashRegistryStats 
} from '../types';
import { getDailyBalanceRepository } from '../repositories/daily-balance-repository';

/**
 * Hook for interacting with daily cash balances
 */
export function useDailyBalance() {
  const { api, cache, sync, storage } = useData();
  const repository = getDailyBalanceRepository(api, cache, sync, storage);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [balances, setBalances] = useState<CashRegistryDailyBalance[]>([]);
  const [stats, setStats] = useState<CashRegistryStats | null>(null);
  
  // Load all daily balances
  const loadBalances = useCallback(async (limit?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await repository.getBalances(limit);
      setBalances(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load daily balances'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Get a single balance by ID or date string
  const getBalance = useCallback(async (idOrDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await repository.getBalance(idOrDate);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load balance for ${idOrDate}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Get balance for a specific date
  const getBalanceForDate = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      return await repository.getBalanceForDate(date);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load balance for date ${date.toISOString()}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Create a new daily balance
  const createBalance = useCallback(async (balanceData: CreateDailyBalanceDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const created = await repository.createBalance(balanceData);
      setBalances(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create daily balance'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Verify a daily balance
  const verifyBalance = useCallback(async (id: string, verifyData: VerifyDailyBalanceDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await repository.verifyBalance(id, verifyData);
      setBalances(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to verify balance ${id}`));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Load cash registry statistics
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await repository.getStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cash registry stats'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository]);
  
  // Load stats on initial mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  return {
    balances,
    stats,
    loading,
    error,
    loadBalances,
    getBalance,
    getBalanceForDate,
    createBalance,
    verifyBalance,
    loadStats
  };
} 