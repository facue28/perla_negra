import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/features/cart/context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Send, ShoppingBag, MapPin, Loader2 } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import { toast } from 'sonner';
import AddressAutocomplete from '@/features/cart/components/AddressAutocomplete';
import Select from '@/components/ui/Select';
import { CheckoutSchema, CheckoutFormData } from '@/features/forms/schemas';
import Turnstile from '@/components/ui/Turnstile';
import OrderConfirmationModal from '@/features/cart/components/OrderConfirmationModal';
import { generateWhatsAppLink } from '@/features/cart/utils/whatsappGenerator';
import { trackPurchase } from '@/lib/analytics';
import { couponService } from '@/features/cart/services/couponService';
import { createOrder } from '@/features/orders/services/orderService';
import { logger } from '@/lib/logger';
import { useProducts } from '@/features/products/hooks/useProducts';
import { SuccessData } from '@/features/cart/types';

const CartPage = (): React.ReactElement => {
    const { items: cart, removeItem: removeFromCart, updateQuantity, total, subtotal, clearCart, discount, applyCoupon, removeCoupon } = useCart();
    const { products } = useProducts();
    const navigate = useNavigate();

    // Idempotency Token (Generated once per session/mount)
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            nombre: '',
            telefono: '+39 ',
            email: '',
            indirizzo: '',
            civico: '',
            citta: '',
            provincia: '',
            cap: '',
            note: '',
            metodoEnvio: 'Spedizione a domicilio',
            website: '',
            turnstileToken: ''
        }
    });

    const formData = watch(); // Maintain compatibility with existing UI logic
    const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);
    const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    // 1. Persistence: Load data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('checkoutFormData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (!parsed.telefono || parsed.telefono.trim() === '') {
                    parsed.telefono = '+39 ';
                }
                reset(parsed);
            } catch (e) {
                console.error("Error loading saved form data", e);
            }
        }
    }, [reset]);

    // 2. Persistence: Save data on change
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('checkoutFormData', JSON.stringify(formData));
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData]);

    // Coupon State
    const [couponCode, setCouponCode] = useState<string>('');
    const [couponLoading, setCouponLoading] = useState<boolean>(false);

    const handleApplyCoupon = async (): Promise<void> => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const result = await couponService.validateCoupon(couponCode);
            applyCoupon(result);
            toast.success("Codice applicato con successo!");
            setCouponCode('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isFinalSubmitting, setIsFinalSubmitting] = useState<boolean>(false);

    // Pre-submission handler
    const onSubmitHandler = (data: CheckoutFormData): void => {
        if (cart.length === 0) return;

        const now = Date.now();
        const timeSince = now - lastSubmitTime;
        if (timeSince < 5000) {
            toast.error(`Per favore attendi ${Math.ceil((5000 - timeSince) / 1000)}s prima di riprovare.`);
            return;
        }

        setLastSubmitTime(now);
        setIsModalOpen(true);
    };

    const [successData, setSuccessData] = useState<SuccessData | null>(null);

    const confirmOrder = async (): Promise<void> => {
        if (currentOrderNumber || isFinalSubmitting) return;

        setIsFinalSubmitting(true);
        const orderTotal = total;
        let orderNumber: string | null = null;

        const isPickup = formData.metodoEnvio.includes('Ritiro');
        const finalAddress = isPickup ? 'Ritiro in sede (Verbania)' : `${formData.indirizzo}, ${formData.civico}`;
        const finalCity = isPickup ? 'Verbania' : formData.citta;

        try {
            try {
                const orderResult = await createOrder({
                    customerInfo: {
                        fullName: formData.nombre,
                        phone: formData.telefono.replace(/\s/g, ''),
                        email: formData.email,
                        address: finalAddress,
                        city: finalCity,
                        notes: formData.note
                    },
                    items: cart,
                    couponCode: discount?.code,
                    idempotencyKey: idempotencyKey
                });

                orderNumber = orderResult.orderNumber;
                setCurrentOrderNumber(orderNumber);

                if (orderResult.warning) {
                    toast.warning(orderResult.warning, { duration: 6000 });
                }

                trackPurchase(cart, total, orderNumber);
                await new Promise(resolve => setTimeout(resolve, 500));
                logger.info('Order saved successfully', { orderNumber });

            } catch (orderError) {
                logger.error('Order save failed - Attempt 1', orderError);
                toast.info('Reintentando guardar el pedido...');

                try {
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const retryResult = await createOrder({
                        customerInfo: {
                            fullName: formData.nombre,
                            phone: formData.telefono.replace(/\s/g, ''),
                            email: formData.email,
                            address: finalAddress,
                            city: finalCity,
                            notes: formData.note
                        },
                        items: cart,
                        couponCode: discount?.code,
                        idempotencyKey: idempotencyKey
                    });

                    orderNumber = retryResult.orderNumber;
                    setCurrentOrderNumber(orderNumber);

                    trackPurchase(cart, orderTotal, orderNumber);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    logger.info('Order saved on retry', { orderNumber });
                    toast.success('Pedido guardado correctamente');

                } catch (retryError) {
                    logger.error('Order save retry failed - ABORTING', retryError);
                    toast.error('Errore nel salvataggio dell\'ordine. Contatta il supporto o riprova.', {
                        duration: 8000
                    });
                    setIsFinalSubmitting(false);
                    setIsModalOpen(false);
                    return;
                }
            }

            if (discount?.code && orderNumber) {
                try {
                    await couponService.incrementUsage(discount.code);
                } catch (couponError) {
                    logger.error('Coupon increment failed', couponError, { orderNumber });
                }
            }

            if (!orderNumber) {
                throw new Error('No order number available after save');
            }

            const { whatsappUrl } = generateWhatsAppLink(
                formData as any,
                cart,
                orderTotal,
                discount,
                subtotal,
                orderNumber
            );

            setSuccessData({
                orderNumber,
                whatsappUrl,
                messageBody: whatsappUrl.split('text=')[1]
            });

            window.open(whatsappUrl, '_blank');

            navigate('/grazie', {
                state: {
                    orderNumber,
                    whatsappUrl
                }
            });

        } catch (error) {
            logger.error('Order confirmation flow failed', error);
            toast.error('Ha ocurrido un error inesperado.');
        } finally {
            setIsFinalSubmitting(false);
        }
    };

    const handleCloseModal = (): void => {
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
                            to="/prodotti"
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

                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
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
                                    {(() => {
                                        const currentProduct = products.find(p => p.id === item.id);
                                        const displayImage = currentProduct?.image || item.image;

                                        return (
                                            <div className="w-fit sm:mx-0 sm:w-24 h-48 sm:h-24 bg-white/5 rounded-2xl p-2 flex-shrink-0 border border-white/5 mb-2 sm:mb-0">
                                                <img
                                                    src={displayImage}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain rounded-lg"
                                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                        (e.target as HTMLImageElement).style.opacity = '0.5';
                                                    }}
                                                />
                                            </div>
                                        );
                                    })()}

                                    <div className="flex-grow min-w-[140px]">
                                        <h3 className="text-xl font-serif text-text-primary mb-1">{item.name}</h3>
                                        <p className="text-text-muted text-sm mb-2 italic">{item.subtitle || "Prodotto esclusivo"}</p>
                                        <div className="text-accent font-bold text-lg">€{item.price.toFixed(2)}</div>
                                    </div>

                                    <div className="flex flex-row-reverse sm:flex-row items-center gap-4 ml-auto sm:ml-0 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                removeFromCart(item.id);
                                                toast.success(`${item.name} rimosso`);
                                            }}
                                            className="text-text-muted hover:text-red-400 transition-colors p-2 -mr-2 sm:mr-0 opacity-50 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>

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
                            <Link to="/prodotti" className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-sm group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Continua con gli acquisti</span>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-5 lg:sticky lg:top-24">
                        <div className="bg-background-alt p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
                            <h2 className="text-2xl font-serif text-text-primary mb-8 border-b border-white/5 pb-4">
                                Riepilogo Ordine
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-text-muted">
                                    <span>Subtotale</span>
                                    <span>€{subtotal.toFixed(2)}</span>
                                </div>

                                {discount && (
                                    <div className="flex justify-between text-accent">
                                        <div className="flex items-center gap-2">
                                            <span>Sconto {discount.code}</span>
                                            <button onClick={() => { removeCoupon(); toast.info("Codice rimosso"); }} className="text-xs text-red-400 hover:text-red-300 underline">(Rimuovi)</button>
                                        </div>
                                        <span>-€{(subtotal - total).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-2xl font-bold text-text-primary pt-4 border-t border-white/10">
                                    <span>Totale</span>
                                    <span>€{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {!discount && (
                                <div className="mb-8">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Codice sconto"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="min-w-0 flex-1 bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="flex-shrink-0 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {couponLoading ? '...' : 'Applica'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmitHandler)} onKeyDown={handleKeyDown} className="space-y-5">
                                <input
                                    {...register('website')}
                                    tabIndex={-1}
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
                                        {...register('nombre')}
                                        id="checkout-name"
                                        type="text"
                                        placeholder="Il tuo nome"
                                        className={`w-full bg-background-dark border ${errors.nombre ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all`}
                                    />
                                    {errors.nombre && <p className="text-red-400 text-xs ml-1">{errors.nombre.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="checkout-phone" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">WhatsApp</label>
                                    <input
                                        {...register('telefono')}
                                        id="checkout-phone"
                                        type="tel"
                                        placeholder="+39 ..."
                                        className={`w-full bg-background-dark border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all`}
                                    />
                                    {errors.telefono && <p className="text-red-400 text-xs ml-1">{errors.telefono.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="checkout-email" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Email</label>
                                    <input
                                        {...register('email')}
                                        id="checkout-email"
                                        type="email"
                                        placeholder="esempio@dominio.it"
                                        className={`w-full bg-background-dark border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all`}
                                    />
                                    {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
                                </div>

                                <AddressAutocomplete
                                    register={register}
                                    setValue={setValue}
                                    watch={watch}
                                    errors={errors}
                                    disabled={formData.metodoEnvio.includes('Ritiro')}
                                />

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Metodo</label>
                                    <div className="relative">
                                        <Select
                                            value={formData.metodoEnvio}
                                            onChange={(val: string) => setValue('metodoEnvio', val as any, { shouldValidate: true })}
                                            options={[
                                                { value: 'Spedizione a domicilio', label: 'Spedizione a domicilio' },
                                                { value: 'Ritiro in sede (Verbania)', label: 'Ritiro in sede (Verbania)' }
                                            ]}
                                        />
                                    </div>
                                    {formData.metodoEnvio.includes('Ritiro') && (
                                        <div className="mt-2 p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-2">
                                            <MapPin className="text-accent mt-0.5 shrink-0" size={14} />
                                            <p className="text-[11px] text-accent/90 leading-tight">
                                                <strong>Ritiro in sede (Verbania).</strong><br />
                                                Ti contatteremo su WhatsApp per concordare luogo e orario dell'incontro.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="checkout-notes" className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Note (Opzionale)</label>
                                    <textarea
                                        {...register('note')}
                                        id="checkout-notes"
                                        placeholder="Note per la consegna..."
                                        rows={2}
                                        className={`w-full bg-background-dark border ${errors.note ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent hover:border-accent/30 focus:ring-1 focus:ring-accent/50 transition-all resize-none`}
                                    />
                                    {errors.note && <p className="text-red-400 text-xs ml-1">{errors.note.message}</p>}
                                </div>

                                <Turnstile
                                    siteKey={TURNSTILE_SITE_KEY}
                                    onVerify={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
                                />
                                {errors.turnstileToken && <p className="text-red-500 text-xs text-center">{errors.turnstileToken.message}</p>}

                                <motion.button
                                    type="submit"
                                    disabled={isFinalSubmitting}
                                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(63,255,193,0.5)" }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className={`w-full mt-4 bg-accent text-background-dark py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(63,255,193,0.3)] flex items-center justify-center gap-3 ${isFinalSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isFinalSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-background-dark" />
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
                formData={formData as any}
                cartTotal={total}
                successData={successData}
            />
        </div>
    );
};

export default CartPage;
