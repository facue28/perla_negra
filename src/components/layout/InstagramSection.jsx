import { Instagram } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

const InstagramSection = () => {
    return (
        <section className="py-16 bg-background-dark border-t border-border/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <Reveal>
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Instagram size={32} className="text-accent mb-4" />
                        <h2 className="text-3xl font-serif text-text-primary mb-2">@perlanegra.it</h2>
                        <p className="text-text-muted">
                            Seguici per ispirazione quotidiana e novità esclusive.
                        </p>
                    </div>
                </Reveal>

                {/* Single Image Display */}
                <div className="flex justify-center items-center w-full">
                    <Reveal delay={0.2} width="100%" className="flex justify-center">
                        <a
                            href="https://instagram.com/perlanegra.it"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full max-w-md hover:opacity-95 transition-opacity duration-300"
                        >
                            <img
                                src="/instagram/instagram_placeholder.png"
                                alt="Perla Negra Instagram"
                                className="w-full h-auto object-contain rounded-lg shadow-lg"
                            />
                        </a>
                    </Reveal>
                </div>

                {/* Button */}
                <Reveal delay={0.4}>
                    <div className="mt-10 text-center">
                        <a
                            href="https://instagram.com/perlanegra.it"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors border-b border-accent/0 hover:border-accent pb-1"
                        >
                            VISITA IL NOSTRO PROFILO
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

export default InstagramSection;
