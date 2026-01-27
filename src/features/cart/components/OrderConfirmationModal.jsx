import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, ShoppingBag, CheckCircle } from 'lucide-react';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, formData, cartTotal }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-background-alt border border-white/10 w-full max-w-md rounded-3xl shadow-2xl shadow-black overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-background-dark/50 p-6 border-b border-white/5 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-serif text-text-primary">Conferma Ordine</h3>
                            <p className="text-text-muted text-sm mt-1">Verifica i tuoi dati prima di procedere</p>
                        </div>
                        <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* Summary Card */}
                        <div className="bg-black/20 rounded-xl p-4 space-y-4 border border-white/5">
                            <div className="flex items-start gap-3">
                                <User className="text-accent mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Cliente</p>
                                    <p className="text-text-primary">{formData.nombre}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="text-accent mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Telefono</p>
                                    <p className="text-text-primary">{formData.telefono}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="text-accent mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Spedizione a</p>
                                    <p className="text-text-primary font-medium">{formData.indirizzo} {formData.civico}</p>
                                    <p className="text-text-muted text-sm">{formData.cap} {formData.citta} ({formData.provincia})</p>
                                    {formData.dettagli && <p className="text-text-muted text-xs mt-1 italic">{formData.dettagli}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center py-4 border-t border-white/10">
                            <span className="text-text-muted">Totale da pagare</span>
                            <span className="text-2xl font-bold text-accent">${cartTotal.toFixed(2)}</span>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0">
                        <button
                            onClick={onConfirm}
                            className="w-full bg-accent text-background-dark py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(63,255,193,0.3)] hover:shadow-[0_0_30px_rgba(63,255,193,0.5)] flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            <CheckCircle size={20} />
                            <span>Conferma e Invia WhatsApp</span>
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderConfirmationModal;
