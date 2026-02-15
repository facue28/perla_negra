import { lazy, Suspense } from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import MainLayout from '@/app/MainLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import PageLoader from '@/components/ui/PageLoader';

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

// Admin Pages
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProductList = lazy(() => import('@/pages/admin/AdminProductList'));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'));
const AdminCouponList = lazy(() => import('@/pages/admin/AdminCouponList'));
const AdminCouponForm = lazy(() => import('@/pages/admin/AdminCouponForm'));
const AdminOrderList = lazy(() => import('@/pages/admin/AdminOrderList'));
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Main Layout Wraps All Routes */}
            <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="chi-sono" element={<ChiSonoPage />} />
                <Route path="prodotti" element={<ProductListPage />} />
                <Route path="prodotti/:slug" element={<ProductDetailPage />} />
                <Route path="contatti" element={<ContactPage />} />
                <Route path="carrello" element={<CartPage />} />
                <Route path="rivenditori" element={<ResellerPage />} />

                {/* Legal Routes */}
                <Route path="termini-e-condizioni" element={<TermsPage />} />
                <Route path="privacy-policy" element={<PrivacyPage />} />
                <Route path="uso-responsabile" element={<ResponsibleUsePage />} />
                <Route path="adulto" element={<TermsPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Routes (Separate Layout potentially) */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Admin Zone */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                        <AdminLayout>
                            <Outlet />
                        </AdminLayout>
                    </Suspense>
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
