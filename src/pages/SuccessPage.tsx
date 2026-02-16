import React, { useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import SEO from '@/components/ui/SEO';

interface SuccessState {
    orderNumber: string;
    whatsappUrl: string;
}

import { useCart } from '@/features/cart/context/CartContext';

// ...

const SuccessPage: React.FC = () => {
    const location = useLocation();
    const state = location.state as SuccessState;
    const { clearCart } = useCart();

    useEffect(() => {
        if (state?.orderNumber) {
            clearCart();
        }
    }, [state, clearCart]);

    if (!state?.orderNumber) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 pt-24 fade-in relative overflow-hidden">
            <SEO title="Ordine Completato" description="Grazie per il tuo acquisto su Perla Negra." />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
            </div>

            <div className="bg-background-alt/50 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 text-center max-w-lg w-full shadow-2xl shadow-black/40 relative z-10">

                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30 shadow-[0_0_30px_rgba(63,255,193,0.3)] animate-pulse-slow">
                        <CheckCircle2 size={48} className="text-accent" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">Grazie!</h1>
                <p className="text-text-muted mb-6 text-lg">
                    Il tuo ordine <span className="text-accent font-bold">#{state.orderNumber}</span> è stato ricevuto.
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-8 text-left border border-white/5">
                    <h3 className="text-text-primary font-medium mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full" />
                        Passi successivi:
                    </h3>
                    <ul className="text-text-muted text-sm space-y-2 ml-4 list-disc list-outside">
                        <li>Hai inviato i dettagli su WhatsApp.</li>
                        <li>Noelia ti confermerà la disponibilità e il totale.</li>
                        <li>Riceverai le istruzioni per il pagamento.</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        to="/prodotti"
                        className="bg-accent text-background-dark px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(63,255,193,0.2)] hover:shadow-[0_0_30px_rgba(63,255,193,0.4)] flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={20} />
                        Continua lo Shopping
                    </Link>

                    <a
                        href={state.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-white text-sm py-2 transition-colors flex items-center justify-center gap-1"
                    >
                        Non si è aperto WhatsApp? <span className="underline decoration-accent/50">Clicca qui</span>
                        <ArrowRight size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;
