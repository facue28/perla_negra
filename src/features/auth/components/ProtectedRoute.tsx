import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import PageLoader from '@/components/ui/PageLoader';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <PageLoader />;

    // 1. Not Logged In -> Redirect to Login
    if (!user) return <Navigate to="/admin/login" replace />;

    // 2. Logged In but NOT Admin -> Show 403 Screen
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md w-full backdrop-blur-sm">
                    <h1 className="text-3xl font-serif text-red-500 mb-4">Acceso Restringido</h1>
                    <p className="text-gray-300 mb-6 font-light">
                        La cuenta <span className="font-medium text-white">{user.email}</span> no tiene permisos administrativos.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-black bg-[#3FFFC1] hover:bg-[#32cc9a] px-6 py-2 rounded-full font-medium transition-colors w-full uppercase tracking-widest text-xs"
                    >
                        Volver a la tienda
                    </button>
                    {/* Security Note: Real protection is handled by Supabase RLS on the database server. */}
                </div>
            </div>
        );
    }

    // 3. Authorized -> Show Children or Outlet
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

