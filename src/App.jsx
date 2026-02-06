import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import PageLoader from '@/components/ui/PageLoader';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { initGA, logPageView } from '@/lib/analytics';
import ScrollToTop from '@/components/layout/ScrollToTop';

// Analytics initialization helper
const useAnalyticsLazyLoad = () => {
  useEffect(() => {
    // Delay initialization by 3 seconds to prioritize visual rendering
    const timer = setTimeout(() => {
      initGA();
      logPageView();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
};

// Helper component to track page views (subsequent navigation)
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);

  return null;
};

function App() {
  useAnalyticsLazyLoad();

  return (
    <Router>
      <PageTracker />
      <ScrollToTop />
      <AppProviders>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </AppProviders>
    </Router>
  );
}

export default App;
