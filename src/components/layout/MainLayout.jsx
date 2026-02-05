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
            <Toaster
                position="bottom-right"
                theme="dark"
                duration={3000}
                toastOptions={{
                    className: 'bg-background-alt border border-white/10 text-text-primary shadow-lg shadow-black/50',
                    style: {
                        background: '#1A1A1A', // Fallback
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#F4F4F5'
                    },
                    classNames: {
                        toast: 'group toast group-[.toaster]:bg-background-alt group-[.toaster]:text-text-primary group-[.toaster]:border-white/10 group-[.toaster]:shadow-xl',
                        description: 'group-[.toast]:text-text-muted',
                        actionButton: 'group-[.toast]:bg-accent group-[.toast]:text-background-dark',
                        cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-text-primary',
                    }
                }}
            />
            <AgeVerification />
            <CookieConsent />

            <Navbar />

            <main className="flex-grow">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
