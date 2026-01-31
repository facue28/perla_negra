import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import noeliaImg from '@/assets/images/noelia.png';
import SEO from '@/components/ui/SEO';

const ChiSonoPage = () => {
    return (
        <div className="bg-background-dark h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 overflow-y-auto md:overflow-hidden">
            <SEO title="Chi Sono" description="La storia di Noelia e Perla Negra. Un viaggio di passione e imprenditorialità." />

            <div className="max-w-6xl w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">

                {/* Texto Izquierda - Compacto */}
                <div className="flex flex-col h-full justify-center py-2 md:py-4 pl-4 md:pl-0">
                    <div className="flex-shrink-0 mb-2 md:mb-4">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-text-primary tracking-wide uppercase whitespace-nowrap mb-1">
                            Chi Sono - La mia storia
                        </h1>
                        <h2 className="text-base md:text-lg text-text-primary font-medium underline decoration-accent decoration-2 underline-offset-4 pointer-events-none">
                            La storia dietro Perla Negra
                        </h2>
                    </div>

                    <div className="text-text-muted text-xs md:text-sm lg:text-base text-justify flex flex-col gap-2 md:gap-3 pr-4 md:pr-8">
                        <p>
                            Mi chiamo Noelia, sono nata in un piccolo paese della provincia di Córdoba, in Argentina.
                            Il mio viaggio nel mondo della sessualità è iniziato in modo molto personale: da giovane avevo bisogno di un semplice lubrificante, ma per comprarlo dovevo viaggiare in città più grandi, lontano dal mio paese, per non sentirmi giudicata.
                        </p>
                        <p className="hidden md:block">
                            La vergogna, i tabù e il "cosa dirà la gente" hanno segnato i miei primi passi.
                        </p>
                        <p>
                            Un giorno ho deciso di rompere quel silenzio: ho iniziato a parlarne con le mie amiche e con le mie follower su Instagram.
                            Mi sono accorta che non ero sola, che tante donne vivevano la stessa esperienza.
                        </p>
                        <p>
                            Così ho comprato il mio primo set di 12 lubrificanti... e li ho venduti in poche ore.
                            Da lì è iniziato tutto: un piccolo sogno diventato realtà.
                        </p>
                        <p>
                            Nel 2023 ho scelto di trasferirmi in Italia, lasciando in Argentina un sex shop già avviato e funzionante.
                            Qui ho trovato la forza e l'opportunità di ricominciare, portando con me la mia esperienza.
                        </p>
                        <p className="hidden lg:block">
                            Il mio desiderio è di offrire un luogo sicuro e un contatto sempre diretto e dolce con i clienti.
                        </p>
                        <p className="italic text-accent font-medium mt-1 text-base md:text-lg">
                            Benvenuti in Perla Negra.
                        </p>

                        <div className="pt-2">
                            <Link
                                to="/productos"
                                className="inline-flex items-center gap-2 bg-accent text-background-dark px-6 py-2 rounded-full font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 hover:scale-105 transform duration-200"
                            >
                                Scopri la Collezione <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Imagen Derecha - Altura dinámica */}
                <div className="h-full w-full flex items-center justify-center md:justify-end overflow-hidden order-1 md:order-2">
                    <img
                        src={noeliaImg}
                        alt="Noelia - Fundadora"
                        className="max-h-[50vh] md:max-h-[75vh] w-auto object-contain object-center md:object-right drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    />
                </div>

            </div>
        </div>
    );
};

export default ChiSonoPage;
