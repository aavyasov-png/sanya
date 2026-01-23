import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Telegram WebApp
if ((window as any).Telegram?.WebApp) {
  (window as any).Telegram.WebApp.ready();
  (window as any).Telegram.WebApp.expand();
  (window as any).Telegram.WebApp.enableClosingConfirmation();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
