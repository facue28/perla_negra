import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getOrderStats } from '@/features/orders/services/orderService';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeProducts: 0,
        activeCoupons: 0,
        totalSales: 0,
        recentOrders: 0,
        loading: true
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch all products count (no 'available' column exists)
            const { count: productCount, error: productError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Fetch active coupons count
            const { count: couponCount, error: couponError } = await supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('active', true);

            // Fetch order statistics
            const orderStats = await getOrderStats();

            if (!productError && !couponError) {
                setStats({
                    activeProducts: productCount || 0,
                    activeCoupons: couponCount || 0,
                    totalSales: orderStats.totalSales || 0,
                    recentOrders: orderStats.recentOrdersCount || 0,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="px-6 py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Bienvenido, {user?.email?.split('@')[0]} 👋</h1>
                <p className="text-text-muted">Aquí tienes un resumen de tu tienda hoy.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Products Card */}
                <Link
                    to="/admin/products"
                    className="bg-[#141414] border border-white/10 rounded-xl p-6 hover:border-[#3FFFC1]/30 transition-all group cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <span className="text-2xl">📦</span>
                        </div>
                        <span className="text-xs text-text-muted bg-white/5 py-1 px-2 rounded-full">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                        {stats.loading ? '--' : stats.activeProducts}
                    </h3>
                    <p className="text-sm text-text-muted">Productos</p>
                </Link>

                {/* Orders Card */}
                <Link
                    to="/admin/orders"
                    className="bg-[#141414] border border-white/10 rounded-xl p-6 hover:border-[#3FFFC1]/30 transition-all group cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <span className="text-2xl">📋</span>
                        </div>
                        <span className="text-xs text-text-muted bg-white/5 py-1 px-2 rounded-full">30 días</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                        {stats.loading ? '--' : stats.recentOrders}
                    </h3>
                    <p className="text-sm text-text-muted">Pedidos</p>
                </Link>

                {/* Sales Card */}
                <Link
                    to="/admin/orders?status=completada"
                    className="bg-[#141414] border border-white/10 rounded-xl p-6 hover:border-[#3FFFC1]/30 transition-all group cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                            <span className="text-2xl">💰</span>
                        </div>
                        <span className="text-xs text-text-muted bg-white/5 py-1 px-2 rounded-full">Completadas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                        {stats.loading ? '--' : `€${stats.totalSales.toFixed(2)}`}
                    </h3>
                    <p className="text-sm text-text-muted">Ventas Totales</p>
                </Link>

                {/* Coupons Card */}
                <Link
                    to="/admin/coupons"
                    className="bg-[#141414] border border-white/10 rounded-xl p-6 hover:border-[#3FFFC1]/30 transition-all group cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                            <span className="text-2xl">🎫</span>
                        </div>
                        <span className="text-xs text-text-muted bg-white/5 py-1 px-2 rounded-full">Activos</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                        {stats.loading ? '--' : stats.activeCoupons}
                    </h3>
                    <p className="text-sm text-text-muted">Cupones</p>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-[#141414]/50 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Atajos Rápidos</h3>
                    <div className="space-y-3">
                        <Link to="/admin/products/new" className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group">
                            <span className="font-medium">Agregar Nuevo Producto ➕</span>
                            <span className="text-white/20 group-hover:text-[#3FFFC1]">→</span>
                        </Link>
                        <Link to="/admin/coupons/new" className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group">
                            <span className="font-medium">Crear Cupón de Descuento 🏷️</span>
                            <span className="text-white/20 group-hover:text-[#3FFFC1]">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
