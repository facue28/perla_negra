import { Link } from 'react-router-dom';
import bgShape from '@/assets/images/products-page.png';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.name} aggiunto al carrello`);
    };

    return (
        <Link to={`/productos/${product.slug}`} className="block group relative bg-background-alt rounded-3xl overflow-hidden border border-border/10 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(63,255,193,0.15)] transition-all duration-300 h-full flex flex-col">
            {/* Image Container */}
            <div className="aspect-square overflow-hidden bg-background relative p-4 flex-shrink-0">
                {/* Circular Background Effect from Design */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundImage: `url(${bgShape})` }}
                ></div>

                {/* Actual Image Center */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Quick Add Button - Floating on Image */}
                <div className="absolute bottom-4 left-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <button
                        onClick={handleQuickAdd}
                        className="w-full bg-accent text-background-dark py-2.5 rounded-full shadow-lg hover:bg-accent-hover active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                        title="Aggiungi al carrello"
                    >
                        <ShoppingCart size={16} className="fill-current" />
                        <span>Aggiungi al carrello</span>
                    </button>
                </div>

                {/* Overlay Logo/Brand (Optional decorative) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-50">
                    {/* Small logo placeholder if needed */}
                </div>
            </div>

            {/* Content */}
            <div className="p-3 md:p-4 text-center flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-text-primary font-medium text-sm md:text-lg mb-1 group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-text-muted text-[10px] md:text-xs mb-2 md:mb-3 min-h-[2em] md:min-h-[3em] flex items-center justify-center line-clamp-2 leading-tight first-letter:uppercase">{product.subtitle}</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center mt-2 gap-2 md:gap-4">
                    <span className="text-accent font-bold text-base md:text-lg">${product.price.toFixed(2)}</span>
                    <span className="hidden md:block bg-accent text-background-dark px-6 py-1.5 rounded-full text-xs md:text-sm font-bold group-hover:bg-accent-hover transition-colors w-full md:w-auto">
                        Ver
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
