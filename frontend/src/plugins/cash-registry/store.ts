import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  CashRegistryEntry, 
  CashRegistryDailyBalance,
  CashRegistryStats
} from './types';

/**
 * Cash Registry State Interface
 */
export interface CashRegistryState {
  entries: CashRegistryEntry[];
  dailyBalances: CashRegistryDailyBalance[];
  stats: CashRegistryStats | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial Cash Registry State
 */
const initialState: CashRegistryState = {
  entries: [],
  dailyBalances: [],
  stats: null,
  loading: false,
  error: null
};

/**
 * Cash Registry Redux Slice
 */
export const cashRegistrySlice = createSlice({
  name: 'cashRegistry',
  initialState,
  reducers: {
    // Entry actions
    setEntries: (state, action: PayloadAction<CashRegistryEntry[]>) => {
      state.entries = action.payload;
    },
    addEntry: (state, action: PayloadAction<CashRegistryEntry>) => {
      state.entries.unshift(action.payload);
    },
    updateEntry: (state, action: PayloadAction<CashRegistryEntry>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    
    // Daily balance actions
    setDailyBalances: (state, action: PayloadAction<CashRegistryDailyBalance[]>) => {
      state.dailyBalances = action.payload;
    },
    addDailyBalance: (state, action: PayloadAction<CashRegistryDailyBalance>) => {
      state.dailyBalances.unshift(action.payload);
    },
    updateDailyBalance: (state, action: PayloadAction<CashRegistryDailyBalance>) => {
      const index = state.dailyBalances.findIndex(balance => balance.id === action.payload.id);
      if (index !== -1) {
        state.dailyBalances[index] = action.payload;
      }
    },
    
    // Stats actions
    setStats: (state, action: PayloadAction<CashRegistryStats>) => {
      state.stats = action.payload;
    },
    
    // Status actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Export actions
export const {
  setEntries,
  addEntry,
  updateEntry,
  setDailyBalances,
  addDailyBalance,
  updateDailyBalance,
  setStats,
  setLoading,
  setError
} = cashRegistrySlice.actions;

// Export reducer
export default cashRegistrySlice.reducer; 