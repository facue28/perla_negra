import { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const Reveal = ({ children, delay = 0, width = "100%", className = "" }) => {
    const ref = useRef(null);
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
