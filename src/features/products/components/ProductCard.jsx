import { Link } from 'react-router-dom';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.name} aggiunto al carrello`);
    };

    return (
        <MotionLink
            to={`/productos/${product.slug}`}
            className="block group relative bg-background-alt rounded-3xl overflow-hidden border border-border/10 transition-colors duration-300 h-full flex flex-col"
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={{
                rest: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
                hover: {
                    y: -4,
                    borderColor: "rgba(63,255,193,0.5)",
                    boxShadow: "0 0 20px rgba(63,255,193,0.15)",
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                },
                tap: { scale: 0.98, transition: { duration: 0.12 } }
            }}
        >
            {/* Image Container */}
            <div className="aspect-square overflow-hidden bg-neutral-800/30 relative p-4 flex-shrink-0">
                {/* Actual Image Center */}
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain relative z-10 rounded-2xl"
                    variants={{
                        rest: { scale: 1 },
                        hover: { scale: 1.05, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }
                    }}
                />

                {/* Quick Add Button - Floating on Image */}
                <div className="absolute bottom-4 left-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <motion.button
                        onClick={handleQuickAdd}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-accent text-background-dark py-2.5 rounded-full shadow-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                        title="Aggiungi al carrello"
                    >
                        <ShoppingCart size={16} className="fill-current" />
                        <span>Aggiungi al carrello</span>
                    </motion.button>
                </div>

                {/* Badges for Sub-categories */}
                {(product.usageArea || product.targetAudience) && (
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 items-end">
                        {product.usageArea && (
                            <span className="bg-background-dark/80 backdrop-blur-sm text-accent border border-accent/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {product.usageArea.charAt(0).toUpperCase() + product.usageArea.slice(1).toLowerCase()}
                            </span>
                        )}
                        {product.targetAudience && (
                            <span className="bg-purple-900/80 backdrop-blur-sm text-white border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {product.targetAudience.charAt(0).toUpperCase() + product.targetAudience.slice(1).toLowerCase()}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 md:p-4 text-center flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-text-primary font-medium text-sm md:text-lg mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
                    <p className="text-text-muted text-[10px] md:text-xs mb-2 md:mb-3 min-h-[2em] md:min-h-[3em] flex items-center justify-center line-clamp-2 leading-tight first-letter:uppercase">{product.subtitle}</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center mt-2 gap-2 md:gap-4">
                    <span className="text-accent font-bold text-base md:text-lg">${product.price.toFixed(2)}</span>
                    <span className="hidden md:block bg-accent text-background-dark px-6 py-1.5 rounded-full text-xs md:text-sm font-bold group-hover:bg-accent-hover transition-colors w-full md:w-auto">
                        Vedi
                    </span>
                </div>
            </div>
        </MotionLink>
    );
};


export default ProductCard;
