import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { DataRefreshProvider } from './contexts/DataRefreshContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataRefreshProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DataRefreshProvider>
    </BrowserRouter>
  </StrictMode>,
)
