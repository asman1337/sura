import { Plugin } from '../../core/plugins';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state interface
interface MalkhanaState {
  items: any[];
  loading: boolean;
  error: string | null;
  selectedItem: any | null;
}

// Define the initial state
const initialState: MalkhanaState = {
  items: [],
  loading: false,
  error: null,
  selectedItem: null
};

// Create the slice
const malkhanaSlice = createSlice({
  name: 'malkhana',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setItems: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedItem: (state, action: PayloadAction<any>) => {
      state.selectedItem = action.payload;
    }
  }
});

// Export actions
export const { setLoading, setItems, setError, setSelectedItem } = malkhanaSlice.actions;

// Export the store module
export default {
  initialize: (plugin: Plugin) => {
    console.log('Malkhana store initialized');
    
    // Register the reducer
    plugin.registerExtensionPoint(
      'store:reducers',
      {
        name: 'malkhana',
        reducer: malkhanaSlice.reducer
      }
    );
    
    return {
      actions: malkhanaSlice.actions
    };
  }
}; 