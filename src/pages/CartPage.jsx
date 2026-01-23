import { useState } from 'react';
import { useCart } from '@/features/cart/context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Send, ChevronDown, ShoppingBag } from 'lucide-react';
import SEO from '@/components/ui/SEO';
import { toast } from 'sonner';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: '',
        metodoEnvio: 'Envío a domicilio'
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateOrder = (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        // 1. Generate Unique ID: #PN-{DDMM}-{RAND}
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
        const orderId = `PN-${day}${month}-${randomCode}`;

        // 2. Construct the message
        let message = `*ORDINE #${orderId}* 🖤\n\n`; // Header with ID
        message += `*Cliente:* ${formData.nombre}\n`;
        message += `*Telefono:* ${formData.telefono}\n`;
        message += `*Indirizzo:* ${formData.direccion}\n`;
        message += `*Consegna:* ${formData.metodoEnvio}\n\n`;
        message += `*DETTAGLIO DELL'ORDINE:*\n`;

        cart.forEach(item => {
            message += `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\n*TOTALE: $${getCartTotal().toFixed(2)}*`;

        // 3. Encode and Open WhatsApp
        const encodedMessage = encodeURIComponent(message);

        // REEMPLAZAR CON EL NUMERO REAL DEL NEGOCIO
        // Formato internacional sin símbolos: 5491112345678 (Ejemplo Argentina Movil)
        const shopNumber = "393778317091";

        const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Optional: Clear cart or show success message?
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
                            <div key={item.id} className="group bg-background-alt/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-accent/20 transition-all duration-300 flex gap-6 items-center shadow-lg shadow-black/20">

                                {/* Image */}
                                <div className="w-24 h-24 bg-white/5 rounded-2xl p-2 flex-shrink-0 border border-white/5">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>

                                {/* Info */}
                                <div className="flex-grow">
                                    <h3 className="text-xl font-serif text-text-primary mb-1">{item.name}</h3>
                                    <p className="text-text-muted text-sm mb-2 italic">{item.subtitle || "Prodotto esclusivo"}</p>
                                    <div className="text-accent font-bold text-lg">${item.price.toFixed(2)}</div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-end gap-3">
                                    {/* Remove */}
                                    <button
                                        onClick={() => {
                                            removeFromCart(item.id);
                                            toast.success(`${item.name} rimosso`);
                                        }}
                                        className="text-text-muted hover:text-red-400 transition-colors p-2 -mr-2 opacity-50 group-hover:opacity-100"
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
                    <div className="lg:col-span-5 sticky top-24">
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
                                {/* Removed Spedizione Gratuita as requested */}
                                <div className="flex justify-between text-2xl font-bold text-text-primary pt-4 border-t border-white/10">
                                    <span>Totale</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={generateOrder} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        required
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Il tuo nome"
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">WhatsApp</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        required
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+39 ..."
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Indirizzo / Consegna</label>
                                    <textarea
                                        name="direccion"
                                        required
                                        rows="2"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        placeholder="Via Roma 1, Milano..."
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted/30 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider text-text-muted/70 font-bold ml-1">Metodo</label>
                                    <div className="relative">
                                        <select
                                            name="metodoEnvio"
                                            value={formData.metodoEnvio}
                                            onChange={handleInputChange}
                                            className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option>Spedizione a domicilio</option>
                                            <option>Ritiro al punto di incontro</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                            <ChevronDown size={16} />
                                        </div>
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
        </div>
    );
};

export default CartPage;
