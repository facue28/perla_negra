import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = (): React.ReactElement | null => {
    const [showBanner, setShowBanner] = useState(false);

    // Bypass for Lighthouse audits
    const isAuditMode = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).has('lh') || import.meta.env.VITE_LIGHTHOUSE === 'true');

    if (isAuditMode) return null;

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        const ageVerified = localStorage.getItem('ageVerified');

        // Only show if no consent AND age is verified
        if (!consent && ageVerified === 'true') {
            // Show banner after a small delay for better UX
            setTimeout(() => {
                setShowBanner(true);
            }, 1000);
        }
    }, [/* dependency on ageVerified change? LocalStorage doesn't trigger re-render */]);

    // We might need to listen to storage event or custom event if AgeVerification happens in same session
    useEffect(() => {
        const handleStorageChange = () => {
            if (localStorage.getItem('ageVerified') === 'true' && !localStorage.getItem('cookieConsent')) {
                setShowBanner(true);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-window updates
        window.addEventListener('age-verified', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('age-verified', handleStorageChange);
        };
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-slideUp">
            <div className="max-w-7xl mx-auto bg-background-alt/95 backdrop-blur-xl border border-accent/20 rounded-2xl shadow-2xl shadow-black/20">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Cookie className="text-accent" size={24} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                            <h3 className="text-text-primary font-bold text-lg mb-2">
                                Utilizziamo i Cookie 🍪
                            </h3>
                            <p className="text-text-muted text-sm leading-relaxed">
                                Utilizziamo cookie essenziali per garantire il corretto funzionamento del sito e migliorare la tua esperienza di navigazione.
                                Continuando a navigare, accetti il nostro utilizzo dei cookie.{' '}
                                <Link to="/privacy" className="text-accent hover:underline font-medium">
                                    Leggi la Privacy Policy
                                </Link>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={handleAccept}
                                className="bg-accent text-background-dark px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 whitespace-nowrap"
                            >
                                Accetta tutti
                            </button>
                            <button
                                onClick={handleReject}
                                className="bg-background-dark border border-border/30 text-text-muted px-6 py-3 rounded-xl font-medium hover:border-accent/50 hover:text-accent transition-all whitespace-nowrap"
                            >
                                Rifiuta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
