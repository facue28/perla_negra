import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Calendar, User, Phone, MapPin, FileText, Tag, DollarSign } from 'lucide-react';
import { updateOrderStatus } from '@/features/orders/services/orderService';
import { toast } from 'sonner';

const OrderDetailModal = ({ order, isOpen, onClose, onUpdate }) => {
    const [updating, setUpdating] = useState(false);

    if (!order) return null;

    const handleStatusChange = async (newStatus) => {
        if (newStatus === order.status) return; // No change

        try {
            setUpdating(true);
            await updateOrderStatus(order.id, newStatus);
            toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`);
            onUpdate(); // Refresh parent list
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            nueva: 'Nueva',
            en_preparacion: 'En Preparación',
            completada: 'Completada',
            cancelada: 'Cancelada'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            nueva: 'bg-blue-500 hover:bg-blue-600',
            en_preparacion: 'bg-yellow-500 hover:bg-yellow-600',
            completada: 'bg-green-500 hover:bg-green-600',
            cancelada: 'bg-red-500 hover:bg-red-600'
        };
        return colors[status] || colors.nueva;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-background-alt border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                    <div>
                                        <h2 className="text-2xl font-playfair font-bold text-white mb-1">
                                            Pedido {order.order_number}
                                        </h2>
                                        <p className="text-text-muted text-sm flex items-center gap-2">
                                            <Calendar size={14} />
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={24} className="text-text-muted hover:text-white" />
                                    </button>
                                </div>

                                {/* Content - Scrollable */}
                                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    {/* Customer Info */}
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <User size={18} className="text-accent" />
                                            Información del Cliente
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-text-muted text-xs uppercase mb-1">Nombre</p>
                                                <p className="text-white font-medium">{order.customer_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-text-muted text-xs uppercase mb-1">Teléfono</p>
                                                <p className="text-white font-medium flex items-center gap-2">
                                                    <Phone size={14} className="text-accent" />
                                                    {order.customer_phone}
                                                </p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-text-muted text-xs uppercase mb-1">Dirección de Envío</p>
                                                <p className="text-white font-medium flex items-start gap-2">
                                                    <MapPin size={14} className="text-accent mt-1 flex-shrink-0" />
                                                    {order.delivery_address}
                                                </p>
                                            </div>
                                            {order.delivery_notes && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-text-muted text-xs uppercase mb-1">Notas</p>
                                                    <p className="text-white/70 italic flex items-start gap-2">
                                                        <FileText size={14} className="text-text-muted mt-1 flex-shrink-0" />
                                                        {order.delivery_notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Package size={18} className="text-accent" />
                                            Productos ({order.order_items?.length || 0})
                                        </h3>
                                        <div className="space-y-3">
                                            {order.order_items?.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4 p-3 bg-background-dark rounded-xl border border-white/5"
                                                >
                                                    {item.product_image && (
                                                        <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={item.product_image}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-grow">
                                                        <p className="text-white font-medium">{item.product_name}</p>
                                                        <p className="text-text-muted text-sm">
                                                            €{parseFloat(item.price).toFixed(2)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-bold">
                                                            €{parseFloat(item.subtotal).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <DollarSign size={18} className="text-accent" />
                                            Resumen del Pedido
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-text-muted">Subtotal</span>
                                                <span className="text-white">€{parseFloat(order.subtotal).toFixed(2)}</span>
                                            </div>
                                            {order.discount_amount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-text-muted">Descuento</span>
                                                        {order.coupon_code && (
                                                            <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs font-mono">
                                                                {order.coupon_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-accent">-€{parseFloat(order.discount_amount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-3 border-t border-white/10 text-lg">
                                                <span className="text-white font-bold">Total</span>
                                                <span className="text-accent font-bold">€{parseFloat(order.total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Change */}
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <h3 className="text-white font-bold mb-4">Cambiar Estado</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['nueva', 'en_preparacion', 'completada', 'cancelada'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(status)}
                                                    disabled={updating || status === order.status}
                                                    className={`
                                                        px-4 py-3 rounded-xl font-medium transition-all text-white
                                                        ${status === order.status
                                                            ? 'bg-white/10 border-2 border-accent cursor-not-allowed'
                                                            : `${getStatusColor(status)} border border-transparent hover:scale-105 active:scale-95`
                                                        }
                                                        ${updating ? 'opacity-50 cursor-wait' : ''}
                                                    `}
                                                >
                                                    {status === order.status && '✓ '}
                                                    {getStatusLabel(status)}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-text-muted text-xs mt-3 text-center">
                                            Estado actual: <span className="text-accent font-medium">{getStatusLabel(order.status)}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailModal;
