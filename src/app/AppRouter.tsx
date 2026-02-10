import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import PageLoader from '@/components/ui/PageLoader';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { initGADeferred, logPageView } from '@/lib/analytics';
import ScrollToTop from './ScrollToTop'; // Now sibling


// Analytics initialization helper - DEFERRED loading for performance
const useAnalyticsLazyLoad = () => {
  useEffect(() => {
    // Load GA only after page stability (idle callback) or user interaction
    // This removes GA from critical rendering path
    initGADeferred();
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
