import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ScrollIndicator: React.FC = () => {
    const scrollToContent = (): void => {
        window.scrollTo({
            top: window.innerHeight * 0.75,
            behavior: 'smooth'
        });
    };

    return (
        <motion.button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 cursor-pointer group"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            aria-label="Scroll to see more content"
        >
            <span className="text-xs text-text-muted uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Scopri di più
            </span>
            <motion.div
                className="w-8 h-12 border-2 border-accent/50 rounded-full flex items-start justify-center p-2"
                animate={{
                    borderColor: ['rgba(63, 255, 193, 0.3)', 'rgba(63, 255, 193, 0.8)', 'rgba(63, 255, 193, 0.3)']
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                <motion.div
                    animate={{
                        y: [0, 12, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                >
                    <ChevronDown className="w-4 h-4 text-accent" />
                </motion.div>
            </motion.div>
        </motion.button>
    );
};

export default ScrollIndicator;
