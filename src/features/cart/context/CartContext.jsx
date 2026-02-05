import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Try to load from localStorage
        try {
            const localData = localStorage.getItem('perla_cart');
            return localData ? JSON.parse(localData) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [discount, setDiscount] = useState(null); // { code, type, value }

    useEffect(() => {
        localStorage.setItem('perla_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product, quantity = 1) => {
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

    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, newQuantity) => {
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

    const applyCoupon = useCallback((couponData) => {
        setDiscount(couponData);
    }, []);

    const removeCoupon = useCallback(() => {
        setDiscount(null);
    }, []);

    // Subtotal without discount
    const getCartSubtotal = useCallback(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    // Calculate final total with discount
    // Memoizing the result instead of the function getter might be better, but keeping API consistent
    const getCartTotal = useCallback(() => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (!discount) return subtotal;

        if (discount.discount_type === 'percentage' || discount.discount_type === 'percent') {
            return subtotal - (subtotal * (discount.value / 100));
        } else if (discount.discount_type === 'fixed') {
            return Math.max(0, subtotal - discount.value);
        }
        return subtotal;
    }, [cart, discount]);

    const getCartCount = useCallback(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    const value = useMemo(() => ({
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
