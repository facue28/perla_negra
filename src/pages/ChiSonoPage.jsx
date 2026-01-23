import React from 'react';
import noeliaImg from '@/assets/images/noelia.png';
import SEO from '@/components/ui/SEO';

const ChiSonoPage = () => {
    return (
        <div className="bg-background-dark h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <SEO title="Chi Sono" description="La storia di Noelia e Perla Negra. Un viaggio di passione e imprenditorialità." />
            {/* Reduced max-width from 7xl to 6xl/5xl to bring columns closer */}
            <div className="max-w-6xl w-full h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Texto Izquierda */}
                <div className="flex flex-col h-full max-h-full overflow-hidden order-2 md:order-1 justify-between py-4 md:py-8 pl-4">
                    <div className="flex-shrink-0">
                        <div className="mb-4">
                            {/* Title updated and prevented from wrapping */}
                            <h1 className="text-3xl md:text-4xl font-serif text-text-primary tracking-wide uppercase whitespace-nowrap">
                                Chi Sono - La mia storia
                            </h1>
                        </div>
                        <h2 className="text-lg md:text-xl text-text-primary font-medium underline decoration-accent decoration-2 underline-offset-4 pointer-events-none mb-4">
                            La storia dietro Perla Negra
                        </h2>
                    </div>

                    <div className="text-text-muted leading-relaxed text-sm md:text-base lg:text-lg text-justify flex flex-col justify-between flex-grow h-full pr-8">
                        <p>
                            Mi chiamo Noelia, sono nata in un piccolo paese della provincia di Córdoba, in Argentina.
                            Il mio viaggio nel mondo della sessualità è iniziato in modo molto personale: da giovane avevo bisogno di un semplice lubrificante, ma per comprarlo dovevo viaggiare in città più grandi, lontano dal mio paese, per non sentirmi giudicata.
                        </p>
                        <p>
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
                        <p>
                            Il mio desiderio è di offrire un luogo sicuro e un contatto sempre diretto e dolce con i clienti.
                        </p>
                        <p className="italic text-accent font-medium mt-2 text-lg">
                            Benvenuti in Perla Negra.
                        </p>
                    </div>
                </div>

                {/* Imagen Derecha */}
                <div className="h-full w-full flex items-center justify-center md:justify-end p-0 overflow-hidden order-1 md:order-2 relative">
                    <img
                        src={noeliaImg}
                        alt="Noelia - Fundadora"
                        className="h-full w-auto object-contain object-center md:object-right drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    />
                </div>

            </div>
        </div>
    );
};

export default ChiSonoPage;
