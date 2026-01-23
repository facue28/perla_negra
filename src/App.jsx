import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AppProviders from '@/app/providers/AppProviders';
import PageLoader from '@/components/ui/PageLoader';

// Lazy Loaded Pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const ChiSonoPage = lazy(() => import('@/pages/ChiSonoPage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));

// Legal Pages (Lazy)
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const ResponsibleUsePage = lazy(() => import('@/pages/legal/ResponsibleUsePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function App() {
  return (
    <Router>
      <AppProviders>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main Layout Wraps All Routes */}
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="chi-sono" element={<ChiSonoPage />} />
              <Route path="productos" element={<ProductListPage />} />
              <Route path="productos/:slug" element={<ProductDetailPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="carrito" element={<CartPage />} />

              {/* Legal Routes */}
              <Route path="termini" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="uso" element={<ResponsibleUsePage />} />
              <Route path="adulto" element={<TermsPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AppProviders>
    </Router>
  );
}

export default App;
