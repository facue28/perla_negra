import { Product } from '@/features/products/types';

export interface CartItem extends Product {
    quantity: number;
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

export interface Coupon {
    code: string;
    discount_type: 'percentage' | 'fixed' | 'percent';
    value: number;
}

export interface CartContextType {
    cart: CartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartSubtotal: () => number;
    getCartCount: () => number;
    discount: Coupon | null;
    applyCoupon: (coupon: Coupon) => void;
    removeCoupon: () => void;
}

export interface CheckoutFormData {
    nombre: string;
    telefono: string;
    indirizzo: string;
    civico: string;
    citta: string;
    provincia: string;
    cap: string;
    dettagli: string;
    note: string;
    metodoEnvio: string;
    latitude: number | null;
    longitude: number | null;
    website: string; // Honeypot
}

export interface SuccessData {
    orderNumber: string;
    whatsappUrl: string;
    messageBody: string;
}

