import { createContext, useState, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { CartContextType, CartItem, Coupon } from '../types';
import { Product } from '@/features/products/types';

/*
1.  **Contextos y Hooks**:
 - [x] Phase 6 Checkout: `Select.tsx`, `AddressAutocomplete.tsx`, `CartContext.tsx`, `orderService.ts`, `OrderConfirmationModal.tsx`, `CartPage.tsx`, `couponService.ts`, `whatsappGenerator.ts`, `SEO.tsx`
 - [x] Phase 7 Auth & Hooks: `AuthContext.tsx`, `ProtectedRoute.tsx`, `types.ts`, `TermsPage.tsx`, `PrivacyPage.tsx`, `ResponsibleUsePage.tsx`, `CookieConsent.tsx`
    *   `AuthContext.jsx` -> `AuthContext.tsx`.
    *   Hooks personalizados (`useProducts`, `useForm`).

*/

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        // Try to load from localStorage
        try {
            const localData = localStorage.getItem('perla_cart');
            return localData ? JSON.parse(localData) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [discount, setDiscount] = useState<Coupon | null>(null); // { code, type, value }

    useEffect(() => {
        localStorage.setItem('perla_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product: Product, quantity: number = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setDiscount(null);
    }, []);

    const applyCoupon = useCallback((couponData: Coupon) => {
        setDiscount(couponData);
    }, []);

    const removeCoupon = useCallback(() => {
        setDiscount(null);
    }, []);

    // Subtotal without discount
    // Subtotal without discount
    const getCartSubtotal = useCallback((): number => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    // Calculate final total with discount
    // Memoizing the result instead of the function getter might be better, but keeping API consistent
    const getCartTotal = useCallback((): number => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (!discount) return subtotal;

        if (discount.discount_type === 'percentage' || discount.discount_type === 'percent') {
            return subtotal - (subtotal * (discount.value / 100));
        } else if (discount.discount_type === 'fixed') {
            return Math.max(0, subtotal - discount.value);
        }
        return subtotal;
    }, [cart, discount]);

    const getCartCount = useCallback((): number => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    const value = useMemo<CartContextType>(() => ({
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartSubtotal,
        getCartCount,
        discount,
        applyCoupon,
        removeCoupon
    }), [
        cart,
        isCartOpen,
        discount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartSubtotal,
        getCartCount,
        applyCoupon,
        removeCoupon
    ]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
