import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LayoutDashboard, Package, Ticket, LogOut, ExternalLink, LucideIcon } from 'lucide-react';
import SEO from '@/components/ui/SEO';

interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Resumen', path: '/admin' },
        { icon: Package, label: 'Productos', path: '/admin/products' },
        { icon: Ticket, label: 'Cupones', path: '/admin/coupons' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            <SEO title="Admin Panel" description="Panel de administración" noIndex={true} />
            {/* Sidebar */}
            <aside className="w-64 fixed top-0 left-0 h-full bg-[#141414]/90 backdrop-blur-md border-r border-white/10 flex flex-col z-20">
                {/* Header */}
                <div className="p-8 border-b border-white/10">
                    <h1 className="font-signature text-3xl text-accent">Perla Negra</h1>
                    <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Panel Admin</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive(item.path)
                                ? 'bg-[#3FFFC1]/10 text-[#3FFFC1] border border-[#3FFFC1]/20'
                                : 'text-text-muted hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ExternalLink size={20} />
                        <span className="text-sm">Ver Tienda</span>
                    </Link>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 relative">
                {/* Background Effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-[#3FFFC1]/5 rounded-full blur-[120px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
