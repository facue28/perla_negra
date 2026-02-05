import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Eye, Filter, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '@/features/orders/services/orderService';
import OrderDetailModal from '@/components/admin/OrderDetailModal';

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
            const data = await getOrders(filters);
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleOrderUpdate = () => {
        // Refresh list after status change
        fetchOrders();
        setIsModalOpen(false);
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción borrará permanentemente el registro y sus items. No se puede deshacer.')) {
            try {
                // Optimistic UI or just loader? Let's use loader for safety
                setLoading(true);
                await deleteOrder(orderId);
                toast.success('Pedido eliminado correctamente');
                await fetchOrders(); // Reload list
            } catch (error) {
                console.error('Error deleting order:', error);
                toast.error('Error al eliminar el pedido: ' + error.message);
                setLoading(false); // Only set false here if fetchOrders fails or wasn't called
            }
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            nueva: { label: 'Nueva', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            en_preparacion: { label: 'En Preparación', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
            completada: { label: 'Completada', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
            cancelada: { label: 'Cancelada', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
        };

        const config = statusConfig[status] || statusConfig.nueva;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="px-6 py-8 space-y-6 text-text-primary">
            {/* Back Button */}
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors group mb-4"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Volver al Panel</span>
            </Link>

            {/* Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-white mb-2">Pedidos</h1>
                    <p className="text-text-muted">Gestiona el historial de pedidos y su estado</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por # pedido, cliente o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white placeholder-text-muted transition-colors backdrop-blur-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-text-muted" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="nueva">Nueva</option>
                            <option value="en_preparacion">En Preparación</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-text-muted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium"># Pedido</th>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">Fecha</th>
                                <th className="px-6 py-4 font-medium text-right">Total</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                // Skeleton Loading
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-white/5 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-20 bg-white/5 rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-accent font-medium">
                                                {order.order_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-medium">{order.customer_name}</p>
                                                <p className="text-text-muted text-sm">{order.customer_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-sm">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-bold text-lg">
                                                €{parseFloat(order.total).toFixed(2)}
                                            </span>
                                            {order.discount_amount > 0 && (
                                                <p className="text-accent text-xs">
                                                    -{parseFloat(order.discount_amount).toFixed(2)}€
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewOrder(order)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-accent/10 text-white hover:text-accent rounded-lg transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                                <span className="text-sm font-medium">Ver</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-2"
                                                title="Eliminar pedido"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-text-muted">
                                        <Package size={48} className="mx-auto mb-4 opacity-30" />
                                        <p>No se encontraron pedidos.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Summary */}
            {!loading && orders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                    {['nueva', 'en_preparacion', 'completada', 'cancelada'].map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        const total = orders
                            .filter(o => o.status === status)
                            .reduce((sum, o) => sum + parseFloat(o.total), 0);

                        return (
                            <div key={status} className="bg-background-alt/50 border border-white/10 rounded-xl p-4">
                                <p className="text-text-muted text-xs uppercase mb-1">
                                    {status === 'nueva' && 'Nuevas'}
                                    {status === 'en_preparacion' && 'En Preparación'}
                                    {status === 'completada' && 'Completadas'}
                                    {status === 'cancelada' && 'Canceladas'}
                                </p>
                                <p className="text-white text-2xl font-bold">{count}</p>
                                {status === 'completada' && (
                                    <p className="text-accent text-sm mt-1">€{total.toFixed(2)}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleOrderUpdate}
            />
        </div>
    );
};

export default AdminOrderList;
