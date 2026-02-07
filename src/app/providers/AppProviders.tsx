import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '@/features/cart/context/CartContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';

import { ReactNode } from 'react';

const AppProviders = ({ children }: { children: ReactNode }) => {
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
