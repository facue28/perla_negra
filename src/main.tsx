import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-lazy-load-image-component/src/effects/blur.css';
import GlobalErrorBoundary from '@/components/ui/GlobalErrorBoundary';
import AppRouter from '@/app/AppRouter';
import { Analytics } from "@vercel/analytics/react"
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from "@sentry/react";

import { ProductProvider } from '@/features/products/context/ProductContext';

// Sentry Initialization
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // Add this to your .env
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions (adjust for production)
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when an error occurs.
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <ProductProvider>
          <AppRouter />
        </ProductProvider>
      </HelmetProvider>
      <Analytics />
    </GlobalErrorBoundary>
  </StrictMode>,
)
