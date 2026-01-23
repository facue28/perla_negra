import { Link } from 'react-router-dom';
import bgShape from '@/assets/images/products-page.png';

const ProductCard = ({ product }) => {
    return (
        <Link to={`/productos/${product.slug}`} className="block group relative bg-background-alt rounded-3xl overflow-hidden border border-border/10 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(63,255,193,0.15)] transition-all duration-300">
            {/* Image Container */}
            <div className="aspect-square overflow-hidden bg-background relative p-4">
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

                {/* Overlay Logo/Brand (Optional decorative) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-50">
                    {/* Small logo placeholder if needed */}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 text-center">
                <h3 className="text-text-primary font-medium text-lg mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
                <p className="text-text-muted text-xs mb-3 h-8 flex items-center justify-center overflow-hidden">{product.subtitle}</p>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-accent font-bold text-lg">${product.price.toFixed(2)}</span>
                    <span className="bg-accent text-background-dark px-4 py-1.5 rounded-full text-sm font-bold group-hover:bg-accent-hover transition-colors">
                        Vedi dettaglio
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
