import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import noeliaImg from '@/assets/images/noelia.png';
import Reveal from '@/components/ui/Reveal';
import SEO from '@/components/ui/SEO';

const ChiSonoPage = () => {
    return (
        <div className="bg-background-dark min-h-screen w-full pt-24 pb-16 relative overflow-hidden">
            <SEO title="Chi Sono" description="La storia di Noelia e Perla Negra. Un viaggio di passione e imprenditorialità." />

            {/* Background Atmosphere - Subtle Glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center min-h-[calc(100vh-160px)]">

                    {/* Texto Izquierda - Editorial Style */}
                    <div className="md:col-span-7 flex flex-col justify-center py-4 md:py-8">
                        <Reveal delay={0.1}>
                            <div className="mb-8 md:mb-10 border-l-2 border-accent/30 pl-6">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary tracking-wide uppercase mb-3">
                                    Chi Sono
                                </h1>
                                <h2 className="text-lg md:text-xl text-accent font-medium tracking-wider uppercase opacity-90">
                                    La storia dietro Perla Negra
                                </h2>
                            </div>
                        </Reveal>

                        <div className="space-y-8">
                            {/* The Hook - Lead Paragraph */}
                            <Reveal delay={0.2}>
                                <p className="text-lg md:text-xl text-text-primary/90 leading-relaxed font-light">
                                    Mi chiamo <strong className="text-white font-serif">Noelia</strong>, sono nata in un piccolo paese della provincia di Córdoba, in Argentina.
                                    Il mio viaggio nel mondo della sessualità è iniziato in modo molto personale: da giovane avevo bisogno di un semplice lubrificante, ma per comprarlo dovevo viaggiare in città più grandi, lontano dal mio paese, per non sentirmi giudicata.
                                </p>
                            </Reveal>

                            {/* The Conflict */}
                            <Reveal delay={0.3}>
                                <p className="text-text-muted text-base md:text-lg leading-relaxed">
                                    La vergogna, i tabù e il "cosa dirà la gente" hanno segnato i miei primi passi.
                                    Un giorno ho deciso di rompere quel silenzio: ho iniziato a parlarne con le mie amiche e con le mie follower su <a href="https://www.instagram.com/perlanegra.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline decoration-accent underline-offset-4 transition-all font-medium">Instagram</a>.
                                    Mi sono accorta che non ero sola, che tante donne vivevano la stessa esperienza.
                                </p>
                            </Reveal>

                            {/* The Pull Quote - Highlight */}
                            <Reveal delay={0.4}>
                                <div className="relative py-4">
                                    <span className="absolute top-0 left-0 text-6xl font-serif text-accent/20 -translate-y-4">“</span>
                                    <p className="text-xl md:text-2xl font-serif text-white italic pl-8 leading-relaxed relative z-10">
                                        Così ho comprato il mio primo set di <span className="text-accent not-italic">12 lubrificanti</span>... e li ho venduti in poche ore.
                                        Da lì è iniziato tutto: un piccolo sogno diventato realtà.<span className="text-5xl md:text-6xl font-serif text-accent/20 leading-none align-bottom ml-1">”</span>
                                    </p>
                                </div>
                            </Reveal>

                            {/* The Resolution & Signature */}
                            <Reveal delay={0.5}>
                                <div className="text-text-muted text-base md:text-lg leading-relaxed space-y-4">
                                    <p>
                                        Nel <span className="text-white font-medium">2023</span> ho scelto di trasferirmi in Italia, lasciando in Argentina un sex shop già avviato e funzionante.
                                        Qui ho trovato la forza e l'opportunità di ricominciare, portando con me la mia esperienza.
                                    </p>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                        <div>
                                            <p className="text-sm uppercase tracking-widest text-text-muted mb-1">Fondatrice</p>
                                            <p className="font-signature text-4xl text-accent transform -rotate-2 origin-left">Noelia Pinamonti</p>
                                        </div>

                                        <Link
                                            to="/productos"
                                            className="group flex items-center gap-3 text-white hover:text-accent transition-colors pb-1 border-b border-white/20 hover:border-accent"
                                        >
                                            <span className="font-medium tracking-wide">SCOPRI LA COLLEZIONE</span>
                                            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* Imagen Derecha - Anchor */}
                    <div className="md:col-span-5 w-full flex items-end justify-end relative h-full min-h-[500px] md:min-h-auto">
                        <Reveal delay={0.3} className="w-full h-full flex items-center justify-center md:justify-end">
                            <div className="relative">
                                {/* Decorative Circle behind image */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-accent/20 rounded-full" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-white/5 rounded-full" />

                                <img
                                    src={noeliaImg}
                                    alt="Noelia Pinamonti - Fundadora"
                                    className="relative z-10 max-h-[70vh] md:max-h-[80vh] w-auto object-contain drop-shadow-2xl translate-y-4"
                                />
                            </div>
                        </Reveal>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChiSonoPage;
