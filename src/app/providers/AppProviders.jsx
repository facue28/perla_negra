import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '@/features/cart/context/CartContext';

const AppProviders = ({ children }) => {
    return (
        <HelmetProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </HelmetProvider>
    );
};

export default AppProviders;
