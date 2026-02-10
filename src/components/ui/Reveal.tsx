import React, { useRef, useEffect, ReactNode } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface RevealProps {
    children: ReactNode;
    delay?: number;
    width?: "100%" | "fit-content" | string;
    className?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, width = "100%", className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls]);

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                            delay: delay
                        }
                    }
                }}
                initial="hidden"
                animate={mainControls}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default Reveal;
