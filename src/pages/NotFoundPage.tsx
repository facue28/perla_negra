import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '@/components/ui/SEO';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center px-4 pt-24 text-center">
            <SEO
                title="Pagina Non Trovata"
                description="La pagina che cerchi non esiste."
                noIndex={true}
                statusCode={404}
            />
            <h1 className="text-9xl font-serif text-accent opacity-20 font-bold">404</h1>
            <h2 className="text-3xl font-serif text-white mb-4 -mt-12 relative z-10">Pagina Non Trovata</h2>
            <p className="text-text-muted mb-8 max-w-md">
                Sembra che ci siamo persi nel buio. La pagina che cerchi non esiste o è stata spostata.
            </p>
            <Link
                to="/"
                className="bg-accent text-background-dark px-8 py-3 rounded-full font-bold hover:bg-accent-light transition-colors inline-flex items-center gap-2"
            >
                <Home size={18} /> Torna alla Home
            </Link>
        </div>
    );
};

export default NotFoundPage;
