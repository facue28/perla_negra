import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import AgeVerification from '@/features/legal/components/AgeVerification';
import CookieConsent from '@/features/legal/components/CookieConsent';
import ScrollToTop from '@/components/ui/ScrollToTop';
import PageTransition from '@/components/ui/PageTransition';

const MainLayout = () => {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <ScrollToTop />
            <Toaster position="bottom-right" richColors theme="dark" duration={2000} />
            <AgeVerification />
            <CookieConsent />

            <Navbar />

            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname} className="min-h-full">
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
