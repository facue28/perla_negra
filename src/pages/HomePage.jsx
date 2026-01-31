import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/ui/SEO';
import InstagramSection from '@/components/layout/InstagramSection';

const HomePage = () => {
    const [currentBg, setCurrentBg] = useState(0);
    const backgrounds = [
        '/hero/silk.png',
        '/hero/feather.png',
        '/hero/glass.png'
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <div className="flex-grow relative bg-background-dark text-white pt-10 text-center flex flex-col items-center justify-center overflow-hidden min-h-[80vh]">
                {/* Background Carousel */}
                <div className="absolute inset-0 z-0">
                    {backgrounds.map((bg, index) => (
                        <div
                            key={bg}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img
                                src={bg}
                                alt=""
                                className="w-full h-full object-cover opacity-60"
                            />
                        </div>
                    ))}
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent z-10" />
                </div>

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center">
                    <SEO
                        title="Home"
                        description="Perla Negra - Intimità Elegante. Scopri la nostra collezione esclusiva di prodotti per il benessere sessuale."
                    />
                    <h1 className="text-4xl md:text-6xl font-serif mb-6 drop-shadow-lg">INTIMITÀ <span className="text-accent">ELEGANTE</span></h1>
                    <p className="text-text-muted mb-8 max-w-2xl px-4 drop-shadow-md">
                        Scopri Perla Negra. Piacere, eleganza e discrezione in ogni dettaglio.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/productos" className="bg-accent text-background-dark px-8 py-3 rounded-full font-bold hover:bg-accent-hover transition-colors shadow-lg hover:shadow-accent/20">
                            VEDI PRODOTTI
                        </Link>
                        <Link to="/chi-sono" className="border border-text-muted text-text-primary px-8 py-3 rounded-full font-medium hover:border-accent hover:text-accent transition-colors backdrop-blur-sm bg-black/10">
                            CHI SIAMO
                        </Link>
                    </div>
                </div>
            </div>
            <InstagramSection />
        </>
    );
};

export default HomePage;
