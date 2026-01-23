import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '@/features/products/data/products';
import { ChevronRight, ShoppingBag, Star, Heart, Check, ChevronDown } from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import SEO from '@/components/ui/SEO';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Find product by slug
    const product = products.find(p => p.slug === slug);

    // Zoom State
    const [isHovering, setIsHovering] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    // Product State (Restored)
    const [quantity, setQuantity] = useState(1);

    // Reset quantity when product changes
    useEffect(() => {
        if (product) {
            setQuantity(1);
        }
    }, [product]);

    if (!product) {
        return <div className="text-white text-center py-20">Prodotto non trovato</div>;
    }

    const handleAddToCart = () => {
        addToCart(product, quantity);
        toast.success(`Aggiunto al carrello: ${product.name}`, {
            description: `${quantity} x ${product.name}`
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
        // ... (unchanged part of getMockData content if needing to be present for context, but since this is big replace, I should trust line numbers or provide context)
        // Wait, I am replacing the top part where galleryItems was defined.
        switch (category) {
            case 'Lubricantes':
                return {
                    usage: "Aplicar una pequeña cantidad en la zona íntima y masajear suavemente. Compatible con preservativos de látex. Reaplicar según sea necesario para mantener la hidratación y el confort.",
                    ingredients: "Aqua, Glycerin, Propylene Glycol, Hydroxyethylcellulose, Sodium Benzoate, Polysorbate 20, Disodium EDTA, Lactic Acid.",
                    tips: "Para una experiencia más intensa, aplica un poco sobre las zonas erógenas antes del contacto. Conservar en un lugar fresco y seco, lejos de la luz solar directa.",
                    sensation: "Hidratante • Sedoso • Base Agua"
                };
            case 'Fragancias':
                return {
                    usage: "Rociar sobre los puntos de pulso: muñecas, cuello y detrás de las orejas. Permitir que la fragancia se asiente sin frotar. Ideal per usarlo dopo la doccia.",
                    ingredients: "Alcohol Denat, Aqua (Water), Parfum (Fragrance), Linalool, Limonene, Citronellol, Coumarin, Geraniol.",
                    tips: "Las feromonas se activan con el calor corporal. Aplícalo 15 minutos antes de salir para que se mezcle con tu química natural.",
                    sensation: "Seductor • Intenso • Floral/Amaderado"
                };
            case 'Afrodisiacos':
                return {
                    usage: "Ingerir con abundante agua o mezclar con tu bebida favorita. No superar la dosis diaria recomendada. Efecto esperado en 30-45 minutos.",
                    ingredients: "Extracto de Maca, Ginseng, L-Arginina, Vitaminas del complejo B, Zinc, Guaraná.",
                    tips: "Combínalo con un ambiente relajado y estimulación previa para maximizar los efectos.",
                    sensation: "Estimulante • Energético • Vigorizante"
                };
            default:
                return {
                    usage: "Utilizar según las instrucciones del envase. Limpiar antes y después de cada uso con agua tibia y jabón neutro o un limpiador de juguetes específico.",
                    ingredients: "Materiales seguros para el cuerpo, libres de ftalatos. Silicona de grado médico o ABS.",
                    tips: "Explora diferentes ritmos y presiones. Comienza suavemente y aumenta la intensidad según tu comodidad.",
                    sensation: "Placentero • Versátil • Seguro"
                };
        }
    };

    const mockData = getMockData(product.category);

    return (
        <div className="bg-background-dark min-h-screen py-6 flex flex-col fade-in">
            <SEO
                key={product.id}
                title={product.name}
                description={`Acquista ${product.name} - ${product.subtitle || product.category}`}
                image={product.image}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">

                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-text-muted mb-4 space-x-2 flex-shrink-0">
                    <Link to="/" className="hover:text-accent">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/productos" className="hover:text-accent">Prodotti</Link>
                    <ChevronRight size={14} />
                    <span className="text-accent">{product.category}</span>
                </nav>

                {/* Top Section: Fit to Screen Layout (Desktop) / Scroll (Mobile) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch lg:h-[calc(100vh-140px)] h-auto min-h-[600px]">

                    {/* Left: Main Image Card */}
                    <div className="w-full h-full">
                        <div
                            className="bg-background-alt rounded-3xl overflow-hidden relative border border-border/10 group cursor-crosshair h-full w-full flex items-center justify-center p-8"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain transition-transform duration-200 ease-out"
                                style={{
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    transform: isHovering ? 'scale(2)' : 'scale(1)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Right: Info Card */}
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Unified Card - Compact No-Scroll */}
                        <div className="bg-background-alt px-8 py-6 rounded-3xl border border-border/20 flex flex-col h-full justify-center">

                            {/* Header Group */}
                            <div className="mb-4 flex-shrink-0">
                                <h1 className="text-3xl lg:text-4xl font-serif text-text-primary mb-1 line-clamp-1 leading-tight">{product.name}</h1>
                                <p className="text-lg text-text-muted font-light italic line-clamp-2">{product.subtitle}</p>
                            </div>

                            {/* Price & Rating */}
                            <div className="flex items-center justify-between mb-6 flex-shrink-0">
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
                                <div className="flex gap-4 items-stretch">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-border/30 rounded-full bg-background-dark/50 px-2 min-w-[120px]">
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
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-grow py-3 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-accent text-background-dark hover:bg-accent-hover shadow-[0_0_15px_rgba(63,255,193,0.3)] hover:shadow-[0_0_25px_rgba(63,255,193,0.5)] transform active:scale-95"
                                    >
                                        <span>Aggiungi</span>
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>

                                {/* Link */}
                                <div className="flex justify-center -mt-2">
                                    <Link to="/productos" className="text-text-muted hover:text-accent text-xs underline underline-offset-4 transition-colors">
                                        Continua a esplorare
                                    </Link>
                                </div>

                                {/* Compact Info Box */}
                                <div className="border border-border/30 rounded-xl p-3 bg-background-dark/30 text-xs text-text-muted space-y-2">
                                    <div className="flex justify-between items-center border-b border-border/30 pb-2 w-full">
                                        <span>Sensazione</span>
                                        <span className="text-text-primary font-medium text-right flex-1 ml-4">{mockData.sensation || "Standard"}</span>
                                    </div>
                                    {product.size && (
                                        <div className="flex justify-between items-center border-b border-border/30 pb-2">
                                            <span>Formato</span>
                                            <div className="flex items-center gap-2 font-medium">
                                                <span className="text-text-primary">{product.size}</span>
                                                {product.sizeFlOz && (
                                                    <>
                                                        <span className="text-text-muted/30">|</span>
                                                        <span className="text-text-primary">{product.sizeFlOz}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span>Marca</span>
                                        <span className="text-text-primary font-medium">Perla Negra</span>
                                    </div>
                                    {product.code && (
                                        <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                            <span>Codice</span>
                                            <span className="text-text-primary font-medium">{product.code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Simple Badges */}
                            <div className="flex items-center justify-center gap-6 pt-4 mt-2 border-t border-border/10">
                                <div className="flex items-center gap-2 text-[10px] text-text-muted/70 uppercase tracking-widest">
                                    <Check size={12} className="text-accent" />
                                    <span>Discrezione Totale</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-text-muted/70 uppercase tracking-widest">
                                    <Check size={12} className="text-accent" />
                                    <span>Spedizione Veloce</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Section: Accordions */}
                <div className="max-w-3xl mx-auto w-full mt-12 pb-20">
                    <div className="space-y-4">
                        <AccordionItem title="Descrizione Completa">
                            <p className="text-text-muted leading-relaxed first-letter:uppercase">
                                {product.details ? product.details : (product.description + " Una experiencia diseñada para el placer.")}
                            </p>
                        </AccordionItem>

                        <AccordionItem title="Modi d'uso">
                            <p className="text-text-muted leading-relaxed italic">
                                {mockData.usage}
                            </p>
                        </AccordionItem>

                        <AccordionItem title="Ingredienti">
                            <p className="text-text-muted leading-relaxed font-mono text-sm opacity-80">
                                {mockData.ingredients}
                            </p>
                        </AccordionItem>

                        <AccordionItem title="Consigli Perla Negra">
                            <div className="bg-background-alt p-4 rounded-xl border-l-2 border-accent">
                                <p className="text-text-muted leading-relaxed">
                                    {mockData.tips}
                                </p>
                            </div>
                        </AccordionItem>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Simple Accordion Component
const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-border/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between group"
            >
                <h3 className={`text-xl font-serif transition-colors ${isOpen ? 'text-accent' : 'text-text-primary group-hover:text-accent'}`}>
                    {title}
                </h3>
                <ChevronDown
                    className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
            >
                {children}
            </div>
        </div>
    );
};

export default ProductDetailPage;
