import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import PageLoader from '@/components/ui/PageLoader';

const ProtectedRoute = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <PageLoader />;

    // 1. Not Logged In -> Redirect to Login
    if (!user) return <Navigate to="/admin/login" replace />;

    // 2. Logged In but NOT Admin -> Redirect to Home (Security)
    if (!isAdmin) return <Navigate to="/" replace />;

    // 3. Authorized -> Show Dashboard
    return <Outlet />;
};

export default ProtectedRoute;
