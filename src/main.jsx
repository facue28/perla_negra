import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GlobalErrorBoundary from '@/components/ui/GlobalErrorBoundary';
import App from './App.jsx'
import { Analytics } from "@vercel/analytics/react"

import { ProductProvider } from '@/features/products/context/ProductContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <ProductProvider>
        <App />
      </ProductProvider>
      <Analytics />
    </GlobalErrorBoundary>
  </StrictMode>,
)
