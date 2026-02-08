import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/ui/SEO';
// import InstagramSection from '@/components/layout/InstagramSection'; // Lazy loaded below
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import B2BTeaserSection from '@/components/layout/B2BTeaserSection';
import InfiniteMarquee from '@/components/ui/InfiniteMarquee';

const InstagramSection = lazy(() => import('@/components/layout/InstagramSection'));

const MotionLink = motion(Link);

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.3
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const HomePage: React.FC = () => {
    const [currentBg, setCurrentBg] = useState<number>(0);
    const backgrounds: string[] = [
        '/hero/silk.webp',
        '/hero/feather.webp',
        '/hero/glass.webp',
        '/hero/liquid.webp',
        '/hero/smoke.webp'
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [backgrounds.length]);

    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 1000], [0, 400]);
    const yText = useTransform(scrollY, [0, 500], [0, 100]);

    return (
        <>
            <div className="flex-grow relative bg-background-dark text-white pt-24 text-center flex flex-col items-center justify-center overflow-hidden min-h-[80vh]">
                {/* Background Carousel */}
                <motion.div
                    style={{ y: yBg }}
                    className="absolute inset-0 z-0 h-[120%] -top-[10%]"
                >
                    {backgrounds.map((bg, index) => (
                        <div
                            key={bg}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <picture>
                                <source
                                    media="(max-width: 768px)"
                                    srcSet={bg.replace('.webp', '-mobile.webp')}
                                    width="1080"
                                    height="1920"
                                />
                                <source
                                    media="(min-width: 769px)"
                                    srcSet={bg}
                                    width="1920"
                                    height="1080"
                                />
                                <img
                                    src={bg}
                                    alt="Fondo decorativo Perla Negra"
                                    aria-hidden="true"
                                    className="w-full h-full object-cover opacity-60"
                                    width="1920"
                                    height="1080"
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                />
                            </picture>
                        </div>
                    ))}
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent z-10" />
                </motion.div>

                {/* Content */}
                <motion.div
                    className="relative z-20 flex flex-col items-center justify-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ y: yText }}
                >
                    <SEO
                        title="Home"
                        description="Perla Negra - Intimità Elegante. Scopri la nostra collezione esclusiva di prodotti per il benessere sessuale."
                        structuredData={{
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "Perla Negra",
                            "url": "https://perlanegra.shop",
                            "sameAs": [
                                "https://instagram.com/perlanegra.it"
                            ]
                        }}
                    />
                    <motion.h1 className="text-4xl md:text-6xl font-serif mb-6 drop-shadow-lg" variants={itemVariants}>
                        INTIMITÀ <span className="text-accent">ELEGANTE</span>
                    </motion.h1>
                    <motion.p className="text-text-muted mb-8 max-w-2xl px-4 drop-shadow-md" variants={itemVariants}>
                        Scopri Perla Negra. Piacere, eleganza e discrezione in ogni detalle.
                    </motion.p>
                    <motion.div className="flex gap-4" variants={itemVariants}>
                        <MotionLink
                            to="/productos"
                            className="bg-accent text-background-dark px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-accent/20"
                            whileHover={{ scale: 1.02, backgroundColor: '#32cc9a' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            VEDI PRODOTTI
                        </MotionLink>
                        <MotionLink
                            to="/chi-sono"
                            className="border border-text-muted text-text-primary px-8 py-3 rounded-full font-medium backdrop-blur-sm bg-black/10"
                            whileHover={{ scale: 1.02, borderColor: '#3FFFC1', color: '#3FFFC1' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            CHI SONO
                        </MotionLink>
                    </motion.div>
                </motion.div>
            </div>

            {/* Infinite Marquee - Visual Separator */}
            <InfiniteMarquee />

            {/* B2B Teaser Section */}
            <B2BTeaserSection />

            {/* Lazy Load Instagram Section */}
            <Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-background-light/5"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
                <InstagramSection />
            </Suspense>
        </>
    );
};

export default HomePage;
