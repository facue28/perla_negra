import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Tag, Percent, Calendar, AlertCircle, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AdminCoupon } from '@/features/admin/types';

const AdminCouponList: React.FC = () => {
    const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async (): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const normalizedData: AdminCoupon[] = (data || []).map(item => ({
                id: item.id,
                code: item.code,
                discount_type: item.discount_type as any,
                discount_value: item.discount_value ?? item.value,
                is_active: item.is_active ?? item.active,
                expiration_date: item.expiration_date ?? item.expires_at,
                usage_count: item.usage_count ?? 0,
                usage_limit: item.usage_limit ?? null,
                min_purchase_amount: item.min_purchase_amount ?? null,
                created_at: item.created_at
            }));

            setCoupons(normalizedData);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Error al cargar cupones');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string | number): Promise<void> => {
        if (!window.confirm('¿Estás seguro de eliminar este cupón? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCoupons(coupons.filter(c => c.id !== id));
            toast.success('Cupón eliminado');
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Error al eliminar cupón');
        }
    };

    const toggleStatus = async (id: string | number, currentStatus: boolean): Promise<void> => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setCoupons(coupons.map(c =>
                c.id === id ? { ...c, is_active: !currentStatus } : c
            ));
            toast.success(`Cupón ${!currentStatus ? 'activado' : 'desactivado'}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar estado');
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Sin expiración';
        return new Date(dateString).toLocaleDateString();
    };

    const isExpired = (dateString: string | null): boolean => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
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
                    <h1 className="text-3xl font-playfair font-bold text-white mb-2">Cupones</h1>
                    <p className="text-text-muted">Gestiona códigos de descuento y promociones</p>
                </div>

                {/* Search and Action Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por código..."
                            value={searchTerm}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white placeholder-text-muted transition-colors backdrop-blur-sm"
                        />
                    </div>

                    {/* New Coupon Button */}
                    <Link
                        to="/admin/coupons/new"
                        className="flex items-center gap-2 px-6 py-3 bg-accent text-background-dark rounded-full font-bold hover:bg-accent-light transition-colors shadow-lg shadow-accent/20 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Nuevo Cupón
                    </Link>
                </div>
            </div>

            {/* Coupons Grid/Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-text-muted text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Código</th>
                                <th className="px-6 py-4 font-medium">Descuento</th>
                                <th className="px-6 py-4 font-medium">Expiración</th>
                                <th className="px-6 py-4 font-medium">Usos</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredCoupons.length > 0 ? (
                                filteredCoupons.map((coupon) => (
                                    <motion.tr
                                        key={coupon.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Tag size={16} className="text-accent" />
                                                <span className="font-mono font-bold text-white text-lg tracking-wide">{coupon.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-white font-medium">
                                                {(coupon.discount_type === 'percent' || coupon.discount_type === 'percentage') ? (
                                                    <Percent size={14} className="text-text-muted" />
                                                ) : '€'}
                                                {coupon.discount_value}
                                                {(coupon.discount_type === 'percent' || coupon.discount_type === 'percentage') && '%'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 text-sm ${isExpired(coupon.expiration_date) ? 'text-red-400' : 'text-text-muted'}`}>
                                                <Calendar size={14} />
                                                {formatDate(coupon.expiration_date)}
                                                {isExpired(coupon.expiration_date) && <AlertCircle size={12} />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-sm">
                                            {coupon.usage_count ?? 0} / {coupon.usage_limit || '∞'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${coupon.is_active
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                    }`}
                                            >
                                                {coupon.is_active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/coupons/${coupon.id}`}
                                                    className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Modificar"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        No tienes cupones creados aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCouponList;

