import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-lazy-load-image-component/src/effects/blur.css';
import GlobalErrorBoundary from '@/components/ui/GlobalErrorBoundary';
import AppRouter from '@/app/AppRouter';
import { Analytics } from "@vercel/analytics/react"
import { HelmetProvider } from 'react-helmet-async';

import { ProductProvider } from '@/features/products/context/ProductContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <ProductProvider>
          <AppRouter />
          <BodyHydrationEffect />
        </ProductProvider>
      </HelmetProvider>
      <Analytics />
    </GlobalErrorBoundary>
  </StrictMode>,
)

// Helper component to mark hydration complete
function BodyHydrationEffect() {
  createRoot(document.createElement('div')).render(null); // Force flush
  requestAnimationFrame(() => document.body.classList.add('hydrated'));
  return null;
}
