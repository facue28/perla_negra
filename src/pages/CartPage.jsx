import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/features/cart/context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Send, ChevronDown, ShoppingBag } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import { toast } from 'sonner';
import AddressAutocomplete from '@/features/cart/components/AddressAutocomplete';
import Select from '@/components/ui/Select';
import { isValidPhoneNumber } from 'libphonenumber-js';
import OrderConfirmationModal from '@/features/cart/components/OrderConfirmationModal';
import { generateWhatsAppLink } from '@/features/cart/utils/whatsappGenerator';
import { trackPurchase } from '@/lib/analytics';
import { couponService } from '@/features/cart/services/couponService';
import { createOrder } from '@/features/orders/services/orderService';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, getCartSubtotal, clearCart, discount, applyCoupon, removeCoupon } = useCart();

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
        longitude: null,
        // SECURITY: Honeypot field (hidden from users, bots will fill it)
        website: '' // Should always be empty for real users
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentOrderNumber, setCurrentOrderNumber] = useState(null);
    const [lastSubmitTime, setLastSubmitTime] = useState(0);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const result = await couponService.validateCoupon(couponCode);
            applyCoupon(result);
            toast.success("Codice applicato con successo!");
            setCouponCode('');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setCouponLoading(false);
        }
    };

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
                setFormData(prev => ({ ...prev, ...parsed }));
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

        // SECURITY: Check honeypot field (bots usually fill all fields)
        if (formData.website && formData.website.trim() !== '') {
            // Silent rejection - don't show error to avoid revealing honeypot
            console.warn('Honeypot triggered - potential bot detected');
            return false;
        }

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

        // Security: Anti-Phishing Check in Notes
        if (formData.note && /(http|https|www\.|ftp)/i.test(formData.note)) {
            newErrors.note = "Per sicurezza, non è consentito inserire link nelle note.";
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

        // RATE LIMITING (Client Side)
        const now = Date.now();
        const timeSince = now - lastSubmitTime;
        if (timeSince < 5000) {
            toast.error(`Per favore attendi ${Math.ceil((5000 - timeSince) / 1000)}s prima di riprovare.`);
            return;
        }

        if (!validateForm()) {
            toast.error("Per favore correggi gli errori nel modulo.", {
                style: { backgroundColor: '#fee2e2', color: '#dc2626' }
            });
            return;
        }

        setLastSubmitTime(now);
        setIsSubmitting(true);
        setIsModalOpen(true);

        // Anti-Spam Cooldown: Re-enable button after 60 seconds if they close modal without sending
        setTimeout(() => setIsSubmitting(false), 60000);
    };

    const [successData, setSuccessData] = useState(null);

    // ...

    const confirmOrder = async () => {
        const total = getCartTotal();
        let orderNumber = null;

        // Block double submission if already successful
        if (currentOrderNumber) return;

        try {
            // 2. Save Order to Database (MANDATORY & ROBUST)
            try {
                const orderResult = await createOrder({
                    customerInfo: {
                        fullName: formData.nombre,
                        phone: formData.telefono,
                        email: null,
                        address: `${formData.indirizzo}, ${formData.civico}`,
                        city: formData.citta,
                        notes: formData.note
                    },
                    items: cart,
                    couponCode: discount?.code
                });

                orderNumber = orderResult.orderNumber;
                setCurrentOrderNumber(orderNumber);

                // UX: Show warning if backend returned one (e.g., Soft Fail Coupon)
                if (orderResult.warning) {
                    toast.warning(orderResult.warning, { duration: 6000 });
                }

                // TRACK SUCCESSFUL ORDER SAVE
                trackPurchase(cart, total, orderNumber);
                logger.info('Order saved successfully', { orderNumber });

            } catch (orderError) {
                logger.error('Order save failed - Attempt 1', orderError);
                toast.info('Reintentando guardar el pedido...');

                // RETRY MECHANISM (1 Attempt)
                try {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Short backoff

                    const retryResult = await createOrder({
                        customerInfo: {
                            fullName: formData.nombre,
                            phone: formData.telefono,
                            email: null,
                            address: `${formData.indirizzo}, ${formData.civico}`,
                            city: formData.citta,
                            notes: formData.note
                        },
                        items: cart,
                        couponCode: discount?.code
                    });

                    orderNumber = retryResult.orderNumber;
                    setCurrentOrderNumber(orderNumber);

                    // Track after retry success
                    trackPurchase(cart, total, orderNumber);
                    logger.info('Order saved on retry', { orderNumber });
                    toast.success('Pedido guardado correctamente');

                } catch (retryError) {
                    logger.error('Order save retry failed - ABORTING', retryError);
                    toast.error('Errore nel salvataggio dell\'ordine. Contatta il supporto o riprova.', {
                        duration: 8000
                    });

                    // ⛔ CRITICAL: ABORT EVERYTHING
                    setIsSubmitting(false);
                    setIsModalOpen(false);
                    return;
                }
            }

            // 3. Increment Coupon (Best Effort - Only if order exists)
            if (discount?.code && orderNumber) {
                try {
                    await couponService.incrementUsage(discount.code);
                } catch (couponError) {
                    logger.error('Coupon increment failed', couponError, { orderNumber });
                    // Non-blocking
                }
            }

            // 4. Generate WhatsApp Link (REQUIRES ORDER NUMBER)
            if (!orderNumber) {
                throw new Error('No order number available after save');
            }

            const { whatsappUrl } = generateWhatsAppLink(
                formData,
                cart,
                total,
                discount,
                getCartSubtotal(),
                orderNumber // Passing real order number
            );

            // 5. SUCCESS HANDLING UI
            // We do NOT close the modal immediately. instead, we show success state.
            setSuccessData({
                orderNumber,
                whatsappUrl,
                messageBody: whatsappUrl.split('text=')[1] // Extract just the message for copy/paste
            });

            // 6. Open WhatsApp (Auto-attempt)
            window.open(whatsappUrl, '_blank');

            // 7. Clean up internal state (but keep modal open to show success)
            // clearCart(); // Clean up only on modal close
            // if (discount) removeCoupon();
            setIsSubmitting(false);
            // setCurrentOrderNumber(null); // Keep it to prevent double submit
            setIsSubmitting(false);

        } catch (error) {
            logger.error('Order confirmation flow failed', error);
            toast.error('Ha ocurrido un error inesperado.');
            setIsSubmitting(false);
        }
    };

    // Reset success data when modal is closed manually
    const handleCloseModal = () => {
        // Now we clean up everything as the user has acknowledged the success
        if (successData) {
            clearCart();
            if (discount) removeCoupon();
        }

        setIsModalOpen(false);
        setSuccessData(null);
        setCurrentOrderNumber(null);
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 pt-24 fade-in">
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
        <div className="min-h-screen bg-background-dark pt-24 pb-12 px-4 sm:px-6 lg:px-8 fade-in">
            <SEO title="Carrello" description="Completa il tuo ordine su Perla Negra." />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-serif text-text-primary mb-12 text-center">Il tuo Carrello</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Col: Cart Items (Span 7) */}
                    <div className="lg:col-span-7 space-y-6">
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    className="group bg-background-alt/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-accent/20 transition-colors duration-300 flex flex-wrap sm:flex-nowrap gap-6 items-center shadow-lg shadow-black/20"
                                >
                                    {/* Image */}
                                    <div className="w-fit sm:mx-0 sm:w-24 h-48 sm:h-24 bg-white/5 rounded-2xl p-2 flex-shrink-0 border border-white/5 mb-2 sm:mb-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow min-w-[140px]">
                                        <h3 className="text-xl font-serif text-text-primary mb-1">{item.name}</h3>
                                        <p className="text-text-muted text-sm mb-2 italic">{item.subtitle || "Prodotto esclusivo"}</p>
                                        <div className="text-accent font-bold text-lg">€{item.price.toFixed(2)}</div>
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
                                            <motion.span
                                                key={item.quantity}
                                                initial={{ scale: 1.2, color: '#3FFFC1' }}
                                                animate={{ scale: 1, color: '#FFFFFF' }}
                                                transition={{ duration: 0.15 }}
                                                className="text-text-primary font-bold text-sm min-w-[1.5rem] text-center"
                                            >
                                                {item.quantity}
                                            </motion.span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-text-muted hover:text-white transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

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
                                    <span>€{getCartSubtotal().toFixed(2)}</span>
                                </div>

                                {/* Discount Display */}
                                {discount && (
                                    <div className="flex justify-between text-accent">
                                        <div className="flex items-center gap-2">
                                            <span>Sconto {discount.code}</span>
                                            <button onClick={() => { removeCoupon(); toast.info("Codice rimosso"); }} className="text-xs text-red-400 hover:text-red-300 underline">(Rimuovi)</button>
                                        </div>
                                        <span>-€{(getCartSubtotal() - getCartTotal()).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-2xl font-bold text-text-primary pt-4 border-t border-white/10">
                                    <span>Totale</span>
                                    <span>€{getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Coupon Input */}
                            {!discount && (
                                <div className="mb-8">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Codice sconto"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1 bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {couponLoading ? '...' : 'Applica'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handlePreSubmit} onKeyDown={handleKeyDown} className="space-y-5">
                                {/* SECURITY: Honeypot field (hidden from users, bots will fill it) */}
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    tabIndex="-1"
                                    autoComplete="off"
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        left: '-9999px',
                                        width: '1px',
                                        height: '1px',
                                        opacity: 0
                                    }}
                                />

                                <div className="space-y-1">
                                    <label htmlFor="checkout-name" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Nome Completo</label>
                                    <input
                                        id="checkout-name"
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Il tuo nome"
                                        className={`w-full bg-background-dark border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all`}
                                    />
                                    {errors.nombre && <p className="text-red-400 text-xs ml-1">{errors.nombre}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="checkout-phone" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">WhatsApp</label>
                                    <input
                                        id="checkout-phone"
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+39 ..."
                                        className={`w-full bg-background-dark border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all`}
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

                                <div className="space-y-1">
                                    <label htmlFor="checkout-notes" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Note (Opzionale)</label>
                                    <textarea
                                        id="checkout-notes"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        placeholder="Note per la consegna..."
                                        rows="2"
                                        className={`w-full bg-background-dark border ${errors.note ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all resize-none`}
                                    />
                                    {errors.note && <p className="text-red-400 text-xs ml-1">{errors.note}</p>}
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(63,255,193,0.5)" }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className={`w-full mt-4 bg-accent text-background-dark py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(63,255,193,0.3)] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <span>Attendere...</span>
                                    ) : (
                                        <>
                                            <span>Completa su WhatsApp</span>
                                            <Send size={20} />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <OrderConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={confirmOrder}
                formData={formData}
                cartTotal={getCartTotal()}
                successData={successData}
            />
        </div>
    );
};

export default CartPage;
