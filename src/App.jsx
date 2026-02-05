import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import PageLoader from '@/components/ui/PageLoader';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { initGA, logPageView } from '@/lib/analytics';
import ScrollToTop from '@/components/layout/ScrollToTop';

// Initialize GA on app start
initGA();

// Helper component to track page views
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);

  return null;
};

function App() {
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
