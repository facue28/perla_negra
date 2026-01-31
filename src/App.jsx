
import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import PageLoader from '@/components/ui/PageLoader';
import { AppRoutes } from '@/app/routes/AppRoutes';

function App() {
  return (
    <Router>
      <AppProviders>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </AppProviders>
    </Router>
  );
}

export default App;
