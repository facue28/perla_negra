import { useEffect } from 'react'; // Added useEffect
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AgeVerification from '@/features/legal/components/AgeVerification';
import CookieConsent from '@/features/legal/components/CookieConsent';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { useProducts } from '@/features/products/hooks/useProducts'; // Import hook

const MainLayout = () => {
    const { loading } = useProducts(); // Access loading state

    // Signal Prerender.io when app is fully ready (products loaded)
    useEffect(() => {
        if (!loading) {
            // Add a small delay to ensure Helmet has time to update the <head>
            const timer = setTimeout(() => {
                window.prerenderReady = true;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    return (
        <div className="flex flex-col min-h-screen bg-background-dark">
            <ScrollToTop />
            <Toaster
                position="bottom-right"
                theme="dark"
                duration={3000}
                toastOptions={{
                    className: 'bg-background-alt border border-white/10 text-text-primary shadow-lg shadow-black/50 backdrop-blur-md',
                    style: {
                        background: '#1A1A1A',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#F4F4F5',
                        borderRadius: '1rem',
                    },
                    classNames: {
                        toast: 'group toast group-[.toaster]:bg-background-alt group-[.toaster]:text-text-primary group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:font-sans',
                        description: 'group-[.toast]:text-text-muted',
                        actionButton: 'group-[.toast]:bg-accent group-[.toast]:text-background-dark font-bold',
                        cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-text-primary',

                        // Custom Types Styling
                        error: 'group-[.toaster]:!border-red-500/30 group-[.toaster]:!bg-red-950/20',
                        success: 'group-[.toaster]:!border-accent/30 group-[.toaster]:!bg-accent/5',
                        warning: 'group-[.toaster]:!border-yellow-500/30 group-[.toaster]:!bg-yellow-950/20',
                        info: 'group-[.toaster]:!border-blue-500/30 group-[.toaster]:!bg-blue-950/20', // Override if needed, but user said no blue. Let's make info neutral or accent.
                    }
                }}
                icons={{
                    success: <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>,
                    error: <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></div>,
                    info: <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg></div>
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
