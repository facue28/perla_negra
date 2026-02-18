export interface OrderItem {
    id: string; // Product ID (input) or OrderItem ID (output context dependent)
    product_id?: string;
    name?: string; // Input
    product_name?: string; // Output
    product_image?: string;
    product_category?: string;
    price: number;
    quantity: number;
    subtotal?: number;
}

export interface CustomerInfo {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    notes?: string;
}

export interface CreateOrderInput {
    customerInfo: CustomerInfo;
    items: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        // Allow string quantity from inputs, to be parsed
    }[];
    couponCode?: string;
    idempotencyKey?: string;
}

export interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    address: string;
    city: string;
    delivery_notes?: string;
    status: 'nueva' | 'en_preparacion' | 'completada' | 'cancelada';
    subtotal: number;
    total: number;
    discount_amount?: number;
    created_at: string;
    order_items?: OrderItem[];
}
