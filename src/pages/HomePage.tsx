import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/ui/SEO';
// import InstagramSection from '@/components/layout/InstagramSection'; // Lazy loaded below
import { motion, useScroll, useTransform } from 'framer-motion';
import B2BTeaserSection from '@/components/layout/B2BTeaserSection';
import InfiniteMarquee from '@/components/ui/InfiniteMarquee';

const InstagramSection = lazy(() => import('@/components/layout/InstagramSection'));

const MotionLink = motion(Link);

/**
 * ⚠️ CRITICAL LCP OPTIMIZATION ⚠️
 * 
 * This component uses the "Static Shell + React Islands" pattern for <4s LCP.
 * 
 * - The Hero (H1 + CTAs + Background) is rendered in index.html OUTSIDE #root
 * - React does NOT render ANY hero content until user interaction
 * - On interaction: React fades in dynamic hero AS AN OVERLAY (position:absolute) and removes static shell
 * 
 * DO NOT:
 * - Render H1, subtitle, or CTAs before heroActive is true
 * - Add hero background images before interaction
 * - Modify activation logic without validating LCP impact
 * - Change position:absolute to fixed (will cause scroll overlay issue)
 * 
 * Validation: npm run lighthouse:mobile -- LCP element MUST be from #static-hero-shell
 */

const HomePage: React.FC = () => {
    const [heroActive, setHeroActive] = useState<boolean>(false);
    const [currentBg, setCurrentBg] = useState<number>(0);

    const backgrounds: string[] = [
        '/hero/silk.webp',
        '/hero/feather.webp',
        '/hero/glass.webp',
        '/hero/liquid.webp',
        '/hero/smoke.webp'
    ];

    // Activate React hero after interaction OR long timeout (outside LCP window)
    useEffect(() => {
        const activationTimer = setTimeout(() => {
            setHeroActive(true);
        }, 10000); // 10 second fallback (well outside LCP measurement)

        const handleInteraction = () => {
            setHeroActive(true);
            clearTimeout(activationTimer);
        };

        // Trigger on first scroll or pointerdown
        window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
        window.addEventListener('pointerdown', handleInteraction, { once: true });

        return () => {
            clearTimeout(activationTimer);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('pointerdown', handleInteraction);
        };
    }, []);

    // Handoff: Remove or hide static shell when React hero is active
    useEffect(() => {
        if (heroActive) {
            const handoffTimer = setTimeout(() => {
                const staticShell = document.getElementById('static-hero-shell');
                if (staticShell) {
                    // 1. Remove the class that 'reveals' the static shell in CSS
                    document.documentElement.classList.remove('is-home');

                    // 2. Fade out for smooth transition
                    staticShell.style.opacity = '0';
                    staticShell.style.transition = 'opacity 0.3s ease-out';

                    // 3. Remove from layout completely
                    setTimeout(() => {
                        staticShell.style.display = 'none';
                    }, 300);
                }
            }, 800); // Hide after React hero fade-in starts

            return () => clearTimeout(handoffTimer);
        }
    }, [heroActive]);

    // Carousel rotation - only when hero is active
    useEffect(() => {
        if (!heroActive) return;

        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgrounds.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [heroActive, backgrounds.length]);

    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 1000], [0, 400]);

    return (
        <>
            {/* Hero Container - Wraps both static and React heroes */}
            <div className="relative" style={{ minHeight: '80vh' }}>
                {/* React Hero Section - ONLY renders when active (post-interaction) */}
                {/* CRITICAL: Uses position:absolute to OVERLAY the static shell within container, allows scroll */}
                {heroActive && (
                    <div className="absolute inset-0 w-full h-full bg-transparent text-white text-center flex flex-col items-center justify-center overflow-hidden" style={{ zIndex: 5 }}>
                        {/* Dynamic Carousel Background */}
                        <motion.div
                            style={{ y: yBg }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2 }}
                            className="absolute inset-0 z-0 h-full w-full"
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
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : undefined}
                                            decoding="async"
                                        />
                                    </picture>
                                </div>
                            ))}
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent z-10" />
                        </motion.div>

                        {/* Content */}
                        <div className="relative z-20 flex flex-col items-center justify-center pt-24">
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
                            <h1 className="text-4xl md:text-6xl font-serif mb-6 drop-shadow-lg text-white">
                                INTIMITÀ <span className="text-accent">ELEGANTE</span>
                            </h1>

                            <motion.p
                                className="text-text-muted mb-8 max-w-2xl px-4 drop-shadow-md"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Scopri Perla Negra. Piacere, eleganza e discrezione in ogni detalle.
                            </motion.p>
                            <motion.div
                                className="flex gap-4 flex-wrap justify-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
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
                        </div>
                    </div>
                )}
            </div>

            {/* Below-the-fold content: ALWAYS rendered (improves SEO + perceived performance) */}
            <InfiniteMarquee />
            <B2BTeaserSection />

            {/* Lazy Load Instagram Section */}
            <Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-background-light/5"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
                <InstagramSection />
            </Suspense>
        </>
    );
};

export default HomePage;
