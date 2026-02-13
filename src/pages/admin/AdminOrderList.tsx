import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Eye, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '@/features/orders/services/orderService';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import { AdminOrder, OrderStatus as AdminOrderStatus } from '@/features/admin/types';

type OrderListStatus = 'all' | AdminOrderStatus;

const AdminOrderList: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<OrderListStatus>('all');
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async (): Promise<void> => {
        try {
            setLoading(true);
            const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
            const data = await getOrders(filters);
            setOrders((data as any) as AdminOrder[] || []);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            toast.error('Errore durante il caricamento degli ordini');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order: AdminOrder): void => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleOrderUpdate = (): void => {
        fetchOrders();
        setIsModalOpen(false);
    };

    const handleDeleteOrder = async (orderId: string | number): Promise<void> => {
        if (window.confirm('Sei sicuro di voler eliminare questo ordine? Questa azione cancellerà permanentemente la registrazione e i suoi articoli. Non può essere annullata.')) {
            try {
                setLoading(true);
                await deleteOrder(orderId.toString());
                toast.success('Ordine eliminato correttamente');
                await fetchOrders();
            } catch (error: any) {
                console.error('Error deleting order:', error);
                toast.error('Errore durante l\'eliminazione dell\'ordine: ' + error.message);
                setLoading(false);
            }
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseValue = (val: number | string | undefined): number => {
        if (val === undefined) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(val) || 0;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
            nueva: { label: 'Nuovo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            en_preparacion: { label: 'In Preparazione', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
            completada: { label: 'Completato', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
            cancelada: { label: 'Cancellato', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
        };

        const config = statusConfig[status] || statusConfig.nueva;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="px-4 md:px-6 py-6 md:py-8 space-y-6 text-text-primary">
            {/* Back Button */}
            <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors group mb-4"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Torna al Pannello</span>
            </Link>

            {/* Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-white mb-2">Ordini</h1>
                    <p className="text-text-muted">Gestisci la cronologia degli ordini e il loro stato</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Cerca per # ordine, cliente o telefono..."
                            value={searchTerm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white placeholder-text-muted transition-colors backdrop-blur-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-text-muted" />
                        <select
                            value={statusFilter}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as OrderListStatus)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors cursor-pointer [&>option]:bg-background-alt [&>option]:text-white"
                        >
                            <option value="all" className="bg-background-alt text-white">Tutti gli stati</option>
                            <option value="nueva" className="bg-background-alt text-white">Nuovo</option>
                            <option value="en_preparacion" className="bg-background-alt text-white">In Preparazione</option>
                            <option value="completada" className="bg-background-alt text-white">Completato</option>
                            <option value="cancelada" className="bg-background-alt text-white">Cancellato</option>
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
                                <th className="px-6 py-4 font-medium"># Ordine</th>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">Data</th>
                                <th className="px-6 py-4 font-medium text-right">Totale</th>
                                <th className="px-6 py-4 font-medium">Stato</th>
                                <th className="px-6 py-4 font-medium text-center">Azioni</th>
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
                                                €{parseValue(order.total).toFixed(2)}
                                            </span>
                                            {order.discount_amount !== undefined && parseValue(order.discount_amount) > 0 && (
                                                <p className="text-accent text-xs">
                                                    -{parseValue(order.discount_amount).toFixed(2)}€
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
                                                title="Vedi dettagli"
                                            >
                                                <Eye size={16} />
                                                <span className="text-sm font-medium">Vedi</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-2"
                                                title="Elimina ordine"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        <Package size={48} className="mx-auto mb-4 opacity-30" />
                                        <p>Nessun ordine trovato.</p>
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
                    {(['nueva', 'en_preparacion', 'completada', 'cancelada'] as const).map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        const total = orders
                            .filter(o => o.status === status)
                            .reduce((sum, o) => sum + parseValue(o.total), 0);

                        return (
                            <div key={status} className="bg-background-alt/50 border border-white/10 rounded-xl p-4">
                                <p className="text-text-muted text-xs uppercase mb-1">
                                    {status === 'nueva' && 'Nuovi'}
                                    {status === 'en_preparacion' && 'In Preparazione'}
                                    {status === 'completada' && 'Completati'}
                                    {status === 'cancelada' && 'Cancellati'}
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

