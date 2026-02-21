import { createContext, useState, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { CartContextType, CartItem, Coupon } from '../types';
import { Product } from '@/features/products/types';
import { toast } from 'sonner';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    // 1. Robust Persistence Initialization
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const localData = localStorage.getItem('perla_cart');
            if (!localData) return [];

            const parsed = JSON.parse(localData);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Failed to parse cart from localStorage:', error);
            return [];
        }
    });

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [discount, setDiscount] = useState<Coupon | null>(null);

    // 2. Persistence Effect with Error Handling
    useEffect(() => {
        try {
            localStorage.setItem('perla_cart', JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
            // Optional: Toast user if storage is full
        }
    }, [items]);

    // 3. Optimized Actions (Stable References)
    const addItem = useCallback((product: Product, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                // Return new array with updated item to ensure immutability
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
                return newItems;
            }

            // Add new item properly typed
            // Ensure we don't accidentally carry over undefined values if Product type is loose
            const newItem: CartItem = {
                ...product,
                quantity
            };
            return [...prevItems, newItem];
        });

        // Optimistic UI Feedback
        toast.success('Prodotto aggiunto al carrello');
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        setDiscount(null);
    }, []);

    const applyCoupon = useCallback((couponData: Coupon) => {
        setDiscount(couponData);
    }, []);

    const removeCoupon = useCallback(() => {
        setDiscount(null);
    }, []);

    // 4. Derived State (Memoized)
    const { subtotal, itemCount } = useMemo(() => {
        return items.reduce((acc, item) => ({
            subtotal: acc.subtotal + (item.price * item.quantity),
            itemCount: acc.itemCount + item.quantity
        }), { subtotal: 0, itemCount: 0 });
    }, [items]);

    const total = useMemo(() => {
        if (!discount) return subtotal;

        let finalTotal = subtotal;
        if (discount.discount_type === 'percentage' || discount.discount_type === 'percent') {
            finalTotal = subtotal - (subtotal * (discount.value / 100));
        } else if (discount.discount_type === 'fixed') {
            finalTotal = Math.max(0, subtotal - discount.value);
        }
        return finalTotal;
    }, [subtotal, discount]);

    // 5. Context Value Memoization
    const value = useMemo<CartContextType>(() => ({
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        subtotal,
        itemCount,
        discount,
        applyCoupon,
        removeCoupon
    }), [
        items,
        isOpen,
        total,
        subtotal,
        itemCount,
        discount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon
    ]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
