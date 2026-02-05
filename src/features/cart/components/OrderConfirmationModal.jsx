import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, CheckCircle, MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, formData, cartTotal, successData }) => {
    const [viewState, setViewState] = useState('confirm'); // 'confirm' | 'success'

    // Reset view state when modal opens/closes or successData changes
    useEffect(() => {
        if (isOpen && successData) {
            setViewState('success');
        } else if (isOpen) {
            setViewState('confirm');
        }
    }, [isOpen, successData]);

    const handleCopyMessage = async () => {
        if (successData?.messageBody) {
            try {
                // Decode URI component to get clean text
                const text = decodeURIComponent(successData.messageBody);
                await navigator.clipboard.writeText(text);
                toast.success('Messaggio copiato!');
            } catch (err) {
                toast.error('Errore durante la copia');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={successData ? onClose : undefined} // Allow close on backdrop only if success
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-background-alt border border-white/10 w-full max-w-md rounded-3xl shadow-2xl shadow-black overflow-hidden"
                >
                    {viewState === 'success' ? (
                        // SUCCESS VIEW
                        <div className="p-8 text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400"
                            >
                                <CheckCircle size={48} />
                            </motion.div>

                            <div>
                                <h3 className="text-2xl font-serif text-white mb-2">Ordine Confermato!</h3>
                                <p className="text-text-muted">Il tuo numero d'ordine è:</p>
                                <p className="text-xl font-mono text-accent mt-1">{successData?.orderNumber}</p>
                            </div>

                            <div className="space-y-3 pt-4">
                                <a
                                    href={successData?.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#128C7E] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                >
                                    <MessageCircle size={24} />
                                    <span>Apri WhatsApp</span>
                                </a>

                                <button
                                    onClick={handleCopyMessage}
                                    className="w-full bg-white/5 text-text-muted py-3 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Copy size={16} />
                                    <span>Copia messaggio (backup)</span>
                                </button>
                            </div>

                            <p className="text-xs text-text-muted/60 mt-4">
                                Se WhatsApp non si apre, copia il messaggio e invialo al <span className="text-text-muted font-mono select-all">+39 377 831 7091</span>
                            </p>

                            <button onClick={onClose} className="text-text-muted hover:text-white text-sm underline pt-2">
                                Chiudi e torna al negozio
                            </button>
                        </div>
                    ) : (
                        // CONFIRMATION VIEW
                        <>
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
                                    <span className="text-2xl font-bold text-accent">€{cartTotal.toFixed(2)}</span>
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
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderConfirmationModal;
