import { useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PluginProvider, PluginLoader, IfPlugin } from './core/plugins'
import { createAppStore } from './core/store'
import { PluginManager } from './core/components/PluginManager'
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

// App Shell handles app layout after plugins are loaded
function AppShell() {
  const [pluginsReady, setPluginsReady] = useState(false)

  return (
    <PluginLoader 
      plugins={pluginsToLoad} 
      onLoaded={() => setPluginsReady(true)}
      fallback={<div className="loading">Loading SURA plugins...</div>}
    >
      <div className="app-shell">
        <header className="app-header">
          <h1>SURA Police Management System</h1>
        </header>
        
        <main className="app-content">
          {pluginsReady ? (
            <>
              <p>All plugins loaded successfully!</p>
              
              {/* Plugin Manager UI */}
              <PluginManager />
              
              {/* Example of conditional rendering based on plugin availability */}
              <IfPlugin pluginId="sura-malkhana-plugin">
                <div className="plugin-feature">
                  <h2>Malkhana Management</h2>
                  <p>Malkhana plugin is enabled and ready to use.</p>
                </div>
              </IfPlugin>
            </>
          ) : (
            <p>Initializing plugins...</p>
          )}
        </main>
      </div>
    </PluginLoader>
  )
}

// Root component that provides all context providers
function App() {
  return (
    <ReduxProvider store={store}>
      <BrowserRouter>
        <PluginProvider>
          <AppShell />
        </PluginProvider>
      </BrowserRouter>
    </ReduxProvider>
  )
}

export default App
