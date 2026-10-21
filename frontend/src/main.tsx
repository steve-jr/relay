import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { CountryProvider } from './lib/country'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CountryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CountryProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
