import React, { useState } from 'react'
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

// Create the store
const store = createAppStore()

// List of plugins to load
const pluginsToLoad = [
  MalkhanaPlugin,
  // Add more plugins here
]

// App configuration
const dataConfig = {
  apiBaseUrl: 'http://localhost:3000',
  usePersistentStorage: true,
  useIndexedDb: false,
  syncInterval: 60000 // 1 minute
}

// App Shell handles app layout after plugins are loaded
function AppShell() {
  const [pluginsReady, setPluginsReady] = useState(false)

  return (
    <div className="app-shell">
      <PluginLoader 
        plugins={pluginsToLoad} 
        onLoaded={() => setPluginsReady(true)}
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
      <BrowserRouter>
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
