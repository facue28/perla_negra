import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getOrderStats, getSalesChartData } from '@/features/orders/services/orderService';
import { TrendingUp, ShoppingCart, Package, Tag, Plus, List } from 'lucide-react';
import StatsCard from './components/StatsCard';
import SalesChart from './components/SalesChart';

interface DashboardStatsState {
    activeProducts: number;
    activeCoupons: number;
    totalSales: number;
    recentOrders: number;
    loading: boolean;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStatsState>({
        activeProducts: 0,
        activeCoupons: 0,
        totalSales: 0,
        recentOrders: 0,
        loading: true
    });
    const [salesChartData, setSalesChartData] = useState<{ date: string; total: number }[]>([]);

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setIsRefreshing(true);
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
            // Fetch sales chart data
            const chartData = await getSalesChartData(30);

            if (!productError && !couponError) {
                setStats({
                    activeProducts: productCount || 0,
                    activeCoupons: couponCount || 0,
                    totalSales: orderStats.totalSales || 0,
                    recentOrders: orderStats.recentOrdersCount || 0,
                    loading: false
                });
                setSalesChartData(chartData);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="px-6 py-8 space-y-8 fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white">
                        Hola, {user?.email?.split('@')[0]} 👋
                    </h1>
                    <p className="text-text-muted">
                        Aquí tienes el resumen de tu negocio hoy.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/"
                        target="_blank"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                        Ver Tienda
                    </Link>
                    <button
                        onClick={() => fetchStats()}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-[#3FFFC1]/10 text-[#3FFFC1] hover:bg-[#3FFFC1]/20 rounded-lg text-sm font-medium transition-colors border border-[#3FFFC1]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isRefreshing ? (
                            <>
                                <span className="animate-spin">↻</span> Actualizando...
                            </>
                        ) : (
                            'Actualizar'
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Ventas (30d)"
                    value={`€${stats.totalSales.toFixed(2)}`}
                    icon={TrendingUp}
                    color="green"
                />
                <StatsCard
                    title="Pedidos (30d)"
                    value={stats.recentOrders}
                    icon={ShoppingCart}
                    color="blue"
                />
                <StatsCard
                    title="Productos"
                    value={stats.activeProducts}
                    icon={Package}
                    color="purple"
                />
                <StatsCard
                    title="Cupones Activos"
                    value={stats.activeCoupons}
                    icon={Tag}
                    color="pink"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart - Spans 2 columns */}
                <div className="lg:col-span-2">
                    <SalesChart data={salesChartData} />
                </div>

                {/* Quick Actions & Low Stock (Placeholder for now) */}
                <div className="space-y-6">
                    <div className="bg-[#141414]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            <Link to="/admin/products/new" className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group border border-white/5 hover:border-[#3FFFC1]/20">
                                <div className="p-2 bg-[#3FFFC1]/10 rounded-lg text-[#3FFFC1]">
                                    <Plus size={18} />
                                </div>
                                <span className="font-medium text-sm">Nuevo Producto</span>
                            </Link>
                            <Link to="/admin/coupons/new" className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group border border-white/5 hover:border-[#3FFFC1]/20">
                                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                    <Tag size={18} />
                                </div>
                                <span className="font-medium text-sm">Crear Cupón</span>
                            </Link>
                            <Link to="/admin/orders" className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group border border-white/5 hover:border-[#3FFFC1]/20">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <List size={18} />
                                </div>
                                <span className="font-medium text-sm">Gestionar Pedidos</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

