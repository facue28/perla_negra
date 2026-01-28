import { useState, useEffect } from 'react';
import { useCart } from '@/features/cart/context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Send, ChevronDown, ShoppingBag } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import { toast } from 'sonner';
import AddressAutocomplete from '@/features/cart/components/AddressAutocomplete';
import Select from '@/components/ui/Select';
import { isValidPhoneNumber } from 'libphonenumber-js';
import OrderConfirmationModal from '@/features/cart/components/OrderConfirmationModal';
import { products as masterProducts } from '@/features/products/data/products';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '+',
        indirizzo: '',
        civico: '',
        citta: '',
        provincia: '',
        cap: '',
        dettagli: '',
        note: '',
        metodoEnvio: 'Spedizione a domicilio',
        latitude: null,
        longitude: null
    });

    const [errors, setErrors] = useState({});

    // 1. Persistence: Load data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('checkoutFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Ensure phone starts with + or default to +
                if (!parsed.telefono || parsed.telefono.trim() === '') {
                    parsed.telefono = '+';
                }
                setFormData(parsed);
            } catch (e) {
                console.error("Error loading saved form data", e);
            }
        }
    }, []);

    // 2. Persistence: Save data on change
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('checkoutFormData', JSON.stringify(formData));
        }, 500); // Debounce saving slightly
        return () => clearTimeout(timer);
    }, [formData]);


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error on type
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Hard Validations
        if (!formData.nombre.trim()) newErrors.nombre = "Il nome è obbligatorio";

        // Smart Phone Validation (libphonenumber-js)
        // Checks length, country code, and format automatically
        if (!formData.telefono || formData.telefono.trim() === '+' || !formData.telefono.trim()) {
            newErrors.telefono = "Il telefono è obbligatorio";
        } else if (!isValidPhoneNumber(formData.telefono)) {
            newErrors.telefono = "Numero non valido (controlla prefisso e lunghezza).";
        }

        if (!formData.indirizzo.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio";
        if (!formData.civico.trim()) newErrors.civico = "Il civico è obbligatorio";

        if (!formData.cap.trim() || !/^\d{5}$/.test(formData.cap)) {
            newErrors.cap = "Inserisci un CAP valido (5 cifre).";
        }

        if (!formData.citta.trim()) newErrors.citta = "Inserisci il Comune.";

        if (!formData.provincia.trim() || !/^[A-Za-z]{2}$/.test(formData.provincia)) {
            newErrors.provincia = "Provincia (2 lettere).";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Prevent Form Submission on Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    // ... (rest of logic)

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        if (!validateForm()) {
            toast.error("Per favore correggi gli errori nel modulo.", {
                style: { backgroundColor: '#fee2e2', color: '#dc2626' }
            });
            return;
        }

        setIsModalOpen(true);
    };

    const confirmOrder = () => {
        // 1. Generate Unique ID: #PN-{DDMM}-{RAND}
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
        const orderId = `PN-${day}${month}-${randomCode}`;

        // 2. Construct the message
        let message = `*ORDINE #${orderId}* 🖤\n\n`;
        message += `*Cliente:* ${formData.nombre}\n`;
        message += `*Telefono:* ${formData.telefono}\n`;

        // Formatted Address Block
        message += `*Indirizzo:*\n`;
        message += `${formData.indirizzo} ${formData.civico}\n`;
        if (formData.dettagli) message += `(${formData.dettagli})\n`;
        message += `${formData.cap} ${formData.citta} (${formData.provincia})\n`;

        // GPS Coordinates Link (New)
        if (formData.latitude && formData.longitude) {
            message += `📍 *Posizione GPS:* https://maps.google.com/?q=${formData.latitude},${formData.longitude}\n`;
        }

        if (formData.note) {
            message += `\n*Note:* ${formData.note}\n`;
        }

        message += `\n*Consegna:* ${formData.metodoEnvio}\n\n`;
        message += `*DETTAGLIO DELL'ORDINE:*\n`;

        let safeTotal = 0;

        cart.forEach(item => {
            // SECURITY CHECK: Look up price from master list
            const masterProduct = masterProducts.find(p => p.id === item.id);
            // Fallback to item.price only if not found (shouldn't happen)
            const safePrice = masterProduct ? masterProduct.price : item.price;

            const itemSubtotal = safePrice * item.quantity;
            safeTotal += itemSubtotal;

            message += `- [${item.code || 'N/A'}] ${item.name} (x${item.quantity}): $${itemSubtotal.toFixed(2)}\n`;
        });

        message += `\n*TOTALE: $${safeTotal.toFixed(2)}*`;

        // 3. Encode and Open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const shopNumber = "393778317091";
        const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        setIsModalOpen(false);
        // clearCart(); 
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 fade-in">
                <SEO title="Carrello Vuoto" description="Il tuo carrello è vuoto." />

                <div className="bg-background-alt/50 backdrop-blur-3xl p-12 rounded-[2.5rem] border border-white/5 text-center max-w-lg w-full shadow-2xl shadow-black/40 relative overflow-hidden group">
                    {/* Decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent/30 transition-all duration-700"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-background-dark rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag size={40} className="text-text-muted group-hover:text-accent transition-colors duration-300" />
                        </div>

                        <h2 className="text-3xl font-serif text-text-primary mb-3">Il tuo carrello è vuoto</h2>
                        <p className="text-text-muted mb-8 leading-relaxed max-w-xs mx-auto">
                            Non hai ancora aggiunto prodotti. Esplora la nostra collezione esclusiva.
                        </p>

                        <Link
                            to="/productos"
                            className="bg-accent text-background-dark px-10 py-4 rounded-full font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                        >
                            <ArrowLeft size={20} /> Inizia lo Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark py-12 px-4 sm:px-6 lg:px-8 fade-in">
            <SEO title="Carrello" description="Completa il tuo ordine su Perla Negra." />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-serif text-text-primary mb-12 text-center">Il tuo Carrello</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Col: Cart Items (Span 7) */}
                    <div className="lg:col-span-7 space-y-6">
                        {cart.map((item) => (
                            <div key={item.id} className="group bg-background-alt/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-accent/20 transition-all duration-300 flex flex-wrap sm:flex-nowrap gap-6 items-center shadow-lg shadow-black/20">

                                {/* Image */}
                                <div className="w-fit sm:mx-0 sm:w-24 h-48 sm:h-24 bg-white/5 rounded-2xl p-2 flex-shrink-0 border border-white/5 mb-2 sm:mb-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>

                                {/* Info */}
                                <div className="flex-grow min-w-[140px]">
                                    <h3 className="text-xl font-serif text-text-primary mb-1">{item.name}</h3>
                                    <p className="text-text-muted text-sm mb-2 italic">{item.subtitle || "Prodotto esclusivo"}</p>
                                    <div className="text-accent font-bold text-lg">${item.price.toFixed(2)}</div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-row-reverse sm:flex-row items-center gap-4 ml-auto sm:ml-0 flex-shrink-0">
                                    {/* Remove */}
                                    <button
                                        onClick={() => {
                                            removeFromCart(item.id);
                                            toast.success(`${item.name} rimosso`);
                                        }}
                                        className="text-text-muted hover:text-red-400 transition-colors p-2 -mr-2 sm:mr-0 opacity-50 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-3 bg-background-dark rounded-full px-3 py-1.5 border border-white/10">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="text-text-muted hover:text-white disabled:opacity-30 transition-colors"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-text-primary font-bold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="text-text-muted hover:text-white transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-6">
                            <Link to="/productos" className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-sm group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Continua con gli acquisti</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Col: Summary & Checkout (Span 5) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24">
                        <div className="bg-background-alt p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
                            <h2 className="text-2xl font-serif text-text-primary mb-8 border-b border-white/5 pb-4">
                                Riepilogo Ordine
                            </h2>

                            {/* Totals */}
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-text-muted">
                                    <span>Subtotale</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold text-text-primary pt-4 border-t border-white/10">
                                    <span>Totale</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handlePreSubmit} onKeyDown={handleKeyDown} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Il tuo nome"
                                        className={`w-full bg-background-dark border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                    />
                                    {errors.nombre && <p className="text-red-400 text-xs ml-1">{errors.nombre}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">WhatsApp</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+39 ..."
                                        className={`w-full bg-background-dark border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent transition-all`}
                                    />
                                    {errors.telefono && <p className="text-red-400 text-xs ml-1">{errors.telefono}</p>}
                                </div>

                                {/* Address Autocomplete Component */}
                                <AddressAutocomplete
                                    formData={formData}
                                    setFormData={setFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Metodo</label>
                                    <div className="relative">
                                        <Select
                                            value={formData.metodoEnvio}
                                            onChange={(val) => setFormData({ ...formData, metodoEnvio: val })}
                                            options={[
                                                { value: 'Spedizione a domicilio', label: 'Spedizione a domicilio' },
                                                { value: 'Ritiro al punto di incontro', label: 'Ritiro al punto di incontro' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-4 bg-accent text-background-dark py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] flex items-center justify-center gap-3 transform active:scale-[0.98]"
                                >
                                    <span>Completa su WhatsApp</span>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <OrderConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmOrder}
                formData={formData}
                cartTotal={getCartTotal()}
            />
        </div>
    );
};

export default CartPage;
