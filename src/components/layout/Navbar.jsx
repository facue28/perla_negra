import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { getCartCount } = useCart();
    const cartCount = getCartCount();

    const navLinks = [
        { name: 'HOME', path: '/' },
        { name: 'PRODOTTI', path: '/productos' },
        { name: 'BUSINESS', path: '/revendedores' },
        { name: 'CHI SONO', path: '/chi-sono' },
        { name: 'CONTATTI', path: '/contacto' },
    ];

    const [isHidden, setIsHidden] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setIsHidden(true);
        } else {
            setIsHidden(false);
        }
    });

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={isHidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/10 transition-colors duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-text-primary hover:text-accent" aria-label="Menu">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none">
                        <Link to="/" className="flex flex-col items-center group">
                            <span className="font-serif text-2xl tracking-widest text-text-primary group-hover:text-accent transition-colors">PERLA</span>
                            <span className="font-serif text-2xl tracking-widest text-text-primary group-hover:text-accent transition-colors -mt-2">NEGRA</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-medium text-text-muted hover:text-accent transition-colors tracking-wide"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-6">
                        <button className="text-text-primary hover:text-accent transition-colors hidden sm:block" aria-label="Account">
                            <User size={20} />
                        </button>
                        <Link to="/carrito" className="text-text-primary hover:text-accent transition-colors relative" aria-label="Carrello">
                            {/* Animated Container for Icon */}
                            <motion.div
                                key={cartCount} // Re-triggers animation when count changes
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.3 }}
                            >
                                <ShoppingBag size={20} />
                            </motion.div>

                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        key="badge"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-2 -right-2 bg-accent text-background-dark text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-background-alt border-b border-border/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-accent hover:bg-background-dark"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </motion.nav>
    );
};

export default Navbar;
