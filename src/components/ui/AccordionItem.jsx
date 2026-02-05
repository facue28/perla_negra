import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border/20 rounded-2xl overflow-hidden bg-background-alt/50">
            {/* Header - Clickable */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors group"
            >
                <h3 className="text-text-primary font-medium text-lg group-hover:text-accent transition-colors">
                    {title}
                </h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="text-accent"
                >
                    <ChevronDown size={20} />
                </motion.div>
            </button>

            {/* Content - Animated */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 py-4 border-t border-border/10">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccordionItem;
