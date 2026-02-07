import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls, Variants } from 'framer-motion';

type DrawerSide = 'right' | 'left' | 'bottom';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    side?: DrawerSide;
}

interface SideVariant {
    initial: any;
    animate: any;
    exit: any;
    style: string;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, side = 'right' }) => {

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const controls = useDragControls();

    const sideVariants: Record<DrawerSide, SideVariant> = {
        right: {
            initial: { x: '100%' },
            animate: { x: 0 },
            exit: { x: '100%' },
            style: 'inset-y-0 right-0 h-full w-full md:w-auto md:max-w-md border-l border-white/10'
        },
        left: {
            initial: { x: '-100%' },
            animate: { x: 0 },
            exit: { x: '-100%' },
            style: 'inset-y-0 left-0 h-full w-full md:w-auto md:max-w-md border-r border-white/10'
        },
        bottom: {
            initial: { y: '100%' },
            animate: { y: 0 },
            exit: { y: '100%' },
            style: 'inset-x-0 bottom-0 h-[85vh] border-t border-white/10 rounded-t-[2rem]'
        }
    };

    const currentVariant = sideVariants[side];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px]"
                        onClick={onClose}
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={currentVariant.initial}
                        animate={currentVariant.animate}
                        exit={currentVariant.exit}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag={side === 'bottom' ? "y" : false}
                        dragControls={controls}
                        dragListener={false}
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 400) {
                                onClose();
                            }
                        }}
                        className={`fixed z-50 bg-zinc-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] flex flex-col ${currentVariant.style}`}
                    >
                        {/* Drag Handle Area (Header & Handle) */}
                        <div
                            className="touch-none"
                            onPointerDown={(e) => controls.start(e)}
                            style={{ cursor: side === 'bottom' ? 'grab' : 'auto' }}
                        >
                            {/* Drag Handle (Visual) */}
                            {side === 'bottom' && (
                                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                                    <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <h2 className="text-xl font-bold font-serif text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-text-muted hover:text-accent transition-colors rounded-full hover:bg-white/5"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Drawer;
