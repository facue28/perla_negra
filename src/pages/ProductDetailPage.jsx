import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import SEO from '@/components/ui/SEO';
import Reveal from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ProductCard from '@/features/products/components/ProductCard';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';
import AccordionItem from '@/components/ui/AccordionItem';

// Helper function to properly capitalize product names
const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const ProductDetailPage = () => {
    const { slug } = useParams();

    const { addToCart } = useCart();

    const { products, loading } = useProducts();
    const product = products.find(p => p.slug === slug);

    // Zoom State
    const [isHovering, setIsHovering] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    // Image Gallery State
    const [activeImage, setActiveImage] = useState(null);
    const [image2Error, setImage2Error] = useState(false); // 🆕 Track if secondary image is broken

    // Initialize active image when product loads
    useEffect(() => {
        if (product) {
            setActiveImage(product.image);
            setImage2Error(false); // Reset error state ONLY when changing products
        }
    }, [slug]); // ⚡ Fix: Use slug instead of product object to avoid re-renders resetting state

    // Product State (Restored)
    const [quantity, setQuantity] = useState(1);

    // Reset quantity when slug changes (new product loaded)
    useEffect(() => {
        setQuantity(1);
    }, [slug]);

    // Sticky Mobile Bar Logic
    const [showStickyBar, setShowStickyBar] = useState(false);

    // Force scroll to top instantly on mount to prevent "stuck at bottom"
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        const handleScroll = () => {
            // Show when scrolled past 500px (roughly past main image/hero on mobile)
            const threshold = 500;
            setShowStickyBar(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track View Item - Must be before any conditional returns (Rules of Hooks)
    useEffect(() => {
        if (product) {
            trackViewItem(product);
        }
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark py-6 flex flex-col pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        {/* Image Skeleton */}
                        <Skeleton className="h-[500px] w-full rounded-3xl" />
                        {/* Content Skeleton */}
                        <div className="space-y-6 pt-8">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2 opacity-70" />
                            <div className="flex justify-between py-6">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-16 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Skeleton className="h-12 w-32 rounded-full" />
                                <Skeleton className="h-12 flex-grow rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div className="text-white text-center py-20">Prodotto non trovato</div>;
    }

    const formatText = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        trackAddToCart(product, quantity); // Analytics
        toast.success(`Aggiunto al carrello: ${product.name} `, {
            description: `${quantity} x ${product.name} `
        });
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    // Helper to generate invented content
    const getMockData = (category) => {
        switch (category) {
            case 'Lubricantes': // Keeping category keys as they match DB potentially, but content must be IT
                return {
                    usage: "Applicare una piccola quantità sulla zona intima e massaggiare delicatamente. Compatibile con preservativi in lattice. Riapplicare secondo necessità per mantenere l'idratazione e il comfort.",
                    ingredients: "Aqua, Glycerin, Propylene Glycol, Hydroxyethylcellulose, Sodium Benzoate, Polysorbate 20, Disodium EDTA, Lactic Acid.",
                    tips: "Per un'esperienza più intensa, applicane un po' sulle zone erogene prima del contatto. Conservare in un luogo fresco e asciutto, lontano dalla luce solare diretta.",
                    sensation: "Idratante • Setoso • Base Acqua"
                };
            case 'Fragancias':
                return {
                    usage: "Spruzzare sui punti di pulsazione: polsi, collo e dietro le orecchie. Lasciare che la fragranza si assesti senza strofinare. Ideale da usare dopo la doccia.",
                    ingredients: "Alcohol Denat, Aqua (Water), Parfum (Fragrance), Linalool, Limonene, Citronellol, Coumarin, Geraniol.",
                    tips: "I feromoni si attivano con il calore corporeo. Applicalo 15 minuti prima di uscire per farlo fondere con la tua chimica naturale.",
                    sensation: "Seducente • Intenso • Floreale/Legnoso"
                };
            case 'Vigorizzanti': // Formerly Afrodisiacos
                return {
                    usage: "Assumere con abbondante acqua o mescolare con la tua bevanda preferita. Non superare la dose giornaliera raccomandata. Effetto previsto in 30-45 minuti.",
                    ingredients: "Estratto di Maca, Ginseng, L-Arginina, Vitamine del complesso B, Zinco, Guaranà.",
                    tips: "Combinalo con un ambiente rilassato e stimolazione preliminare per massimizzare gli effetti.",
                    sensation: "Stimolante • Energetico • Vigorizzante"
                };
            case 'Olio commestibile':
                return {
                    usage: "Versare una piccola quantità sulle mani o direttamente sul corpo. Massaggiare dolcemente. Essendo commestibile, è sicuro per baci e giochi orali.",
                    ingredients: "Glicerina vegetale, Aroma naturale, Acqua, Saccarina sodica (dolcificante), Coloranti alimentari.",
                    tips: "Soffia delicatamente sulla zona applicata per attivare un piacevole effetto calore che intensifica la sensazione.",
                    sensation: "Gustoso • Riscaldante • Scivoloso"
                };
            case 'Gioco':
                return {
                    usage: "Seguire le regole incluse nella confezione. Stabilire un 'safe word' o limiti chiari con il partner prima di iniziare per garantire un'esperienza divertente e sicura.",
                    ingredients: "Carta di alta qualità, cartone rinforzato, dadi in resina, accessori in tessuto satinato.",
                    tips: "Create l'atmosfera giusta con musica e luci soffuse. Usate il gioco come pretesto per esplorare nuove fantasie e rompere la routine.",
                    sensation: "Divertente • Intrigante • Complice"
                };
            default:
                return {
                    usage: "Utilizzare secondo le istruzioni sulla confezione. Pulire prima e dopo ogni utilizzo con acqua tiepida e sapone neutro o un detergente specifico per giocattoli.",
                    ingredients: "Materiali sicuri per il corpo, privi di ftalati. Silicone di grado medico o ABS.",
                    tips: "Esplora diversi ritmi e pressioni. Inizia delicatamente e aumenta l'intensità in base al tuo comfort.",
                    sensation: "Piacevole • Versatile • Sicuro"
                };
        }
    };

    // Priority: DB fields -> Mock Fallback
    const mockDataFallback = getMockData(product.category);

    // Construct display data using DB fields if available, otherwise use mock
    const displayData = {
        usage: product.usage || mockDataFallback.usage,
        ingredients: product.ingredients || mockDataFallback.ingredients,
        tips: product.tips || mockDataFallback.tips,
        sensation: product.sensation || mockDataFallback.sensation
    };

    // Structured Data for SEO (Rich Snippets)
    // Structured Data for SEO (Rich Snippets)
    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description,
        "sku": product.code || product.slug,
        "mpn": product.code || product.slug,
        "brand": {
            "@type": "Brand",
            "name": product.brand || "Perla Negra"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "EUR",
            "price": product.price,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    return (
        <div className="bg-background-dark min-h-screen py-6 flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <SEO
                key={product.id}
                title={product.name}
                description={`Acquista ${product.name} - ${product.subtitle || product.category} `}
                image={product.image}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">

                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-text-muted mb-4 space-x-2 flex-shrink-0 pt-24">
                    <Link to="/" className="hover:text-accent">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/productos" className="hover:text-accent">Prodotti</Link>
                    <ChevronRight size={14} />
                    <span className="text-accent">{product.category}</span>
                </nav>

                {/* Top Section: Fit to Screen Layout (Desktop) / Scroll (Mobile) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-stretch lg:h-[calc(100vh-140px)] lg:max-h-[700px] h-auto min-h-[600px]">

                    {/* Left: Main Image Card - 40% width on desktop */}
                    <div className="w-full h-full lg:col-span-5 flex flex-col gap-4">
                        <div
                            className="bg-white rounded-3xl overflow-hidden relative border border-border/10 group cursor-crosshair flex-grow w-full flex items-center justify-center p-0 h-[500px] lg:h-auto"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <div style={{
                                width: '100%',
                                height: '100%',
                                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}% `,
                                transform: isHovering ? 'scale(2)' : 'scale(1)',
                                transition: 'transform 0.2s ease-out'
                            }}>
                                <img
                                    src={activeImage || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain rounded-3xl block mix-blend-multiply"
                                />
                            </div>
                        </div>

                        {/* Thumbnails Gallery - Only show if image2 exists AND is valid */}
                        {product.image2 && !image2Error && (
                            <div className="flex gap-3 justify-center h-20 flex-shrink-0">
                                {/* Thumb 1 */}
                                <button
                                    onClick={() => setActiveImage(product.image)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${activeImage === product.image ? 'border-accent shadow-[0_0_10px_rgba(63,255,193,0.3)]' : 'border-border/20 hover:border-accent/50'}`}
                                >
                                    <img src={product.image} alt="Vista principal" className="w-full h-full object-contain p-0 bg-white mix-blend-multiply" />
                                </button>

                                {/* Thumb 2 */}
                                <button
                                    onClick={() => setActiveImage(product.image2)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${activeImage === product.image2 ? 'border-accent shadow-[0_0_10px_rgba(63,255,193,0.3)]' : 'border-border/20 hover:border-accent/50'}`}
                                >
                                    <img
                                        src={product.image2}
                                        alt="Vista secundaria"
                                        className="w-full h-full object-contain p-0 bg-white mix-blend-multiply"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            setImage2Error(true);
                                        }}
                                    />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Info Card - 60% width on desktop */}
                    <div className="flex flex-col h-full overflow-hidden lg:col-span-7">
                        {/* Unified Card - Compact No-Scroll */}
                        <div className="bg-background-alt px-8 py-3 rounded-2xl border border-border/20 flex flex-col h-full justify-center">

                            {/* Header Group */}
                            <div className="mb-4 flex-shrink-0">
                                <h1 className="text-3xl lg:text-4xl font-serif text-text-primary mb-1 line-clamp-1 leading-tight">{toTitleCase(product.name)}</h1>
                                <p className="text-lg text-text-muted font-light italic line-clamp-2">{product.subtitle}</p>
                            </div>

                            {/* Price & Rating */}
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <div className="text-3xl font-bold text-accent">
                                    ${product.price.toFixed(2)}
                                </div>
                                <div className="flex items-center gap-1 bg-background-dark/30 px-3 py-1 rounded-full">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-text-primary">4.9</span>
                                </div>
                            </div>

                            {/* Content Group - Compact */}
                            <div className="space-y-5 flex-grow flex flex-col justify-center">

                                {/* Description */}
                                <p className="text-text-muted text-sm leading-relaxed first-letter:uppercase lg:max-h-[150px] lg:overflow-y-auto lg:pr-2 lg:scrollbar-thin lg:scrollbar-thumb-accent/20 lg:scrollbar-track-transparent">
                                    {product.description || "Lorem ipsum dolor sit amet consectetur. Placerat arcu at non consequat phasellus mi morbi maecenas."}
                                </p>

                                {/* Interactive Section: Quantity + Add to Cart Row */}
                                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center lg:justify-center">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-border/30 rounded-full bg-background-dark/50 px-2 min-w-[120px] h-[52px]">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-full flex items-center justify-center text-text-muted hover:text-accent text-lg"
                                        >
                                            -
                                        </button>
                                        <div className="flex-grow text-center font-bold text-text-primary">{quantity}</div>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-10 h-full flex items-center justify-center text-text-muted hover:text-accent text-lg"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Add Button */}
                                    <motion.button
                                        onClick={handleAddToCart}
                                        layout
                                        whileHover={{
                                            scale: 1.05,
                                            backgroundColor: "#32cc9a",
                                            boxShadow: "0 10px 30px -10px rgba(63,255,193,0.6)",
                                            transition: { duration: 0.2, ease: "easeOut" }
                                        }}
                                        whileTap={{
                                            scale: 0.95,
                                            backgroundColor: "#2bb589",
                                            transition: { type: "spring", stiffness: 300, damping: 20 }
                                        }}
                                        className="w-full lg:w-auto lg:min-w-[280px] py-3 rounded-full font-bold text-base flex items-center justify-center gap-2 bg-accent text-background-dark shadow-[0_0_15px_rgba(63,255,193,0.3)] origin-center"
                                    >
                                        <motion.span layout className="flex items-center gap-2">
                                            <span>Aggiungi</span>
                                            <ShoppingBag size={18} />
                                        </motion.span>
                                    </motion.button>
                                </div>

                                {/* Enhanced Explore CTA */}
                                <div className="flex justify-center mt-6">
                                    <Link
                                        to="/productos"
                                        className="group flex items-center gap-2 px-6 py-3 border-2 border-accent/30 rounded-full hover:bg-accent/10 hover:border-accent transition-all duration-300 text-accent font-medium"
                                    >
                                        <span>Continua a esplorare</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                {/* Compact Info Box */}
                                <div className="border border-border/30 rounded-xl p-3 bg-background-dark/30 text-xs text-text-muted space-y-2">
                                    <div className="flex justify-between items-center border-b border-border/30 pb-2 w-full">
                                        <span>Sensazione</span>
                                        <span className="text-text-primary font-medium text-right flex-1 ml-4">{formatText(displayData.sensation) || "Standard"}</span>
                                    </div>
                                    {(product.size || product.sizeFlOz) && (
                                        <div className="flex justify-between items-center border-b border-border/30 pb-2">
                                            <span>Formato</span>
                                            <div className="flex items-center gap-2 font-medium">
                                                {product.size && <span className="text-text-primary">{product.size}</span>}
                                                {product.size && product.sizeFlOz && <span className="text-text-muted/30">|</span>}
                                                {product.sizeFlOz && <span className="text-text-primary">{product.sizeFlOz}</span>}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span>Marca</span>
                                        <span className="text-text-primary font-medium">{formatText(product.brand)}</span>
                                    </div>
                                    {product.code && (
                                        <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                            <span>Codice</span>
                                            <span className="text-text-primary font-medium">{product.code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Enhanced Shipping Discretion */}
                            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border/10">
                                <div className="flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 rounded-lg py-2 px-3">
                                    <Check size={14} className="text-accent flex-shrink-0" />
                                    <span className="text-xs text-accent font-medium tracking-wide">Pacco anonimo - Nessuna etichetta esterna</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted/60">
                                    <Check size={12} className="text-accent" />
                                    <span>Spedizione veloce</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Section: Accordions */}
                <div className="max-w-3xl mx-auto w-full mt-12 pb-12">
                    <Reveal width="100%">
                        <div className="space-y-4">
                            <AccordionItem title="Descrizione Completa">
                                <p className="text-text-muted leading-relaxed first-letter:uppercase whitespace-pre-line">
                                    {(product.descriptionAdditional ? product.descriptionAdditional : product.description)
                                        .replace(/\s{4,}/g, '\n')
                                        .split('\n')
                                        .map(line => formatText(line))
                                        .join('\n')}
                                </p>
                            </AccordionItem>



                            <AccordionItem title="Ingredienti">
                                <p className="text-text-muted leading-relaxed font-mono text-sm opacity-80">
                                    {displayData.ingredients}
                                </p>
                            </AccordionItem>

                            <AccordionItem title="Consigli Perla Negra">
                                <div className="bg-background-alt p-4 rounded-xl border-l-2 border-accent">
                                    <p className="text-text-muted leading-relaxed">
                                        {displayData.tips}
                                    </p>
                                </div>
                            </AccordionItem>
                        </div>
                    </Reveal>
                </div>

                {/* Related Products Section */}
                {products.filter(p => p.category === product.category && p.slug !== product.slug).length > 0 && (
                    <div className="border-t border-border/10 pt-16 pb-24">
                        <h2 className="text-3xl font-serif text-text-primary mb-8 text-center">Potrebbe piacerti anche</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                            {products
                                .filter(p => p.category === product.category && p.slug !== product.slug)
                                .slice(0, 4)
                                .map(relatedProduct => (
                                    <div key={relatedProduct.id} className="h-full">
                                        {/* Import ProductCard if not already valid in scope? It is not imported at top yet! 
                                            Wait, it is NOT imported. I need to check imports. 
                                            ProductCard IS imported in ProductListPage, but I am in DetailPage.
                                            I need to add import ProductCard at top.
                                        */}
                                        <ProductCard product={relatedProduct} />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Smart Sticky Mobile Bar */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-background-alt/90 backdrop-blur-xl border-t border-white/10 p-4 pb-6 md:pb-4 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)] md:max-w-4xl md:mx-auto md:bottom-8 md:rounded-2xl md:border md:left-4 md:right-4"
                    >
                        <div className="flex items-center gap-4">
                            {/* Product Image (Desktop Only) */}
                            <div className="hidden md:block w-12 h-12 rounded-lg bg-white/5 p-1 flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            </div>

                            {/* Product Info (Compact) */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-serif text-text-primary truncate leading-tight">{product.name}</h3>
                                <div className="text-accent font-bold text-base">€{product.price.toFixed(2)}</div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleAddToCart}
                                className="bg-accent text-background-dark px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(63,255,193,0.3)] active:scale-95 transition-transform flex items-center gap-2"
                            >
                                <span>Aggiungi</span>
                                <ShoppingBag size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetailPage;

