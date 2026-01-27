import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AgeVerification = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check if user has already verified
        const verified = localStorage.getItem('ageVerified');
        if (verified === 'true') {
            setIsVerified(true);
        } else {
            setShowModal(true);
        }
    }, []);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

            {/* Modal */}
            <div className="relative z-10 bg-background-alt/95 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 md:p-12 max-w-md mx-4 shadow-2xl shadow-accent/10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex flex-col items-center">
                        <span className="font-serif text-3xl tracking-widest text-text-primary">PERLA</span>
                        <span className="font-serif text-3xl tracking-widest text-text-primary -mt-2">NEGRA</span>
                    </div>
                    <div className="w-16 h-1 bg-accent mt-4 rounded-full"></div>
                </div>

                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-5xl">🔞</span>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-text-primary mb-4">Contenuto per Adulti</h2>
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
                        className="w-full bg-accent text-background-dark py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
                    >
                        Sì, ho +18 anni
                    </button>
                    <button
                        onClick={handleReject}
                        className="w-full bg-background-dark border border-border/30 text-text-muted py-4 rounded-xl font-medium hover:border-accent/50 hover:text-accent transition-all"
                    >
                        No, esci
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-text-muted text-center mt-6 opacity-70">
                    Cliccando "Sì", accetti i nostri{' '}
                    <a href="/termini" className="text-accent hover:underline">Termini e Condizioni</a>
                </p>
            </div>
        </div>
    );
};

export default AgeVerification;
