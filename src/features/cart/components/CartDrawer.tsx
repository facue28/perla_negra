import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const CartDrawer: React.FC = () => {
    const { isOpen, setIsOpen, items, removeItem, updateQuantity, subtotal } = useCart();
    const navigate = useNavigate();

    // Prevent body scrolling when the drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Format text string for consistent capitalization
    const formatText = (text: string | null | undefined): string => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const handleCheckoutClick = () => {
        setIsOpen(false);
        navigate('/carrello');
    };

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };

    const drawerVariantsDesktop = {
        hidden: { x: '100%', transition: { type: 'spring', damping: 25, stiffness: 200 } },
        visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
    };

    // Use responsive variant based purely on CSS classes later, but conceptually:
    const drawerVariantsMobile = {
        hidden: { y: '100%', transition: { type: 'spring', damping: 25, stiffness: 200 } },
        visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
        exit: { y: '100%', transition: { ease: 'easeInOut', duration: 0.3 } } // Fast exit
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop / Overlay */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                        aria-hidden="true"
                    />

                    {/* 
                        Drawer Container 
                        - Mobile: Bottom Sheet (rounded top, stuck to bottom)
                        - Desktop: Right Side Panel (full height, stuck to right)
                    */}
                    <motion.div
                        className={`
                            fixed z-[210] flex flex-col bg-background-alt overflow-hidden
                            /* Mobile Styles (Bottom Sheet) */
                            bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                            /* Desktop Styles (Right Panel) */
                            md:top-0 md:bottom-auto md:left-auto md:right-0 md:w-[450px] md:h-full md:rounded-none md:shadow-[-10px_0_40px_rgba(0,0,0,0.5)]
                        `}
                        // We use a trick: animate both x and y. Since CSS handles positioning,
                        // on mobile x=100% won't matter if left/right are 0. Actually, better to use discrete variants.
                        // For simplicity in framer-motion responsive design without hook re-renders, 
                        // we'll rely on a unified animation that handles the primary axis.
                        initial={{ opacity: 0, scale: 0.95, y: 50, x: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 50, x: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="bg-accent/10 p-2 rounded-full">
                                    <ShoppingBag size={20} className="text-accent" />
                                </div>
                                <h2 className="text-xl font-serif text-white m-0">Il Tuo Carrello</h2>
                                <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                    {items.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Middle: Cart Items (Scrollable) */}
                        <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                                    <ShoppingBag size={48} className="text-text-muted mb-2" />
                                    <p className="text-lg text-text-primary">Il tuo carrello è vuoto</p>
                                    <p className="text-sm text-text-muted">Aggiungi dei prodotti per iniziare l'acquisto.</p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="mt-4 px-6 py-2 border border-accent text-accent rounded-full text-sm font-medium hover:bg-accent/10 transition-colors"
                                    >
                                        Continua lo shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 bg-background-dark/30 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">

                                            {/* Item Image */}
                                            <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 relative">
                                                <LazyLoadImage
                                                    src={getOptimizedImageUrl(item.image, { width: 100 }) || item.fallbackImage}
                                                    alt={item.name}
                                                    effect="blur"
                                                    className="w-full h-full object-contain p-2 mix-blend-multiply"
                                                />
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex flex-col flex-1 justify-between py-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                                                            {formatText(item.name)}
                                                        </h3>
                                                        <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                                                            {item.size || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id as string)}
                                                        className="text-text-muted hover:text-red-400 p-1 -mt-1 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center bg-background rounded-full border border-white/10">
                                                        <button
                                                            onClick={() => updateQuantity(item.id as string, Math.max(1, item.quantity - 1))}
                                                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-medium text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id as string, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="font-bold text-accent">€{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer: Subtotal and Actions */}
                        {items.length > 0 && (
                            <div className="border-t border-white/5 bg-background-alt p-5 md:p-6 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-white">
                                    <span className="text-text-muted">Subtotale ({items.length} prod.)</span>
                                    <span className="text-2xl font-bold">€{subtotal.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-text-muted text-center">Spedizione calcolata al Checkout</p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleCheckoutClick}
                                        className="w-full bg-accent text-background-dark py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#2fe8a8] hover:shadow-[0_0_20px_rgba(63,255,193,0.3)] transition-all active:scale-[0.98]"
                                    >
                                        Vai al Carrello <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
