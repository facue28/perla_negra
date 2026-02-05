import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '@/features/cart/context/CartContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';

const AppProviders = ({ children }) => {
    return (
        <HelmetProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </AuthProvider>
        </HelmetProvider>
    );
};

export default AppProviders;
