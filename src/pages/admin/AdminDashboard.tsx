import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardKPI } from '@/components/admin/DashboardKPI';
import { SalesChart } from '@/components/admin/SalesChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { DashboardStats, DailySales, AdminLog } from '@/types/admin';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Plus, Tag, List } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<DailySales[]>([]);
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Stats (RPC)
            const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats');

            if (statsError) {
                // Determine if error is "function not found" (migration needed)
                if (statsError.message.includes('function get_dashboard_stats() does not exist')) {
                    console.warn("RPC function missing. Waiting for migration.");
                } else {
                    throw statsError;
                }
            } else {
                setStats(statsData as DashboardStats);
            }

            // 2. Fetch Chart Data (RPC)
            const { data: chartData, error: chartError } = await supabase.rpc('get_daily_sales_chart');
            if (chartError && !chartError.message.includes('function get_daily_sales_chart() does not exist')) {
                throw chartError;
            }
            if (chartData) setSalesData(chartData as DailySales[]);

            // 3. Fetch Logs (Table)
            const { data: logsData, error: logsError } = await supabase
                .from('admin_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (!logsError) {
                setLogs(logsData as AdminLog[]);
            }

        } catch (error) {
            console.error('Dashboard Error:', error);
            toast.error("Error al cargar datos. Verifica que el SQL de migración se haya ejecutado.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 p-6 pb-16 fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white font-display">
                        Hola, {user?.email?.split('@')[0]} 👋
                    </h2>
                    <p className="text-text-muted">
                        Resumen de actividad en tiempo real.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2 bg-[#3FFFC1]/10 text-[#3FFFC1] hover:bg-[#3FFFC1]/20 rounded-lg text-sm font-medium transition-colors border border-[#3FFFC1]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">↻</span> Actualizando...
                            </>
                        ) : (
                            'Actualizar'
                        )}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <DashboardKPI stats={stats} loading={loading} />

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
                {/* Sales Chart (Takes 4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <SalesChart data={salesData} loading={loading} />

                    {/* Quick Actions (Moved below chart on desktop) */}
                    <div className="bg-background-alt border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/admin/products/new" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group border border-white/5 hover:border-[#3FFFC1]/20">
                                <div className="p-2 bg-[#3FFFC1]/10 rounded-lg text-[#3FFFC1]">
                                    <Plus size={18} />
                                </div>
                                <span className="font-medium text-sm">Nuevo Producto</span>
                            </Link>
                            <Link to="/admin/coupons/new" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group border border-white/5 hover:border-[#3FFFC1]/20">
                                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                    <Tag size={18} />
                                </div>
                                <span className="font-medium text-sm">Crear Cupón</span>
                            </Link>
                            <Link to="/admin/orders" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-[#3FFFC1]/10 hover:text-[#3FFFC1] transition-all group border border-white/5 hover:border-[#3FFFC1]/20">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <List size={18} />
                                </div>
                                <span className="font-medium text-sm">Gestionar Pedidos</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity (Takes 3 columns) */}
                <div className="lg:col-span-3">
                    <RecentActivity logs={logs} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
