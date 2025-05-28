import { useState, useMemo } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PluginProvider, PluginLoader } from './core/plugins'
import { DataProvider } from './core/data'
import { ThemeProvider } from './core/theme'
import { createAppStore } from './core/store'
import AppRoutes from './core/routes/Routes'
import './App.css'

// Import plugins - in a real app, these would be loaded dynamically
import MalkhanaPlugin from './plugins/malkhana'
import DutyRosterPlugin from './plugins/duty-roster'
import RecordsPlugin from './plugins/records'
import CashRegistryPlugin from './plugins/cash-registry';

// Create the store
const store = createAppStore()

// React Router future flags
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// App configuration
const dataConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  usePersistentStorage: true,
  useIndexedDb: false,
  syncInterval: 60000 // 1 minute
} 

// App Shell handles app layout after plugins are loaded
function AppShell() {
  const [pluginsReady, setPluginsReady] = useState(false)
  
  // Memoize plugins to prevent re-registration on re-renders
  const pluginsToLoad = useMemo(() => [
    RecordsPlugin,
    MalkhanaPlugin,
    DutyRosterPlugin,
    CashRegistryPlugin,
    // Add more plugins here
  ], []); // Empty dependency array ensures this is only computed once

  // Handler for when plugins are loaded
  const handlePluginsLoaded = () => {
    console.log('All plugins have been loaded and initialized');
    setPluginsReady(true);
  };

  return (
    <div className="app-shell">
      <PluginLoader 
        plugins={pluginsToLoad} 
        onLoaded={handlePluginsLoaded}
        fallback={<div className="loading">Loading SURA plugins...</div>}
      >
        {pluginsReady ? (
          <div className="app-content">
            <AppRoutes />
          </div>
        ) : (
          <div className="loading-container">
            <p>Initializing system...</p>
          </div>
        )}
      </PluginLoader>
    </div>
  )
}

// Root component that provides all context providers
function App() {
  return (
    <ReduxProvider store={store}>
      <BrowserRouter {...routerOptions}>
        <ThemeProvider>
          <PluginProvider>
            <DataProvider config={dataConfig}>
              <AppShell />
            </DataProvider>
          </PluginProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ReduxProvider>
  )
}

export default App
