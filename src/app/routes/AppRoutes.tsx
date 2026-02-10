import { lazy } from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import MainLayout from '@/app/MainLayout';
import NotFoundPage from '@/pages/NotFoundPage';

// Lazy load AdminLayout (only loads when accessing /admin routes)
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));

// Lazy Loaded Pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const ChiSonoPage = lazy(() => import('@/pages/ChiSonoPage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const ResellerPage = lazy(() => import('@/pages/ResellerPage'));

// Legal Pages (Lazy)
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const ResponsibleUsePage = lazy(() => import('@/pages/legal/ResponsibleUsePage'));

// Admin Pages (Lazy - only load when accessing admin)
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProductList = lazy(() => import('@/pages/admin/AdminProductList'));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'));
const AdminCouponList = lazy(() => import('@/pages/admin/AdminCouponList'));
const AdminCouponForm = lazy(() => import('@/pages/admin/AdminCouponForm'));
const AdminOrderList = lazy(() => import('@/pages/admin/AdminOrderList'));
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Main Public Routes - Wrapped in MainLayout (Header/Footer) */}
            <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="chi-sono" element={<ChiSonoPage />} />
                <Route path="productos" element={<ProductListPage />} />
                <Route path="productos/:slug" element={<ProductDetailPage />} />
                <Route path="contacto" element={<ContactPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="revendedores" element={<ResellerPage />} />

                {/* Legal Routes */}
                <Route path="termini" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="uso" element={<ResponsibleUsePage />} />
                <Route path="adulto" element={<TermsPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Login (No Layout) */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Admin Zone - Separate from MainLayout */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminLayout>
                        <Outlet />
                    </AdminLayout>
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductList />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id" element={<AdminProductForm />} />
                <Route path="coupons" element={<AdminCouponList />} />
                <Route path="coupons/new" element={<AdminCouponForm />} />
                <Route path="coupons/:id" element={<AdminCouponForm />} />
                <Route path="orders" element={<AdminOrderList />} />
            </Route>
        </Routes>
    );
};
