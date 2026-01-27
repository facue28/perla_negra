import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GlobalErrorBoundary from '@/components/ui/GlobalErrorBoundary';
import App from './App.jsx'
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
      <Analytics />
    </GlobalErrorBoundary>
  </StrictMode>,
)
