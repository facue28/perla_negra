import { memo, useCallback, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { Product } from '@/features/products/types';

// Helper function to properly capitalize product names
const toTitleCase = (str: string | undefined): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

interface ProductCardProps {
    product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
    const { addItem } = useCart();

    const handleQuickAdd = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} aggiunto al carrello`);
    }, [addItem, product]);

    return (
        <Link
            to={`/prodotti/${product.slug}`}
            className="block group relative bg-background-alt rounded-3xl overflow-hidden border border-border/10 transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(63,255,193,0.15)] hover:border-accent/40"
        >
            {/* Image Container */}
            <div className="aspect-square overflow-hidden bg-white relative p-0 flex-shrink-0">
                {/* Actual Image Center */}
                <div className="w-full h-full relative z-10 transition-transform duration-500 ease-out group-hover:scale-105">
                    {/* Primary Image */}
                    <LazyLoadImage
                        src={getOptimizedImageUrl(product.image, { width: 400 })}
                        alt={product.name}
                        effect="blur"
                        onError={(e: any) => {
                            const currentSrc = e.target.src;
                            if (currentSrc.includes('-min.webp')) {
                                // Fallback to original image if thumbnail is missing
                                e.target.src = product.image;
                            } else if (product.fallbackImage && currentSrc !== product.fallbackImage) {
                                // Fallback to category placeholder if everything else fails
                                e.target.src = product.fallbackImage;
                            } else {
                                // Final fallback: Generic placeholder
                                e.target.src = '/placeholder-product.webp';
                            }
                        }}
                        className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
                        wrapperClassName="w-full h-full !block"
                    />
                </div>


                {/* Quick Add Button - Floating on Image */}
                <div className="absolute bottom-4 left-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <button
                        onClick={handleQuickAdd}
                        title="Aggiungi al carrello"
                        className="w-full bg-accent text-background-dark py-2.5 rounded-full shadow-lg hover:bg-accent-hover active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                    >
                        <ShoppingCart size={16} className="fill-current" />
                        <span>Aggiungi al carrello</span>
                    </button>
                </div>

                {/* Badges for Sub-categories */}
                {(product.productFilter || product.targetAudience) && (
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 items-end">
                        {product.productFilter && (
                            <span className="bg-background-dark/80 backdrop-blur-sm text-accent border border-accent/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {product.productFilter.charAt(0).toUpperCase() + product.productFilter.slice(1).toLowerCase()}
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
                    <h3 className="text-text-primary font-medium text-sm md:text-lg mb-1 group-hover:text-accent transition-colors">
                        {toTitleCase(product.name)}
                    </h3>
                    <p className="text-text-muted text-[10px] md:text-xs mb-2 md:mb-3 min-h-[2em] md:min-h-[3em] flex items-center justify-center line-clamp-2 leading-tight first-letter:uppercase">
                        {product.subtitle}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center mt-2 gap-2 md:gap-4">
                    <span className="text-accent font-bold text-base md:text-lg">€{product.price.toFixed(2)}</span>
                    <span className="hidden md:block bg-accent text-background-dark px-6 py-1.5 rounded-full text-xs md:text-sm font-bold group-hover:bg-accent-hover transition-colors w-full md:w-auto">
                        Vedi
                    </span>
                </div>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
