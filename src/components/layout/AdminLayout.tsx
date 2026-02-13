import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LayoutDashboard, Package, Ticket, LogOut, ExternalLink, LucideIcon, Menu, X } from 'lucide-react';
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
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const isActive = (path: string) => location.pathname === path;

    // Close sidebar when navigating on mobile
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Riepilogo', path: '/admin' },
        { icon: Package, label: 'Prodotti', path: '/admin/products' },
        { icon: Ticket, label: 'Coupon', path: '/admin/coupons' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
            <SEO title="Admin Panel" description="Pannello di Amministrazione" noIndex={true} />

            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-white/10 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <h1 className="font-signature text-2xl text-accent">Perla Negra</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-text-muted hover:text-white transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 lg:w-64 fixed lg:sticky top-0 left-0 lg:left-auto h-[100dvh] bg-[#141414]/98 lg:bg-[#141414]/90 backdrop-blur-md border-r border-white/10 flex flex-col z-40 lg:z-10
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header (Desktop) */}
                <div className="hidden lg:block p-8 border-b border-white/10">
                    <h1 className="font-signature text-3xl text-accent">Perla Negra</h1>
                    <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Pannello Admin</p>
                </div>

                {/* Header (Mobile Close Button) */}
                <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/10">
                    <span className="text-xs text-text-muted uppercase tracking-widest font-medium">Navigazione</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-text-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                        <span className="text-sm">Vedi Negozio</span>
                    </Link>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm">Esci</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 relative min-w-0">
                {/* Background Effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 lg:left-64 w-[500px] h-[500px] bg-[#3FFFC1]/5 rounded-full blur-[120px]" />
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
