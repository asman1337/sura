import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  DutyRoster, 
  DutyShift, 
  DutyAssignment} from './types';

/**
 * State interface for the duty roster slice
 */
interface DutyRosterState {
  rosters: DutyRoster[];
  shifts: DutyShift[];
  assignments: DutyAssignment[];
  selectedRosterId: string | null;
  selectedShiftId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state for the duty roster slice
 */
const initialState: DutyRosterState = {
  rosters: [],
  shifts: [],
  assignments: [],
  selectedRosterId: null,
  selectedShiftId: null,
  isLoading: false,
  error: null
};

/**
 * Duty roster slice
 */
const dutyRosterSlice = createSlice({
  name: 'dutyRoster',
  initialState,
  reducers: {
    // Synchronous actions
    setRosters: (state, action: PayloadAction<DutyRoster[]>) => {
      state.rosters = action.payload;
    },
    setShifts: (state, action: PayloadAction<DutyShift[]>) => {
      state.shifts = action.payload;
    },
    setAssignments: (state, action: PayloadAction<DutyAssignment[]>) => {
      state.assignments = action.payload;
    },
    selectRoster: (state, action: PayloadAction<string | null>) => {
      state.selectedRosterId = action.payload;
    },
    selectShift: (state, action: PayloadAction<string | null>) => {
      state.selectedShiftId = action.payload;
    },
    addRoster: (state, action: PayloadAction<DutyRoster>) => {
      state.rosters.push(action.payload);
    },
    updateRoster: (state, action: PayloadAction<DutyRoster>) => {
      const index = state.rosters.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.rosters[index] = action.payload;
      }
    },
    removeRoster: (state, action: PayloadAction<string>) => {
      state.rosters = state.rosters.filter(r => r.id !== action.payload);
      if (state.selectedRosterId === action.payload) {
        state.selectedRosterId = null;
      }
    },
    addShift: (state, action: PayloadAction<DutyShift>) => {
      state.shifts.push(action.payload);
    },
    updateShift: (state, action: PayloadAction<DutyShift>) => {
      const index = state.shifts.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.shifts[index] = action.payload;
      }
    },
    removeShift: (state, action: PayloadAction<string>) => {
      state.shifts = state.shifts.filter(s => s.id !== action.payload);
      if (state.selectedShiftId === action.payload) {
        state.selectedShiftId = null;
      }
    },
    addAssignment: (state, action: PayloadAction<DutyAssignment>) => {
      state.assignments.push(action.payload);
    },
    updateAssignment: (state, action: PayloadAction<DutyAssignment>) => {
      const index = state.assignments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    },
    removeAssignment: (state, action: PayloadAction<string>) => {
      state.assignments = state.assignments.filter(a => a.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Export actions and reducer
export const dutyRosterActions = dutyRosterSlice.actions;
export default dutyRosterSlice.reducer;

/**
 * Initialize the duty roster store module
 */
export const initialize = (plugin: any) => {
  console.log('Duty Roster store initialized');
  
  // Register the reducer
  plugin.registerExtensionPoint(
    'store:reducers',
    {
      name: 'dutyRoster',
      reducer: dutyRosterSlice.reducer
    }
  );
  
  return {
    actions: dutyRosterSlice.actions
  };
}; 