import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConfigState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  sidebarCollapsed: boolean;
}

const initialState: ConfigState = {
  theme: 'system',
  language: 'en',
  notifications: true,
  sidebarCollapsed: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ConfigState['theme']>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setTheme, setLanguage, toggleNotifications, toggleSidebar } = configSlice.actions;
export default configSlice.reducer; 