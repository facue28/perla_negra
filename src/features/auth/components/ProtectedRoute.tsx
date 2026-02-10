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

    // 2. Logged In but NOT Admin -> Redirect to Home (Security)
    if (!isAdmin) return <Navigate to="/" replace />;

    // 3. Authorized -> Show Children or Outlet
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

