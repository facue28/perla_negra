import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import AgeVerification from '@/features/legal/components/AgeVerification';
import CookieConsent from '@/features/legal/components/CookieConsent';
import ScrollToTop from './ScrollToTop';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <ScrollToTop />
            <Toaster position="bottom-right" richColors theme="dark" duration={2000} />
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
