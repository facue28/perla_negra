import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/ui/SEO';
import InstagramSection from '@/components/layout/InstagramSection';
import { motion, useScroll, useTransform } from 'framer-motion';
import B2BTeaserSection from '@/components/layout/B2BTeaserSection';
import InfiniteMarquee from '@/components/ui/InfiniteMarquee';

const MotionLink = motion(Link);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.3 // Wait for page transition
        }
    }
};

const itemVariants = {
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

const HomePage = () => {
    const [currentBg, setCurrentBg] = useState(0);
    const backgrounds = [
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
    }, []);

    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 1000], [0, 400]); // Moves background slower than scroll
    const yText = useTransform(scrollY, [0, 500], [0, 100]); // Adds slight float to text too

    return (
        <>
            <div className="flex-grow relative bg-background-dark text-white pt-24 text-center flex flex-col items-center justify-center overflow-hidden min-h-[80vh]">
                {/* Background Carousel */}
                {/* Background Carousel - Parallax Wrapper */}
                <motion.div
                    style={{ y: yBg }}
                    className="absolute inset-0 z-0 h-[120%] -top-[10%]" // Made taller to avoid gaps on scroll
                >
                    {backgrounds.map((bg, index) => (
                        <div
                            key={bg}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img
                                src={bg}
                                alt="Fondo decorativo Perla Negra"
                                aria-hidden="true"
                                className="w-full h-full object-cover opacity-60"
                                width="1920"
                                height="1080"
                                fetchPriority={index === 0 ? "high" : "auto"}
                                loading={index === 0 ? "eager" : "lazy"}
                            />
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
                    style={{ y: yText }} // Text moves slightly for depth
                >
                    <SEO
                        title="Home"
                        description="Perla Negra - Intimità Elegante. Scopri la nostra collezione esclusiva di prodotti per il benessere sessuale."
                    />
                    <motion.h1 className="text-4xl md:text-6xl font-serif mb-6 drop-shadow-lg" variants={itemVariants}>
                        INTIMITÀ <span className="text-accent">ELEGANTE</span>
                    </motion.h1>
                    <motion.p className="text-text-muted mb-8 max-w-2xl px-4 drop-shadow-md" variants={itemVariants}>
                        Scopri Perla Negra. Piacere, eleganza e discrezione in ogni dettaglio.
                    </motion.p>
                    <motion.div className="flex gap-4" variants={itemVariants}>
                        <MotionLink
                            to="/productos"
                            className="bg-accent text-background-dark px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-accent/20"
                            whileHover={{ scale: 1.02, backgroundColor: '#32cc9a' }} // accent-hover hex
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

            <InstagramSection />
        </>
    );
};

export default HomePage;
