import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RecordsStats, RecordData, RecordType } from './types';

interface RecordsState {
  records: RecordData[];
  stats: RecordsStats | null;
  selectedRecord: RecordData | null;
  selectedRecordType: RecordType | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecordsState = {
  records: [],
  stats: null,
  selectedRecord: null,
  selectedRecordType: null,
  loading: false,
  error: null
};

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setRecords(state, action: PayloadAction<RecordData[]>) {
      state.records = action.payload;
    },
    setStats(state, action: PayloadAction<RecordsStats>) {
      state.stats = action.payload;
    },
    setSelectedRecord(state, action: PayloadAction<RecordData | null>) {
      state.selectedRecord = action.payload;
    },
    setSelectedRecordType(state, action: PayloadAction<RecordType | null>) {
      state.selectedRecordType = action.payload;
    },
    addRecord(state, action: PayloadAction<RecordData>) {
      state.records.push(action.payload);
    },
    updateRecord(state, action: PayloadAction<RecordData>) {
      const index = state.records.findIndex((record: RecordData) => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteRecord(state, action: PayloadAction<string>) {
      state.records = state.records.filter((record: RecordData) => record.id !== action.payload);
    }
  }
});

export const recordsReducer = recordsSlice.reducer;
export const recordsActions = recordsSlice.actions;

export default { reducer: recordsReducer }; 