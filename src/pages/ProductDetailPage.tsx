import React, { useState, useEffect, useLayoutEffect, MouseEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
// ... (rest of imports unchanged by instruction)
import { useProduct } from '@/features/products/hooks/useProduct';
import { useProducts } from '@/features/products/hooks/useProducts'; // Keep for "Related Products"
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import SEO from '@/components/ui/SEO';
import Reveal from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
// @ts-ignore
import AccordionItem from '@/components/ui/AccordionItem';
import ProductCard from '@/features/products/components/ProductCard';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';
import { Product } from '@/features/products/types';
import { getOptimizedImageUrl, getAbsoluteUrl } from '@/lib/imageUtils';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// Helper function to properly capitalize product names
const toTitleCase = (str: string | undefined): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const ProductDetailPage = (): React.ReactElement => {
    const { slug } = useParams<{ slug: string }>();

    const { addItem } = useCart();

    const { product, loading } = useProduct(slug);
    const { products: allProducts } = useProducts(); // Still needed for "Related Products" section


    // Zoom State
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    // Image Gallery State
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [image2Error, setImage2Error] = useState<boolean>(false); // New: Track if secondary image is broken

    // Initialize active image when product loads
    useEffect(() => {
        if (product) {
            setActiveImage(product.image);
            setImage2Error(false); // Reset error state ONLY when changing products
        }
    }, [slug, product]); // Fix: properly react to product changes

    // ... (intermediate code unchanged)

    <div className="flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors">
        <span className="text-text-muted font-medium">Formato</span>
        <span className="text-text-primary text-right font-medium">
            {(product.sizeMl || product.sizeFlOz) ? (
                <span>
                    {product.sizeMl ? `${product.sizeMl} ml` : ''}
                    {(product.sizeMl && product.sizeFlOz) ? ' / ' : ''}
                    {product.sizeFlOz ? `${product.sizeFlOz} fl oz` : ''}
                </span>
            ) : product.size ? (
                <span>{product.size}</span>
            ) : (
                <span className="text-text-muted italic">N/A</span>
            )}
        </span>
    </div>
    useEffect(() => {
        if (product) {
            setActiveImage(product.image);
            setImage2Error(false); // Reset error state ONLY when changing products
        }
    }, [slug, product]); // Fix: properly react to product changes

    // Product State (Restored)
    const [quantity, setQuantity] = useState<number>(1);

    // Reset quantity when slug changes (new product loaded)
    useEffect(() => {
        setQuantity(1);
    }, [slug]);

    // Sticky Mobile Bar Logic
    const [showStickyBar, setShowStickyBar] = useState<boolean>(false);
    const [addToCartInView, setAddToCartInView] = useState<boolean>(true);

    // Force scroll to top instantly on mount to prevent "stuck at bottom"
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // Intersection Observer for the main "Add to Cart" button
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setAddToCartInView(entry.isIntersecting);
            },
            { threshold: 0.1, rootMargin: "-20px" }
        );

        const btn = document.getElementById('main-add-to-cart-btn');
        if (btn) observer.observe(btn);

        return () => {
            if (btn) observer.unobserve(btn);
        };
    }, [product, slug]);

    useEffect(() => {
        // Show sticky bar ONLY if main button is NOT in view AND we have scrolled down a bit
        setShowStickyBar(!addToCartInView && window.scrollY > 200);
    }, [addToCartInView]);

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

    const formatText = (text: string | null | undefined): string => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const handleAddToCart = () => {
        if (!product) return;
        addItem(product, quantity);
        trackAddToCart(product, quantity); // Analytics
        toast.success(`Aggiunto al carrello: ${product.name} `, {
            description: `${quantity} x ${product.name} `
        });
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    // Helper to generate invented content
    const getMockData = (category: string) => {
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
    const structuredData = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image ? [getOptimizedImageUrl(product.image, { width: 800 })] : [],
        "description": product.subtitle || product.name,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": product.brand || "Perla Negra"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "EUR",
            "price": product.price.toFixed(2),
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    } : undefined;

    return (
        <div className="min-h-screen bg-background text-text-primary pb-20">
            <SEO
                title={product.name}
                description={product.subtitle || `Compra ${product.name} al miglior prezzo su Perla Negra.`}
                image={getOptimizedImageUrl(product.image, { width: 500, height: 500, format: 'jpeg' })}
                structuredData={structuredData}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">

                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-text-muted mb-4 space-x-2 flex-shrink-0 pt-24">
                    <Link to="/" className="hover:text-accent">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/prodotti" className="hover:text-accent">Prodotti</Link>
                    <ChevronRight size={14} />
                    <span className="text-accent">{product.category}</span>
                </nav>

                {/* Main Content Grid - Responsive layout without fixed height constraints */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">

                    {/* Left: Main Image Card & Thumbnails - Sticky on Desktop */}
                    <div className="w-full lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
                        <div
                            className="bg-background-alt/50 rounded-3xl overflow-hidden relative border border-border/10 group cursor-crosshair w-full aspect-[4/5] flex items-center justify-center"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {/* 1. Ambient Background Layer */}
                            <div className="absolute inset-0 z-0">
                                <LazyLoadImage
                                    src={activeImage || product.image}
                                    alt=""
                                    effect="blur"
                                    className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                                    wrapperClassName="w-full h-full !block"
                                />
                            </div>

                            {/* 2. Main Product Image */}
                            <div style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                zIndex: 10,
                                padding: '16px'
                            }}>
                                <motion.div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transform: isHovering ? 'scale(2)' : 'scale(1)',
                                        transition: 'transform 0.2s ease-out'
                                    }}
                                >
                                    <LazyLoadImage
                                        src={activeImage || product.image}
                                        alt={product.name}
                                        effect="blur"
                                        className="w-full h-full object-contain drop-shadow-xl"
                                        wrapperClassName="w-full h-full !block"
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Thumbnails Gallery - Show if secondary images exist */}
                        {(product.image2 || product.image3) && (
                            <div className="flex gap-4 justify-center">
                                {/* Thumb 1 (Main) */}
                                <button
                                    onClick={() => setActiveImage(product.image)}
                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${activeImage === product.image ? 'border-accent shadow-[0_0_10px_rgba(63,255,193,0.3)]' : 'border-border/20 hover:border-accent/50'}`}
                                >
                                    <LazyLoadImage
                                        src={getOptimizedImageUrl(product.image, { width: 400 })}
                                        alt="Vista principal"
                                        effect="blur"
                                        className="w-full h-full object-contain p-0 bg-white mix-blend-multiply"
                                        wrapperClassName="w-full h-full !block"
                                        onError={(e: any) => {
                                            if (e.target.src.includes('-min.webp')) {
                                                e.target.src = product.image;
                                            }
                                        }}
                                    />
                                </button>

                                {/* Thumb 2 */}
                                {product.image2 && !image2Error && (
                                    <button
                                        onClick={() => setActiveImage(product.image2)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${activeImage === product.image2 ? 'border-accent shadow-[0_0_10px_rgba(63,255,193,0.3)]' : 'border-border/20 hover:border-accent/50'}`}
                                    >
                                        <LazyLoadImage
                                            src={getOptimizedImageUrl(product.image2, { width: 400 })}
                                            alt="Vista secundaria"
                                            effect="blur"
                                            className="w-full h-full object-contain p-0 bg-white mix-blend-multiply"
                                            wrapperClassName="w-full h-full !block"
                                            onError={(e: any) => {
                                                if (e.target.src.includes('-min.webp')) {
                                                    e.target.src = product.image2!;
                                                } else {
                                                    e.currentTarget.style.display = 'none';
                                                    setImage2Error(true);
                                                }
                                            }}
                                        />
                                    </button>
                                )}

                                {/* Thumb 3 */}
                                {product.image3 && (
                                    <button
                                        onClick={() => setActiveImage(product.image3)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white ${activeImage === product.image3 ? 'border-accent shadow-[0_0_10px_rgba(63,255,193,0.3)]' : 'border-border/20 hover:border-accent/50'}`}
                                    >
                                        <LazyLoadImage
                                            src={getOptimizedImageUrl(product.image3, { width: 400 })}
                                            alt="Vista extra"
                                            effect="blur"
                                            className="w-full h-full object-contain p-0 bg-white mix-blend-multiply"
                                            wrapperClassName="w-full h-full !block"
                                            onError={(e: any) => {
                                                if (e.target.src.includes('-min.webp')) {
                                                    e.target.src = product.image3!;
                                                } else {
                                                    e.currentTarget.style.display = 'none';
                                                }
                                            }}
                                        />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Info Card - COMPACT VERSION */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                        {/* Unified Card with REDUCED PADDING and COMPACT SPACINGS */}
                        <div className="bg-background-alt px-6 py-6 rounded-3xl border border-border/20 flex flex-col h-full gap-4">

                            {/* Header Group - Compact */}
                            <div>
                                <h1 className="text-3xl font-serif text-text-primary mb-1 leading-tight">{toTitleCase(product.name)}</h1>
                                <p className="text-base text-text-muted font-light italic">{product.subtitle}</p>
                            </div>

                            {/* Price & Rating - Compact */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-3xl font-bold text-accent">
                                    €{product.price.toFixed(2)}
                                </div>
                                <div className="flex items-center gap-1 bg-background-dark/30 px-2 py-1 rounded-full">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-text-primary">4.9</span>
                                </div>
                            </div>

                            {/* Content Group - Compact Font */}
                            <p className="text-text-muted text-sm leading-relaxed first-letter:uppercase">
                                {product.description || "Lorem ipsum dolor sit amet consectetur. Placerat arcu at non consequat phasellus mi morbi maecenas."}
                            </p>

                            {/* Interactive Section: Quantity + Add to Cart Row */}
                            <div className="flex flex-col gap-4 mt-2" id="main-add-to-cart-btn">
                                {/* Quantity - Increased Height for better touch */}
                                <div className="flex items-center border border-border/30 rounded-full bg-background-dark/50 px-2 min-w-[120px] h-[56px] mx-auto w-full lg:w-auto">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-12 h-full flex items-center justify-center text-text-muted hover:text-accent text-xl"
                                    >
                                        -
                                    </button>
                                    <div className="flex-grow text-center font-bold text-text-primary text-lg">{quantity}</div>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="w-12 h-full flex items-center justify-center text-text-muted hover:text-accent text-xl"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Add Button - Increased Height */}
                                <motion.button
                                    onClick={handleAddToCart}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full h-[56px] rounded-full font-bold text-lg flex items-center justify-center gap-2 bg-accent text-background-dark shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] transition-all"
                                >
                                    <span>Aggiungi al Carrello</span>
                                    <ShoppingBag size={20} />
                                </motion.button>
                            </div>

                            {/* Info Box - Boxed Style - COMPACT ROWS */}
                            <div className="mt-4 border border-border/10 rounded-2xl overflow-hidden bg-background-dark/20 text-xs">
                                <div className="flex flex-col divide-y divide-border/10">
                                    <div className="flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors">
                                        <span className="text-text-muted font-medium">Sensazione</span>
                                        <span className="text-text-primary text-right font-medium">{formatText(displayData.sensation) || "Standard"}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors">
                                        <span className="text-text-muted font-medium">Formato</span>
                                        <span className="text-text-primary text-right font-medium">
                                            {(product.sizeMl || product.sizeFlOz) ? (
                                                <span>
                                                    {product.sizeMl ? `${product.sizeMl} ml` : ''}
                                                    {(product.sizeMl && product.sizeFlOz) ? ' / ' : ''}
                                                    {product.sizeFlOz ? `${product.sizeFlOz} fl oz` : ''}
                                                </span>
                                            ) : product.size ? (
                                                <span>{product.size}</span>
                                            ) : (
                                                <span className="text-text-muted italic">N/A</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors">
                                        <span className="text-text-muted font-medium">Marca</span>
                                        <span className="text-text-primary text-right font-medium">{formatText(product.brand)}</span>
                                    </div>
                                    {product.code && (
                                        <div className="flex justify-between items-center px-4 py-3 hover:bg-white/5 transition-colors">
                                            <span className="text-text-muted font-medium">Codice</span>
                                            <span className="text-text-primary text-right font-bold uppercase tracking-wider">{product.code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer - Trust Badges */}
                            <div className="flex flex-col gap-3 py-4 flex-grow justify-center items-center text-center">
                                <div className="flex items-center gap-2 text-zinc-300 text-xs font-medium bg-background-dark/50 px-4 py-2.5 rounded-xl border border-border/10">
                                    <Check size={14} className="text-accent" /> Pacco anonimo - Nessuna etichetta esterna
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400 text-xs px-2 py-1">
                                    <Check size={14} className="text-accent" /> Spedizione veloce e discreta
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Section: Accordions */}
                <div className="max-w-4xl mx-auto w-full mt-24 pb-12">
                    <Reveal width="100%">
                        <div className="space-y-4">
                            <AccordionItem title="Descrizione Completa">
                                <p className="text-text-muted leading-relaxed first-letter:uppercase whitespace-pre-line text-sm">
                                    {(product.descriptionAdditional ? product.descriptionAdditional : product.description)
                                        .replace(/\s{4,}/g, '\n')
                                        .split('\n')
                                        .map(line => formatText(line))
                                        .join('\n')}
                                </p>
                            </AccordionItem>

                            <AccordionItem title="Ingredienti">
                                <p className="text-text-muted leading-relaxed text-sm">
                                    {displayData.ingredients}
                                </p>
                            </AccordionItem>

                            <AccordionItem title="Consigli Perla Negra">
                                <div className="bg-background-alt p-6 rounded-xl border-l-2 border-accent">
                                    <p className="text-text-muted leading-relaxed text-sm">
                                        {displayData.tips}
                                    </p>
                                </div>
                            </AccordionItem>
                        </div>
                    </Reveal>
                </div>

                {/* Related Products Section */}
                {product && allProducts.filter(p => p.category === product.category && p.slug !== product.slug).length > 0 && (
                    <div className="border-t border-border/10 pt-16 pb-24 mt-16">
                        <h2 className="text-2xl font-serif text-text-primary mb-8 text-center">Potrebbe piacerti anche</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                            {allProducts
                                .filter(p => p.category === product.category && p.slug !== product.slug)
                                .slice(0, 4)
                                .map(relatedProduct => (
                                    <div key={relatedProduct.id} className="h-full">
                                        <ProductCard product={relatedProduct} />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Smart Sticky Mobile Bar: Only visible on mobile (md:hidden) */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 p-4 pb-6 md:pb-4 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)] md:hidden"
                    >
                        <div className="flex items-center gap-4 max-w-7xl mx-auto">
                            {/* Product Info (Compact) */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="text-sm font-serif text-zinc-300 truncate leading-tight">{product.name}</h3>
                                <div className="text-accent font-bold text-lg mt-0.5">€{product.price.toFixed(2)}</div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleAddToCart}
                                className="bg-accent text-background-dark px-6 py-3.5 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(63,255,193,0.3)] active:scale-95 transition-transform flex items-center gap-2"
                            >
                                <span>Aggiungi</span>
                                <ShoppingBag size={16} />
                            </button>
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
};

export default ProductDetailPage;
