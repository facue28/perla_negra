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
    items: CartItem[]; // Renamed from 'cart' for clarity, though 'cart' is also fine. Let's stick to user request 'items'. User said "Separar el Estado (items, total, count)".
    isOpen: boolean; // Renamed from isCartOpen to match shorter style? No, keep isCartOpen to avoid confusion with internal state.
    setIsOpen: (isOpen: boolean) => void;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    subtotal: number;
    itemCount: number;
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

