import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initTelegramMock } from './lib/telegram-mock'

// Инициализация Telegram Mock (если включен)
initTelegramMock();

// Initialize Telegram WebApp
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  // enableClosingConfirmation may not exist on all versions
  if ('enableClosingConfirmation' in window.Telegram.WebApp) {
    (window.Telegram.WebApp as unknown as { enableClosingConfirmation: () => void }).enableClosingConfirmation();
  }
  console.log('[TG] Telegram WebApp initialized');
} else {
  console.warn('[TG] Telegram WebApp not available - running in browser mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
