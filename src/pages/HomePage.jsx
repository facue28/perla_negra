import { Link } from 'react-router-dom';
import SEO from '@/components/ui/SEO';

const HomePage = () => (
    <div className="flex-grow bg-background-dark text-white pt-10 text-center flex flex-col items-center justify-center">
        <SEO
            title="Home"
            description="Perla Negra - Intimità Elegante. Scopri la nostra collezione esclusiva di prodotti per il benessere sessuale."
        />
        <h1 className="text-4xl md:text-6xl font-serif mb-6">INTIMITÀ <span className="text-accent">ELEGANTE</span></h1>
        <p className="text-text-muted mb-8 max-w-2xl px-4">
            Scopri Perla Negra. Piacere, eleganza e discrezione in ogni dettaglio.
        </p>
        <div className="flex gap-4">
            <Link to="/productos" className="bg-accent text-background-dark px-8 py-3 rounded-full font-bold hover:bg-accent-hover transition-colors">
                VEDI PRODOTTI
            </Link>
            <Link to="/chi-sono" className="border border-text-muted text-text-primary px-8 py-3 rounded-full font-medium hover:border-accent hover:text-accent transition-colors">
                CHI SIAMO
            </Link>
        </div>
    </div>
);

export default HomePage;
