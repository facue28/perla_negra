import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, Variants } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';

const Navbar = (): React.ReactElement => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const location = useLocation();
    const { user } = useAuth();

    const { getCartCount } = useCart();
    const cartCount = getCartCount();

    const navLinks = [
        { name: 'PRODOTTI', path: '/productos' },
        { name: 'RIVENDITORI', path: '/revendedores' },
        { name: 'CHI SONO', path: '/chi-sono' },
        { name: 'CONTATTI', path: '/contacto' },
    ];

    const [isHidden, setIsHidden] = useState<boolean>(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest: number) => {
        const previous = scrollY.getPrevious();
        // Only hide when scrolling DOWN and past 150px
        // Show when scrolling UP or at top
        if (latest > previous && latest > 150) {
            setIsHidden(true);
        } else if (latest < previous || latest <= 150) {
            setIsHidden(false);
        }
    });

    // Protect Performance: Hide static shell on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const shell = document.getElementById('static-nav-shell');
            if (shell) {
                shell.style.opacity = '0';
                setTimeout(() => {
                    shell.style.display = 'none';
                }, 300);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const menuVariants: Variants = {
        initial: { opacity: 0, y: "-100%" },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: {
            opacity: 0,
            y: "-100%",
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as const,
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    const linkVariants = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30 }
    };

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={isHidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 w-full z-50 bg-background-dark/90 backdrop-blur-md border-b border-border/10 transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 relative z-50">

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-text-primary hover:text-accent transition-colors p-2 rounded-full active:bg-white/5"
                            aria-label="Menu"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none">
                        <Link to="/" className="flex flex-col items-center group" onClick={() => setIsOpen(false)}>
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
                                className={`text-sm font-medium transition-colors tracking-wide ${location.pathname === link.path ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-6">
                        <Link
                            to={user ? "/admin" : "/login"}
                            className={`hover:text-accent transition-colors hidden sm:block ${location.pathname.startsWith('/admin') || location.pathname === '/login' ? 'text-accent' : 'text-text-primary'}`}
                            aria-label={user ? "Dashboard" : "Login"}
                        >
                            <User size={20} />
                        </Link>
                        <Link to="/carrito" className={`hover:text-accent transition-colors relative ${location.pathname === '/carrito' ? 'text-accent' : 'text-text-primary'}`} aria-label="Carrello" onClick={() => setIsOpen(false)}>
                            {/* Animated Container for Icon */}
                            <motion.div
                                key={cartCount}
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

            {/* Premium Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-0 bg-background-dark/98 backdrop-blur-2xl z-40 flex flex-col items-center justify-center min-h-screen"
                    >
                        {/* Background Blobs */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                            <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[100px]" />
                            <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[100px]" />
                        </div>

                        <div className="flex flex-col items-center space-y-8 relative z-10 w-full px-8">
                            {navLinks.map((link) => (
                                <motion.div key={link.name} variants={linkVariants} className="w-full text-center">
                                    <Link
                                        to={link.path}
                                        className={`block text-3xl font-serif transition-colors py-2 ${location.pathname === link.path ? 'text-accent' : 'text-text-primary hover:text-accent'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                    <div className="w-12 h-[1px] bg-white/10 mx-auto mt-4" />
                                </motion.div>
                            ))}

                            <motion.div variants={linkVariants} className="pt-8 flex flex-col gap-6 items-center w-full">
                                <Link
                                    to={user ? "/admin" : "/login"}
                                    className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User size={20} />
                                    <span className="text-lg">{user ? "Dashboard" : "Acceso Admin"}</span>
                                </Link>

                                <div className="text-xs text-text-muted/40 tracking-widest uppercase mt-8">
                                    Perla Negra • Italia
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
