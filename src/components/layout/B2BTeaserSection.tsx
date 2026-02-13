import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

const B2BTeaserSection: React.FC = () => {
    return (
        <section id="b2b-section" className="py-24 bg-gradient-to-b from-background-dark to-zinc-900/30 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-zinc-900/30 backdrop-blur-sm rounded-[2rem] p-8 md:p-16 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 group hover:border-accent/20 transition-colors duration-500"
                >
                    {/* Text Content */}
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-accent text-sm font-bold tracking-widest uppercase mb-4">
                            <TrendingUp size={16} />
                            <span>B2B & Partnership</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
                            Porta l'Eccellenza <br />
                            <span className="text-text-muted italic">nel tuo Business.</span>
                        </h2>
                        <p className="text-text-muted text-lg leading-relaxed mb-0">
                            Sei un professionista o hai un negozio? Unisciti al programma rivenditori Perla Negra per accedere a listini esclusivi, supporto dedicato e prodotti che definiscono il lusso.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/rivenditori"
                            className="inline-flex items-center gap-2 bg-accent text-background-dark px-10 py-5 rounded-full font-bold text-lg hover:bg-accent-light transition-all shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] transform hover:-translate-y-1 active:scale-95 group/btn"
                        >
                            <span className="relative z-10">DIVENTA PARTNER</span>
                            <ArrowRight size={20} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default B2BTeaserSection;
