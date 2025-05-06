import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';

// Core reducers (these would be implemented in separate files)
import authReducer from './slices/authSlice';
import configReducer from './slices/configSlice';

// Create a store with support for dynamically injected reducers
export function createAppStore() {
  // Initial reducers
  const staticReducers = {
    auth: authReducer,
    config: configReducer,
  };

  // Create store with initial reducers
  const store = configureStore({
    reducer: staticReducers,
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore certain paths for non-serializable values
          ignoredActions: ['plugin/register'],
          ignoredPaths: ['plugins.registry'],
        },
      }),
  });

  // Add support for dynamic reducer injection
  const asyncReducers: Record<string, Reducer> = {};
  
  // Function to inject a reducer at runtime
  const injectReducer = (key: string, reducer: Reducer) => {
    // Only inject if it's not already there or has changed
    if (asyncReducers[key] !== reducer) {
      asyncReducers[key] = reducer;
      
      // Create a new combined reducer with all static and async reducers
      const combinedReducer = combineReducers({
        ...staticReducers,
        ...asyncReducers,
      });
      
      // Replace the root reducer
      store.replaceReducer(combinedReducer);
    }
  };

  // Add the injectReducer function to the store
  return {
    ...store,
    injectReducer,
  };
}

// Types for the enhanced store
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch']; 