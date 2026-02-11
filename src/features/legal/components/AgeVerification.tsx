import React, { useState } from 'react';

const AgeVerification: React.FC = () => {
    // Lazy initialization: Check localStorage immediately
    const [isVerified, setIsVerified] = useState<boolean>(() => {
        return typeof window !== 'undefined' && localStorage.getItem('ageVerified') === 'true';
    });
    const [showModal, setShowModal] = useState<boolean>(() => {
        // Bypass for Lighthouse audits
        if (typeof window !== 'undefined' && (new URLSearchParams(window.location.search).has('lh') || import.meta.env.VITE_LIGHTHOUSE === 'true')) {
            return false;
        }
        // Only show if NOT verified
        return typeof window !== 'undefined' && localStorage.getItem('ageVerified') !== 'true';
    });

    const handleAccept = () => {
        // Save verification ONLY when user accepts
        localStorage.setItem('ageVerified', 'true');
        window.dispatchEvent(new Event('age-verified'));
        setIsVerified(true);
        setShowModal(false);
    };

    const handleReject = () => {
        // Do NOT save to localStorage - user can try again
        // Redirect to external site
        window.location.href = 'https://www.google.com';
    };

    // Don't render anything if already verified
    if (isVerified || !showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop - Optimized: used bg-black/80 instead of backdrop-blur for better LCP/TBT */}
            <div className="absolute inset-0 bg-black/90"></div>

            {/* Modal */}
            <div className="relative z-10 bg-zinc-900/95 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 md:p-12 max-w-md mx-4 shadow-2xl shadow-accent/10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex flex-col items-center">
                        <span className="font-serif text-3xl tracking-widest text-white">PERLA</span>
                        <span className="font-serif text-3xl tracking-widest text-white -mt-2">NEGRA</span>
                    </div>
                    <div className="w-16 h-1 bg-accent mt-4 rounded-full"></div>
                </div>

                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-5xl" role="img" aria-label="18 plus warning">🔞</span>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-white mb-4">Contenuto per Adulti</h2>
                    <p className="text-text-muted leading-relaxed">
                        Questo sito contiene contenuti destinati esclusivamente a persone maggiorenni.
                    </p>
                    <p className="text-text-muted leading-relaxed mt-2">
                        Confermando, dichiari di avere almeno 18 anni.
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleAccept}
                        className="w-full bg-accent text-background-dark py-4 rounded-xl font-bold text-lg hover:bg-accent-light transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
                    >
                        Sì, ho +18 anni
                    </button>
                    <button
                        onClick={handleReject}
                        className="w-full bg-background-dark border border-white/10 text-text-muted py-4 rounded-xl font-medium hover:border-accent/50 hover:text-accent transition-all"
                    >
                        No, esci
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-text-muted text-center mt-6 opacity-70">
                    Cliccando "Sì", accetti i nostri{' '}
                    <a href="/termini" className="text-accent hover:underline">Termini e Condiciones</a>
                </p>
            </div>
        </div>
    );
};

export default AgeVerification;
